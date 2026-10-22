import { DatabaseSync } from "node:sqlite"
import { existsSync, mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { randomUUID } from "node:crypto"
import { stateHome } from "../paths.js"

export interface MemoryRecord {
  readonly id: string
  readonly timestamp: number
  readonly type: string // 'work' | 'git' | 'turn' | 'note' | 'screen' | 'doc'
  readonly title: string
  readonly content: string
  readonly metadata?: Record<string, unknown>
  readonly hasImage: boolean
  readonly embedding: Float32Array
}

export interface ScoredMemory extends Omit<MemoryRecord, "embedding"> {
  readonly score: number
}

type SQLInputValue = null | number | bigint | string | NodeJS.ArrayBufferView

export class MemoryStore {
  private db: DatabaseSync

  constructor(dbPath?: string) {
    const targetPath = dbPath ?? join(stateHome(), "memory.db")
    const dir = dirname(targetPath)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    this.db = new DatabaseSync(targetPath)
    this.initSchema()
  }

  private initSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS memories (
        id TEXT PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        metadata TEXT,
        has_image INTEGER NOT NULL DEFAULT 0,
        embedding BLOB NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_memories_timestamp ON memories(timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_memories_type ON memories(type);
    `)
  }

  insert(entry: {
    id?: string
    type?: string
    title: string
    content: string
    metadata?: Record<string, unknown>
    hasImage?: boolean
    embedding: Float32Array
  }): MemoryRecord {
    const record: MemoryRecord = {
      id: entry.id ?? randomUUID(),
      timestamp: Date.now(),
      type: entry.type ?? "work",
      title: entry.title,
      content: entry.content,
      metadata: entry.metadata,
      hasImage: !!entry.hasImage,
      embedding: entry.embedding,
    }

    const stmt = this.db.prepare(`
      INSERT INTO memories (id, timestamp, type, title, content, metadata, has_image, embedding)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      record.id,
      record.timestamp,
      record.type,
      record.title,
      record.content,
      record.metadata ? JSON.stringify(record.metadata) : null,
      record.hasImage ? 1 : 0,
      Buffer.from(record.embedding.buffer)
    )

    return record
  }

  search(
    queryEmbedding: Float32Array,
    options?: { limit?: number; type?: string; minScore?: number }
  ): ScoredMemory[] {
    const limit = options?.limit ?? 10
    const minScore = options?.minScore ?? 0.3
    const typeFilter = options?.type

    let sql = `SELECT id, timestamp, type, title, content, metadata, has_image, embedding FROM memories`
    const params: SQLInputValue[] = []
    if (typeFilter) {
      sql += ` WHERE type = ?`
      params.push(typeFilter)
    }

    const rows = this.db.prepare(sql).all(...params) as Array<{
      id: string
      timestamp: number
      type: string
      title: string
      content: string
      metadata: string | null
      has_image: number
      embedding: Buffer
    }>

    const results: ScoredMemory[] = []

    for (const row of rows) {
      const vec = new Float32Array(
        row.embedding.buffer,
        row.embedding.byteOffset,
        row.embedding.byteLength / 4
      )
      const score = cosineSimilarity(queryEmbedding, vec)
      if (score >= minScore) {
        results.push({
          id: row.id,
          timestamp: row.timestamp,
          type: row.type,
          title: row.title,
          content: row.content,
          metadata: row.metadata ? (JSON.parse(row.metadata) as Record<string, unknown>) : undefined,
          hasImage: row.has_image === 1,
          score,
        })
      }
    }

    results.sort((a, b) => b.score - a.score)
    return results.slice(0, limit)
  }

  listRecent(limit = 20, type?: string): Array<Omit<MemoryRecord, "embedding">> {
    let sql = `SELECT id, timestamp, type, title, content, metadata, has_image FROM memories`
    const params: SQLInputValue[] = []
    if (type) {
      sql += ` WHERE type = ?`
      params.push(type)
    }
    sql += ` ORDER BY timestamp DESC LIMIT ?`
    params.push(limit)

    const rows = this.db.prepare(sql).all(...params) as Array<{
      id: string
      timestamp: number
      type: string
      title: string
      content: string
      metadata: string | null
      has_image: number
    }>

    return rows.map((r) => ({
      id: r.id,
      timestamp: r.timestamp,
      type: r.type,
      title: r.title,
      content: r.content,
      metadata: r.metadata ? (JSON.parse(r.metadata) as Record<string, unknown>) : undefined,
      hasImage: r.has_image === 1,
    }))
  }

  delete(id: string): boolean {
    const res = this.db.prepare(`DELETE FROM memories WHERE id = ?`).run(id)
    return Number(res.changes) > 0
  }

  stats(): { count: number; types: Record<string, number> } {
    const totalRow = this.db.prepare(`SELECT COUNT(*) as count FROM memories`).get() as { count: number }
    const typeRows = this.db.prepare(`SELECT type, COUNT(*) as count FROM memories GROUP BY type`).all() as Array<{
      type: string
      count: number
    }>
    const types: Record<string, number> = {}
    for (const r of typeRows) {
      types[r.type] = r.count
    }
    return { count: totalRow.count, types }
  }

  close(): void {
    try {
      this.db.close()
    } catch {}
  }
}

/** Cosine similarity between two float vectors (dot product when normalized). */
export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length) return 0
  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    const av = a[i] ?? 0
    const bv = b[i] ?? 0
    dot += av * bv
    normA += av * av
    normB += bv * bv
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  return denom === 0 ? 0 : dot / denom
}
