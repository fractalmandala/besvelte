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
 * Emgem: The persistent memory agent for besvelte.
 * Powered by local EmbeddingGemma-2 & mmproj, directly querying and indexing all work.
 */
export const emgem: AgentAdapter = {
  name: "emgem",
  binary: "node",
  tested: true,
  argv({ prompt, sessionId }: TurnInput) {
    const cli = getCliPath()
    return [
      process.execPath,
      cli,
      "emgem",
      prompt,
      ...(sessionId ? ["--session", sessionId] : []),
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
        const name = str(msg.name) ?? "memory"
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
        return [{ type: "result", ok, text }]
      }
      default:
        return []
    }
  },
}
