import { MemoryEngine, type MemoryEngineStatus } from "./engine.js"
import { MemoryStore, type MemoryRecord, type ScoredMemory } from "./store.js"

export interface RecordWorkOptions {
  readonly title: string
  readonly content: string
  readonly type?: string // 'work' | 'git' | 'turn' | 'note' | 'screen' | 'doc'
  readonly metadata?: Record<string, unknown>
  readonly imageBase64?: string
}

export interface MemorySearchOptions {
  readonly query: string
  readonly type?: string
  readonly limit?: number
  readonly minScore?: number
}

export interface MemoryVisualSearchOptions {
  readonly imageBase64: string
  readonly prompt?: string
  readonly type?: string
  readonly limit?: number
  readonly minScore?: number
}

export class MemorySystem {
  readonly engine: MemoryEngine
  readonly store: MemoryStore

  constructor(options?: { dbPath?: string; port?: number; modelPath?: string; mmprojPath?: string }) {
    this.engine = new MemoryEngine({
      port: options?.port,
      modelPath: options?.modelPath,
      mmprojPath: options?.mmprojPath,
    })
    this.store = new MemoryStore(options?.dbPath)
  }

  async init(): Promise<boolean> {
    return this.engine.start()
  }

  status(): MemoryEngineStatus & { memoryCount: number; types: Record<string, number> } {
    const engineStatus = this.engine.status()
    const stats = this.store.stats()
    return {
      ...engineStatus,
      memoryCount: stats.count,
      types: stats.types,
    }
  }

  async recordWork(options: RecordWorkOptions): Promise<Omit<MemoryRecord, "embedding">> {
    let embedding: Float32Array

    if (options.imageBase64) {
      embedding = await this.engine.embedImage(options.imageBase64, `${options.title}\n${options.content}`)
    } else {
      embedding = await this.engine.embedText(`${options.title}\n${options.content}`)
    }

    const saved = this.store.insert({
      title: options.title,
      content: options.content,
      type: options.type ?? "work",
      metadata: options.metadata,
      hasImage: !!options.imageBase64,
      embedding,
    })

    const { embedding: _, ...publicRecord } = saved
    return publicRecord
  }

  async search(options: MemorySearchOptions): Promise<ScoredMemory[]> {
    const queryEmbedding = await this.engine.embedText(options.query)
    return this.store.search(queryEmbedding, {
      type: options.type,
      limit: options.limit,
      minScore: options.minScore,
    })
  }

  async searchByImage(options: MemoryVisualSearchOptions): Promise<ScoredMemory[]> {
    const queryEmbedding = await this.engine.embedImage(options.imageBase64, options.prompt)
    return this.store.search(queryEmbedding, {
      type: options.type,
      limit: options.limit,
      minScore: options.minScore,
    })
  }

  listRecent(limit = 20, type?: string): Array<Omit<MemoryRecord, "embedding">> {
    return this.store.listRecent(limit, type)
  }

  delete(id: string): boolean {
    return this.store.delete(id)
  }

  close(): void {
    this.engine.stop()
    this.store.close()
  }
}

let globalMemorySystem: MemorySystem | null = null

export function getMemorySystem(): MemorySystem {
  if (!globalMemorySystem) {
    globalMemorySystem = new MemorySystem()
  }
  return globalMemorySystem
}
