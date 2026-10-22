import { describe, expect, it } from "vitest"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { randomUUID } from "node:crypto"
import { MemoryStore, cosineSimilarity } from "../src/memory/store.js"

describe("MemoryStore", () => {
  it("calculates cosine similarity correctly", () => {
    const a = new Float32Array([1, 0, 0])
    const b = new Float32Array([1, 0, 0])
    const c = new Float32Array([0, 1, 0])
    const d = new Float32Array([-1, 0, 0])

    expect(cosineSimilarity(a, b)).toBeCloseTo(1.0)
    expect(cosineSimilarity(a, c)).toBeCloseTo(0.0)
    expect(cosineSimilarity(a, d)).toBeCloseTo(-1.0)
  })

  it("stores and retrieves memories with vector search", () => {
    const dbPath = join(tmpdir(), `test-memory-${randomUUID()}.db`)
    const store = new MemoryStore(dbPath)

    try {
      // Create 3 vectors with distinct directions
      const vec1 = new Float32Array([0.9, 0.1, 0.0])
      const vec2 = new Float32Array([0.1, 0.9, 0.0])
      const vec3 = new Float32Array([0.0, 0.1, 0.9])

      store.insert({
        title: "Fixed rollup import bug",
        content: "Restored 42 bitback Svelte component files in ui/src/lib/bitbacks",
        type: "work",
        metadata: { git: "checkout" },
        embedding: vec1,
      })

      store.insert({
        title: "Bitbacks Aurora Shader",
        content: "Configured OGL shader canvas for background graphics",
        type: "shader",
        metadata: { component: "Aurora" },
        embedding: vec2,
      })

      store.insert({
        title: "User conversation",
        content: "Discussed persistent memory layer using embeddinggemma",
        type: "note",
        embedding: vec3,
      })

      // Query close to vec1
      const query1 = new Float32Array([0.85, 0.15, 0.0])
      const results1 = store.search(query1, { limit: 2, minScore: 0.1 })

      expect(results1.length).toBe(2)
      expect(results1[0]!.title).toBe("Fixed rollup import bug")
      expect(results1[0]!.score).toBeGreaterThan(0.95)

      // Query with type filter
      const resultsType = store.search(query1, { type: "shader", minScore: 0.1 })
      expect(resultsType.length).toBe(1)
      expect(resultsType[0]!.title).toBe("Bitbacks Aurora Shader")

      // List recent
      const recent = store.listRecent(5)
      expect(recent.length).toBe(3)

      // Delete item
      const idToDelete = results1[0]!.id
      const deleted = store.delete(idToDelete)
      expect(deleted).toBe(true)

      const remaining = store.listRecent(5)
      expect(remaining.length).toBe(2)
    } finally {
      store.close()
    }
  })

  it("MemorySystem live integration with embeddinggemma model", async () => {
    const { MemorySystem } = await import("../src/memory/index.js")
    const dbPath = join(tmpdir(), `test-live-memory-${randomUUID()}.db`)
    const system = new MemorySystem({ dbPath, port: 4898 })

    try {
      const ready = await system.init()
      expect(ready).toBe(true)

      const status = system.status()
      expect(status.running).toBe(true)
      expect(status.port).toBe(4898)

      // Record two real updates
      await system.recordWork({
        title: "SvelteKit build fix",
        content: "Fixed rollup dynamic import of Aurora bitback background in besvelte registry",
        type: "work",
      })

      await system.recordWork({
        title: "Docker container sandbox",
        content: "Provisioned Debian container running Claude Code agent with SSH port forward",
        type: "sandbox",
      })

      // Search semantically
      const results = await system.search({
        query: "how did we fix the rollup dynamic import problem?",
        limit: 1,
      })

      expect(results.length).toBe(1)
      expect(results[0]!.title).toBe("SvelteKit build fix")
      expect(results[0]!.score).toBeGreaterThan(0.5)

      // Search for docker
      const dockerResults = await system.search({
        query: "ssh and claude code in container",
        limit: 1,
      })

      expect(dockerResults.length).toBe(1)
      expect(dockerResults[0]!.title).toBe("Docker container sandbox")
    } finally {
      system.close()
    }
  }, 30000)
})
