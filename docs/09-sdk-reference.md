---
description: >-
  TypeScript SDK reference for Besvelte. Automate thread lifecycles, parallel executions, computers, and memory in code.
---

# SDK reference

The Besvelte SDK allows you to orchestrate AI coding agents and computers programmatically from Node.js applications.

## Importing the SDK

```ts
import {
  startThread,
  openThread,
  closeThread,
  threadStatus,
  fanOut,
  addComputer,
  removeComputer,
  loadRegistry,
  listThreads,
  getMemorySystem
} from "openspaces";
```

## Thread management

### startThread

Starts a new thread and begins the first turn:

```ts
const thread = await startThread({
  agent: "claude-code",
  on: "local",
  prompt: "Review PR #42",
  cwd: "/Users/dev/project",
  autoApprove: false,
  model: "claude-3-7-sonnet-20250219",
  forwardEnv: ["GITHUB_TOKEN"],
  onEvent: (event) => console.log(event)
});

const result = await thread.wait();
```

### Thread methods

* `thread.wait(): Promise<TurnResult | undefined>` - Wait for the active turn to finish.
* `thread.send(prompt: string): Promise<TurnResult>` - Send a follow-up prompt in the same session.
* `thread.status(): Promise<ThreadState>` - Retrieve the current thread state.
* `thread.interrupt(): Promise<void>` - Terminate the active turn process without closing the thread.
* `thread.close(): Promise<ThreadState>` - Terminate the thread and delete temporary work folders.

### openThread

Re-attach to an existing thread by ID:

```ts
const thread = openThread("claudecode-a1b2c3d4", (event) => {
  console.log("Stream event:", event);
});

await thread.send("Run tests one more time");
```

## Parallel execution (fanOut)

Execute the same prompt across multiple computers simultaneously:

```ts
import { fanOut } from "openspaces";

const results = await fanOut(["local", "mini", "docker:test-box"], {
  agent: "claude-code",
  prompt: "Check disk usage and report free space in gigabytes"
});

for (const res of results) {
  console.log(`Computer: ${res.on}`);
  console.log(`Success:  ${res.result.ok}`);
  console.log(`Answer:   ${res.result.text}`);
}
```

## Managing computers

```ts
import { addComputer, removeComputer, loadRegistry } from "openspaces";

// Add an SSH target
await addComputer("staging", "ssh:deploy@staging.internal");

// Read all registered computers
const computers = await loadRegistry();
console.log("Registered computers:", Object.keys(computers));

// Remove a target
await removeComputer("staging");
```

## Memory and vector store

```ts
import { getMemorySystem } from "openspaces";

const memory = getMemorySystem();
await memory.init();

// Record action
await memory.recordWork({
  title: "Database schema migration",
  content: "Added index on user_id in orders table",
  type: "work"
});

// Semantic search
const matches = await memory.search({
  query: "orders index migration",
  limit: 2
});
```

## Related pages

* [Getting started](./01-getting-started.md)
* [Architecture and computers](./02-architecture-and-computers.md)
* [Threads and turns](./04-threads-and-turns.md)
* [Memory and visual search](./07-memory-and-visual-search.md)
