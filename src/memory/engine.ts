import { spawn, type ChildProcess } from "node:child_process"
import { existsSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"

export interface MemoryEngineStatus {
  readonly running: boolean
  readonly port?: number
  readonly modelPath?: string
  readonly mmprojPath?: string
  readonly error?: string
}

export class MemoryEngine {
  private proc: ChildProcess | null = null
  private port = 4899
  private host = "127.0.0.1"
  private modelPath: string | null = null
  private mmprojPath: string | null = null
  private running = false
  private exitHandler: (() => void) | null = null

  constructor(options?: { port?: number; modelPath?: string; mmprojPath?: string }) {
    if (options?.port) this.port = options.port
    this.modelPath = options?.modelPath ?? this.findModel("embeddinggemma-2-Q8_0.gguf", "BESVELTE_EMBED_MODEL")
    this.mmprojPath = options?.mmprojPath ?? this.findModel("mmproj-embeddinggemma-2-Q8_0.gguf", "BESVELTE_MMPROJ_MODEL")
  }

  private findModel(filename: string, envVar: string): string | null {
    const candidates = [
      process.env[envVar],
      join(process.cwd(), "models", filename),
      join(homedir(), ".besvelte", "models", filename),
      join(homedir(), ".openspaces", "models", filename),
      join(homedir(), "Downloads", filename),
    ]
    for (const cand of candidates) {
      if (cand && existsSync(cand)) return cand
    }
    return null
  }

  private findLlamaServer(): string | null {
    const candidates = [
      process.env.LLAMA_SERVER_BIN,
      "/opt/homebrew/bin/llama-server",
      "/usr/local/bin/llama-server",
    ]
    for (const cand of candidates) {
      if (cand && existsSync(cand)) return cand
    }
    return null
  }

  status(): MemoryEngineStatus {
    return {
      running: this.running,
      port: this.running ? this.port : undefined,
      modelPath: this.modelPath ?? undefined,
      mmprojPath: this.mmprojPath ?? undefined,
    }
  }

  async start(): Promise<boolean> {
    if (this.running) return true
    if (!this.modelPath) {
      console.warn("[memory] Embedding model not found, skipping engine start.")
      return false
    }

    const llamaBin = this.findLlamaServer()
    if (!llamaBin) {
      console.warn("[memory] llama-server not found, skipping engine start.")
      return false
    }

    // Check if an existing server is already answering on this port
    if (await this.checkHealth()) {
      this.running = true
      return true
    }

    const args = [
      "-m", this.modelPath,
      "--embedding",
      "-ub", "2048",
      "--port", String(this.port),
      "--host", this.host,
    ]
    if (this.mmprojPath) {
      args.push("--mmproj", this.mmprojPath)
    }

    const proc = spawn(llamaBin, args, { stdio: ["ignore", "pipe", "pipe"] })
    this.proc = proc

    proc.on("error", (err) => {
      console.error("[memory] llama-server spawn error:", err.message)
      this.running = false
    })

    proc.on("exit", (code) => {
      if (this.running) {
        console.warn(`[memory] llama-server exited with code ${code}`)
      }
      this.running = false
      this.proc = null
    })

    this.exitHandler = () => {
      this.stopSync()
    }
    process.once("exit", this.exitHandler)
    process.once("SIGINT", this.exitHandler)
    process.once("SIGTERM", this.exitHandler)

    // Poll for readiness
    const deadline = Date.now() + 15000
    while (Date.now() < deadline) {
      if (await this.checkHealth()) {
        this.running = true
        console.log(`[memory] Engine ready on http://${this.host}:${this.port}`)
        return true
      }
      await new Promise((r) => setTimeout(r, 400))
    }

    console.warn("[memory] Timed out waiting for llama-server readiness.")
    this.stop()
    return false
  }

  private async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`http://${this.host}:${this.port}/health`, { signal: AbortSignal.timeout(1000) })
      return res.ok
    } catch {
      return false
    }
  }

  async embedText(content: string): Promise<Float32Array> {
    if (!this.running) {
      const started = await this.start()
      if (!started) throw new Error("Memory engine is not running")
    }

    const res = await fetch(`http://${this.host}:${this.port}/embedding`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      throw new Error(`Embedding failed with HTTP ${res.status}: ${await res.text()}`)
    }

    const data = await res.json() as Array<{ embedding: number[][] }>
    const raw = data?.[0]?.embedding?.[0]
    if (!raw || !Array.isArray(raw)) {
      throw new Error("Invalid embedding response format")
    }
    return new Float32Array(raw)
  }

  async embedImage(jpegBase64: string, prompt = ""): Promise<Float32Array> {
    if (!this.running) {
      const started = await this.start()
      if (!started) throw new Error("Memory engine is not running")
    }

    const cleanBase64 = jpegBase64.replace(/^data:image\/[a-z]+;base64,/, "")
    const res = await fetch(`http://${this.host}:${this.port}/embedding`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: prompt,
        image_data: [{ data: cleanBase64, id: 1 }],
      }),
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) {
      throw new Error(`Multimodal embedding failed with HTTP ${res.status}: ${await res.text()}`)
    }

    const data = await res.json() as Array<{ embedding: number[][] }>
    const raw = data?.[0]?.embedding?.[0]
    if (!raw || !Array.isArray(raw)) {
      throw new Error("Invalid multimodal embedding response format")
    }
    return new Float32Array(raw)
  }

  private stopSync(): void {
    if (this.proc) {
      try {
        this.proc.kill("SIGTERM")
      } catch {
        // ignore
      }
      this.proc = null
    }
  }

  stop(): void {
    this.running = false
    this.stopSync()
    if (this.exitHandler) {
      process.removeListener("exit", this.exitHandler)
      process.removeListener("SIGINT", this.exitHandler)
      process.removeListener("SIGTERM", this.exitHandler)
      this.exitHandler = null
    }
  }
}
