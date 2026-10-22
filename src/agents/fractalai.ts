import { existsSync } from "node:fs"
import { fileURLToPath } from "node:url"
import type { AgentEvent } from "../types.js"
import { parseJson, str, type AgentAdapter, type TurnInput } from "./types.js"

function getCliPath(): string {
  const beside = fileURLToPath(new URL("../cli.js", import.meta.url))
  if (existsSync(beside)) return beside
  const root = fileURLToPath(new URL("../../dist/cli.js", import.meta.url))
  if (existsSync(root)) return root
  return fileURLToPath(new URL("../cli.js", import.meta.url))
}

/**
 * Fractal AI Agent: Autonomous multi-step coding agent powered by @fractaldesign/fractalai SDK.
 * Supports direct multi-provider routing (Anthropic, OpenAI, Gemini, Grok, OpenRouter, Local/Custom),
 * native sandboxed tool execution (bash, readFile, writeFile, memoryRecall), and real-time event streaming.
 */
export const fractalAiAgent: AgentAdapter = {
  name: "fractalai",
  binary: "node",
  tested: true,
  argv({ prompt, sessionId, model }: TurnInput) {
    const cli = getCliPath()
    return [
      process.execPath,
      cli,
      "fractalai",
      prompt,
      ...(sessionId ? ["--session", sessionId] : []),
      ...(model ? ["--model", model] : []),
    ]
  },
  parse(line: string): readonly AgentEvent[] {
    const msg = parseJson(line)
    if (!msg) {
      if (line.trim().length > 0) {
        return [{ type: "text", text: line }]
      }
      return []
    }

    switch (msg.type) {
      case "session": {
        const sessionId = str(msg.sessionId)
        return sessionId ? [{ type: "session", sessionId }] : []
      }
      case "tool": {
        const name = str(msg.name) ?? "tool"
        const target = str(msg.target)
        return [{ type: "tool", name, ...(target ? { target } : {}) }]
      }
      case "text": {
        const text = str(msg.text)
        return text ? [{ type: "text", text }] : []
      }
      case "result": {
        const ok = msg.ok !== false
        const text = str(msg.text) ?? ""
        const costUsd = typeof msg.costUsd === "number" ? msg.costUsd : undefined
        return [{ type: "result", ok, text, ...(costUsd ? { costUsd } : {}) }]
      }
      case "stderr": {
        const text = str(msg.text) ?? ""
        return [{ type: "stderr", text }]
      }
      default:
        return []
    }
  },
}
