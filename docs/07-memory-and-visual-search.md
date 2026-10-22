---
description: >-
  Index agent actions and screen states with the multimodal MemorySystem. Search previous work using text queries or image embeddings.
---

# Memory and visual search

Besvelte includes an embedded memory engine that indexes tasks, terminal commands, notes, and desktop screenshots. You can recall previous solutions using semantic text queries or visual search.

## Key features

* **SQLite vector storage** - Store text, metadata, and vector embeddings locally in `~/.openspaces/memory.db`.
* **Multimodal embeddings** - Generate embeddings from text or Base64 screenshots using local models.
* **Cosine similarity ranking** - Compare query vectors directly against stored records.
* **Zero external cloud dependencies** - Run the embedding engine on your Mac using `llama-server`.

## Architecture

The memory system consists of two core components:

```
[MemoryStore (SQLite)] <---> [MemorySystem Facade] <---> [MemoryEngine (llama-server)]
                                     │
                    ┌────────────────┴────────────────┐
                    ▼                                 ▼
             Text search                       Visual search
```

* **MemoryEngine** manages a local `llama-server` process that computes embeddings using models like `embeddinggemma-2-Q8_0.gguf`.
* **MemoryStore** manages the SQLite schema, stores binary embedding blobs, and calculates cosine similarity on retrieved rows.

## Recording work

You can record completed tasks or notes into the memory store:

```ts
import { getMemorySystem } from "openspaces";

const memory = getMemorySystem();
await memory.init();

// Record a completed bug fix
await memory.recordWork({
  title: "Fixed race condition in token refresh",
  content: "Added Mutex lock around token renewal in auth.ts line 84",
  type: "work",
  metadata: {
    repo: "fractaldesign/besvelte",
    branch: "main"
  }
});
```

To record an action with a screen capture:

```ts
await memory.recordWork({
  title: "Dashboard settings layout",
  content: "User configured dark theme and selected Claude 3.7 model",
  type: "screen",
  imageBase64: screenshotBase64
});
```

## Searching memories

### Search by text query

```ts
const results = await memory.search({
  query: "How did we fix the auth token race condition?",
  type: "work",
  limit: 3,
  minScore: 0.5
});

for (const match of results) {
  console.log(`[Score: ${(match.score * 100).toFixed(0)}%] ${match.title}`);
  console.log(match.content);
}
```

### Search by image (visual search)

If you have a screenshot of a bug or layout, search for similar screens recorded in past sessions:

```ts
const visualMatches = await memory.searchByImage({
  imageBase64: currentScreenBase64,
  prompt: "Find previous error modals with connection timeouts",
  limit: 2
});

for (const match of visualMatches) {
  console.log(`Found visual match: ${match.title} (Score: ${match.score})`);
}
```

## Configuring the local embedding model

The engine looks for GGUF model files in the following standard directories:

* Current working directory: `./models/embeddinggemma-2-Q8_0.gguf`
* User directory: `~/.besvelte/models/` or `~/.openspaces/models/`
* Environment variables: `BESVELTE_EMBED_MODEL` and `BESVELTE_MMPROJ_MODEL`

Make sure that `llama-server` exists on your path (for example via Homebrew: `brew install llama.cpp`). If no local model is detected, the memory system logs a diagnostic message and operates with vector search disabled.

## Related pages

* [Getting started](./01-getting-started.md)
* [Architecture and computers](./02-architecture-and-computers.md)
* [SDK reference](./09-sdk-reference.md)
