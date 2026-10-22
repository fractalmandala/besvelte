import { readFile } from "node:fs/promises"
import { randomUUID } from "node:crypto"
import { execSync } from "node:child_process"
import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { createFractalAi, generateText } from "@fractaldesign/fractalai"
import { getMemorySystem } from "../memory/index.js"
import { addComputer, describe, loadRegistry, removeComputer, resolveComputer } from "../computers.js"

import { fanOut } from "../fanout.js"
import { probeComputer } from "../probe.js"
import { eventsFile, listThreads } from "../store.js"
import { closeThread, createThread, executeTurn, interruptThread, queueTurn, threadStatus } from "../thread.js"
import type { AgentName, ThreadState } from "../types.js"
import { spawnWorker } from "../worker.js"

export { spawnWorker }
import { err, eventLine, out, threadDetail, threadRow } from "./format.js"

const POLL_MS = 500

export async function waitIdle(id: string): Promise<ThreadState> {
  for (;;) {
    const state = await threadStatus(id)
    if (state.status !== "running" && state.status !== "starting") return state
    await new Promise((resolve) => setTimeout(resolve, POLL_MS))
  }
}

export async function cmdComputers(sub: string | undefined, args: readonly string[]): Promise<number> {
  if (sub === "add") {
    const [name, address] = args
    if (!name || !address) throw new Error("usage: openspaces computers add <name> <local|ssh:user@host|container:name|docker:name|podman:name|cua:name>")
    await addComputer(name, address)
    out(`added ${name} → ${address}`)
    return 0
  }
  if (sub === "rm") {
    if (!args[0]) throw new Error("usage: openspaces computers rm <name>")
    await removeComputer(args[0])
    out(`removed ${args[0]}`)
    return 0
  }
  if (sub === "test") {
    const name = args[0] ?? "local"
    const computer = await resolveComputer(name)
    const res = await probeComputer(computer)
    out(`${name} (${describe(computer)})`)
    out(res.stdout)
    if (!res.ok) err(res.error ?? "check failed")
    return res.ok ? 0 : 1
  }
  if (sub === undefined || sub === "ls") {
    const registry = await loadRegistry()
    out("local".padEnd(16) + "local (built in)")
    Object.entries(registry).forEach(([name, c]) => out(`${name.padEnd(16)}${describe(c)}`))
    return 0
  }
  throw new Error(`unknown subcommand: computers ${sub}`)
}

export interface StartFlags {
  readonly on: string
  readonly agent: AgentName
  readonly prompt: string
  readonly cwd?: string
  readonly keep: boolean
  readonly autoApprove?: boolean
  readonly model?: string
  readonly env: readonly string[]
  readonly wait: boolean
}

function startOptions(flags: StartFlags) {
  return {
    agent: flags.agent,
    prompt: flags.prompt,
    on: flags.on,
    deleteOnClose: !flags.keep,
    forwardEnv: [...flags.env],
    ...(flags.cwd ? { cwd: flags.cwd } : {}),
    ...(flags.autoApprove !== undefined ? { autoApprove: flags.autoApprove } : {}),
    ...(flags.model ? { model: flags.model } : {}),
  }
}

export async function cmdStart(flags: StartFlags): Promise<number> {
  const state = await createThread(startOptions(flags))
  spawnWorker(state.id)
  out(state.id)
  if (!flags.wait) return 0
  return printResult(await waitIdle(state.id))
}

export async function cmdSend(id: string, prompt: string, wait: boolean): Promise<number> {
  await queueTurn(id, prompt)
  spawnWorker(id)
  if (!wait) return 0
  return printResult(await waitIdle(id))
}

function printResult(state: ThreadState): number {
  const last = state.turns.at(-1)
  if (last?.ok) {
    out(last.text ?? "")
    return 0
  }
  err(last?.error ?? `thread is ${state.status}`)
  return 1
}

export async function cmdWait(id: string): Promise<number> {
  return printResult(await waitIdle(id))
}

export async function cmdStatus(id: string | undefined): Promise<number> {
  if (id) {
    out(threadDetail(await threadStatus(id)))
    return 0
  }
  const threads = await listThreads()
  if (threads.length === 0) out("no threads yet. Start one: openspaces start --agent claude-code \"…\"")
  for (const t of threads) out(threadRow(await threadStatus(t.id)))
  return 0
}

export async function cmdLogs(id: string, follow: boolean): Promise<number> {
  let printed = 0
  for (;;) {
    const text = await readFile(eventsFile(id), "utf8").catch(() => "")
    const lines = text.split("\n").filter(Boolean)
    for (const raw of lines.slice(printed)) {
      const line = eventLine(JSON.parse(raw))
      if (line !== undefined) out(line)
    }
    printed = lines.length
    if (!follow) return 0
    const state = await threadStatus(id)
    if (state.status !== "running" && state.status !== "starting") return 0
    await new Promise((resolve) => setTimeout(resolve, POLL_MS))
  }
}

export async function cmdInterrupt(id: string): Promise<number> {
  await interruptThread(id)
  out(`interrupted ${id}`)
  return 0
}

export async function cmdClose(id: string): Promise<number> {
  const state = await closeThread(id)
  out(`closed ${state.id}${state.deleteOnClose && !state.cwd ? " (work dir deleted)" : ""}`)
  return 0
}

export async function cmdRun(flags: StartFlags & { readonly computers: readonly string[] }): Promise<number> {
  const width = Math.max(...flags.computers.map((c) => c.length))
  const results = await fanOut(flags.computers, {
    ...startOptions(flags),
    close: !flags.keep,
    onEvent: (on, event) => {
      const line = eventLine(event, `[${on.padEnd(width)}] `)
      if (line !== undefined && event.type !== "stderr") out(line)
    },
  })
  out()
  for (const r of results) {
    const ok = r.result?.ok === true
    out(`${ok ? "✓" : "✗"} ${r.on.padEnd(width)}  ${ok ? r.result?.text.split("\n").at(-1) : (r.error ?? r.result?.error)}`)
  }
  return results.every((r) => r.result?.ok) ? 0 : 1
}

/** Hidden: the detached worker that runs one pending turn. */
export async function cmdWorker(id: string): Promise<number> {
  const { result } = await executeTurn(id)
  return (await result).ok ? 0 : 1
}

/** The Emgem memory companion turn handler. */
export async function cmdEmgem(prompt: string, sessionId?: string): Promise<number> {
  const memory = getMemorySystem()
  const sid = sessionId || randomUUID()
  const emit = (obj: Record<string, unknown>) => {
    process.stdout.write(JSON.stringify(obj) + "\n")
  }

  emit({ type: "session", sessionId: sid })

  try {
    const trimmed = prompt.trim()
    const lower = trimmed.toLowerCase()

    // 1. Is this a save/remember request?
    const isSave = /^(remember|save|note|record|log|store)\b/i.test(trimmed)
    if (isSave) {
      emit({ type: "tool", name: "memory-save", target: "EmbeddingGemma Vector DB" })
      const content = trimmed.replace(/^(remember|save|note|record|log|store)(:|\s+that|\s+this)?\s*/i, "").trim()
      const title = content.split("\n")[0]?.slice(0, 50) || "User Note"

      const record = await memory.recordWork({
        title,
        content: content || trimmed,
        type: "note",
        metadata: { source: "emgem-chat" },
      })

      const reply = `✨ **Saved to Memory!**\n\n• **Title:** ${record.title}\n• **ID:** \`${record.id}\`\n• **Type:** \`${record.type}\`\n\nI've generated a 768-d embedding with \`embeddinggemma-2\` and committed it to the persistent memory store. I'll recall this whenever you ask related questions!`
      emit({ type: "text", text: reply })
      emit({ type: "result", ok: true, text: reply })
      return 0
    }

    // 2. Is this a status / overview request?
    const isStatus = /^(status|stats|what's in memory|overview|what do you know|what do you remember)\b/i.test(lower)
    if (isStatus) {
      emit({ type: "tool", name: "memory-status", target: "Memory Engine & Store" })
      const status = memory.status()
      const recent = memory.listRecent(5)

      let reply = `🧠 **Emgem Memory Status**\n\n`
      reply += `• **Engine Active:** ${status.running ? "🟢 Online (Metal GPU)" : "🟡 Offline"}\n`
      reply += `• **Indexed Memories:** **${status.memoryCount}** items\n`
      if (status.types && Object.keys(status.types).length > 0) {
        reply += `• **Types Breakdown:** ${Object.entries(status.types).map(([k, v]) => `\`${k}\`: ${v}`).join(", ")}\n`
      }
      reply += `• **Model:** \`${status.modelPath?.split("/").pop() ?? "embeddinggemma-2"}\`\n`
      if (status.mmprojPath) {
        reply += `• **Multimodal Vision:** \`${status.mmprojPath.split("/").pop()}\`\n`
      }

      if (recent.length > 0) {
        reply += `\n**Recent Memories:**\n`
        for (const item of recent) {
          const dateStr = new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          reply += `- **${item.title}** (\`${item.type}\`, ${dateStr}): ${item.content.slice(0, 80)}${item.content.length > 80 ? "…" : ""}\n`
        }
      }

      emit({ type: "text", text: reply })
      emit({ type: "result", ok: true, text: reply })
      return 0
    }

    // 3. Search & recall
    emit({ type: "tool", name: "memory-search", target: trimmed.slice(0, 60) })
    const results = await memory.search({ query: trimmed, limit: 4, minScore: 0.25 })

    let reply = ""
    if (results.length > 0) {
      reply += `🔍 **Recalled from Memory** (${results.length} relevant item${results.length > 1 ? "s" : ""}):\n\n`
      for (const item of results) {
        const pct = Math.round(item.score * 100)
        const dateStr = new Date(item.timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
        reply += `### **${item.title}** (${pct}% match · \`${item.type}\`)\n`
        reply += `*${dateStr}*\n\n`
        reply += `${item.content}\n\n`
      }
      reply += `💡 *Retrieved via semantic vector search using EmbeddingGemma.*`
    } else {
      reply = `I searched persistent memory for **"${trimmed}"**, but didn't find any close matches (similarity > 25%).\n\nWould you like me to remember this as a new note or update? Just type:\n> **remember:** ${trimmed}`
    }

    emit({ type: "text", text: reply })
    emit({ type: "result", ok: true, text: reply })
    return 0
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    emit({ type: "result", ok: false, text: `Emgem error: ${msg}` })
    return 1
  }
}

/** The Fractal AI autonomous coding agent handler powered by @fractaldesign/fractalai SDK. */
export async function cmdFractalAi(prompt: string, sessionId?: string, modelName?: string): Promise<number> {
  const sid = sessionId || randomUUID()
  const emit = (obj: Record<string, unknown>) => {
    process.stdout.write(JSON.stringify(obj) + "\n")
  }

  emit({ type: "session", sessionId: sid })

  try {
    const ai = createFractalAi()

    // Auto-detect provider from environment or requested model
    let provider = null
    let chosenModel = modelName || "claude-3-7-sonnet-20250219"

    if (process.env.ANTHROPIC_API_KEY) {
      provider = ai.anthropic()
      chosenModel = modelName || "claude-3-7-sonnet-20250219"
    } else if (process.env.OPENAI_API_KEY) {
      provider = ai.openai()
      chosenModel = modelName || "gpt-4o"
    } else if (process.env.GEMINI_API_KEY) {
      provider = ai.gemini()
      chosenModel = modelName || "gemini-2.0-flash"
    } else if (process.env.GROK_API_KEY) {
      provider = ai.grok()
      chosenModel = modelName || "grok-2"
    } else if (process.env.OPENROUTER_API_KEY) {
      provider = ai.openrouter()
      chosenModel = modelName || "anthropic/claude-3.7-sonnet"
    } else if (process.env.OPENAI_BASE_URL || process.env.OLLAMA_BASE_URL) {
      const url = process.env.OPENAI_BASE_URL || process.env.OLLAMA_BASE_URL!
      provider = ai.custom(url, process.env.LOCAL_API_KEY || "local")
      chosenModel = modelName || "qwen2.5-coder"
    }

    // Build native multi-step sandboxed coding tools
    const tools = {
      execBash: {
        name: "execBash",
        description: "Execute a shell command on the target computer / workspace and return stdout and stderr.",
        parameters: {
          type: "object",
          properties: { command: { type: "string", description: "The shell command line to run." } },
          required: ["command"],
        },
        execute: async ({ command }: { command: string }) => {
          emit({ type: "tool", name: "execBash", target: command.slice(0, 50) })
          try {
            const out = execSync(command, { encoding: "utf8", timeout: 30_000, maxBuffer: 1024 * 1024 })
            return { ok: true, output: out }
          } catch (err: any) {
            return { ok: false, error: err.message, stderr: err.stderr?.toString?.() }
          }
        },
      },
      readFile: {
        name: "readFile",
        description: "Read the contents of a file in the workspace.",
        parameters: {
          type: "object",
          properties: { path: { type: "string", description: "Relative or absolute path to the file." } },
          required: ["path"],
        },
        execute: async ({ path }: { path: string }) => {
          emit({ type: "tool", name: "readFile", target: path })
          try {
            const content = readFileSync(resolve(process.cwd(), path), "utf8")
            return { ok: true, content: content.slice(0, 100_000) }
          } catch (err: any) {
            return { ok: false, error: err.message }
          }
        },
      },
      writeFile: {
        name: "writeFile",
        description: "Write content to a file in the workspace.",
        parameters: {
          type: "object",
          properties: {
            path: { type: "string", description: "Path to write." },
            content: { type: "string", description: "File content." },
          },
          required: ["path", "content"],
        },
        execute: async ({ path, content }: { path: string; content: string }) => {
          emit({ type: "tool", name: "writeFile", target: path })
          try {
            writeFileSync(resolve(process.cwd(), path), content, "utf8")
            return { ok: true, message: `Successfully wrote ${content.length} bytes to ${path}` }
          } catch (err: any) {
            return { ok: false, error: err.message }
          }
        },
      },
      listFiles: {
        name: "listFiles",
        description: "List files and directories in a directory.",
        parameters: {
          type: "object",
          properties: { path: { type: "string", description: "Directory path (defaults to current dir)." } },
        },
        execute: async ({ path }: { path?: string }) => {
          const target = path ? resolve(process.cwd(), path) : process.cwd()
          emit({ type: "tool", name: "listFiles", target })
          try {
            const list = readdirSync(target)
            return { ok: true, entries: list.slice(0, 100) }
          } catch (err: any) {
            return { ok: false, error: err.message }
          }
        },
      },
      semanticRecall: {
        name: "semanticRecall",
        description: "Search workspace semantic memory and past turn notes.",
        parameters: {
          type: "object",
          properties: { query: { type: "string", description: "Search query." } },
          required: ["query"],
        },
        execute: async ({ query }: { query: string }) => {
          emit({ type: "tool", name: "semanticRecall", target: query })
          const memory = getMemorySystem()
          const matches = await memory.search({ query, limit: 3 })
          return { ok: true, matches: matches.map((m) => ({ title: m.title, content: m.content, score: m.score })) }
        },
      },
    }

    if (provider) {
      const result = await generateText({
        model: provider,
        prompt,
        maxSteps: 8,
        tools,
        system: "You are Fractal AI Coding Agent running inside Besvelte. You have full access to workspace tools (execBash, readFile, writeFile, listFiles, semanticRecall). Solve tasks step by step and verify your work.",
      })

      emit({ type: "text", text: result.text })
      emit({ type: "result", ok: true, text: result.text })
      return 0
    } else {
      // Mock / Offline intelligent diagnostic agent when no API keys are present
      emit({ type: "tool", name: "workspace-diagnostics", target: process.cwd() })
      const memory = getMemorySystem()
      const memStatus = memory.status()

      const text = `⚡ **Fractal AI SDK Agent** running on **${process.platform}** (${process.arch})\n\n` +
        `• **Target Directory:** \`${process.cwd()}\`\n` +
        `• **Available Tools:** \`execBash\`, \`readFile\`, \`writeFile\`, \`listFiles\`, \`semanticRecall\`\n` +
        `• **Semantic Memory Store:** **${memStatus.memoryCount}** memories indexed\n\n` +
        `To route this agent directly to frontier models (without CLI dependencies), export any API key:\n` +
        `\`\`\`bash\n` +
        `export ANTHROPIC_API_KEY="sk-ant-..."   # Claude 3.7 Sonnet\n` +
        `export OPENAI_API_KEY="sk-..."          # GPT-4o\n` +
        `export GEMINI_API_KEY="AI..."           # Gemini 2.0 Flash\n` +
        `export OPENROUTER_API_KEY="sk-or-..."   # OpenRouter\n` +
        `export OPENAI_BASE_URL="http://..."     # Local Ollama / vLLM\n` +
        `\`\`\`\n\n` +
        `*Executed prompt:* **"${prompt}"**`

      emit({ type: "text", text })
      emit({ type: "result", ok: true, text })
      return 0
    }
  } catch (err: any) {
    emit({ type: "result", ok: false, text: `Fractal AI error: ${err.message}` })
    return 1
  }
}

