---
description: >-
  Manage agent thread lifecycles and execution turns. Learn how conversations persist and recover from failures.
---

# Threads and turns

A **thread** represents a continuous conversation with an agent on a specific computer. A **turn** is a single prompt-response cycle within that thread.

## Key features

* **State persistence** - Save thread metadata, conversation history, and costs in local JSON files.
* **Session continuation** - Maintain context between turns by resuming the session ID of the agent.
* **Worker isolation** - Execute turns in detached worker processes to prevent blocking.
* **Dead worker detection** - Automatically detect crashed workers and reset thread status.

## Thread lifecycle

Every thread transitions through defined states:

```
[starting] ──> [running] ──> [idle] ──> [closed]
                   │           ▲
                   ▼           │
                [failed] ──────┘ (new turn resumes)
```

* `starting` - The turn is queued, and the runner process is spawning.
* `running` - The agent process is executing tools and streaming output.
* `idle` - The turn completed successfully. The thread is ready for the next prompt.
* `failed` - The turn ended with an error or unhandled exception.
* `closed` - The thread was stopped. The temporary work folder was deleted.

## Starting and managing threads

### Start a thread with startThread

```ts
import { startThread } from "openspaces";

const thread = await startThread({
  agent: "claude-code",
  on: "local",
  prompt: "Inspect the repository and run all tests",
  onEvent: (event) => {
    if (event.type === "text") {
      process.stdout.write(event.text);
    }
  }
});

// Wait for the first turn to finish
const firstResult = await thread.wait();
console.log("Turn 1 completed. Cost:", firstResult?.costUsd);
```

### Send a follow-up turn

The `send` method re-attaches to the existing agent session ID on the target computer:

```ts
const secondResult = await thread.send("Fix the failing test in tests/auth.test.ts");
console.log("Turn 2 text:", secondResult.text);
```

### Interrupt an active turn

If an agent enters an infinite loop or writes unwanted changes, call `interrupt`:

```ts
await thread.interrupt();
```

The interrupt call sends a termination signal to the remote process group on the target machine. The thread remains open, allowing you to give new instructions.

### Close and clean up

When you finish your work, close the thread:

```ts
const finalState = await thread.close();
console.log("Thread closed. Total turns executed:", finalState.turns.length);
```

If `deleteOnClose` is true (the default), Besvelte deletes the temporary folder `~/.openspaces/work/<id>` on the target computer. If you specified an existing repository directory with `cwd`, Besvelte never deletes it.

## Thread persistence and recovery

Besvelte writes thread state to:

```
~/.openspaces/threads/<thread-id>.json
```

Each record contains the agent name, the computer address, the agent session ID, and the full history of turns.

If the machine restarts or a background worker process dies unexpectedly, `threadStatus` inspects process tables. If the recorded worker PID no longer exists, Besvelte marks the turn as failed and frees the thread so you can continue.

## Related pages

* [Getting started](./01-getting-started.md)
* [Agents and adapters](./03-agents-and-adapters.md)
* [Architecture and computers](./02-architecture-and-computers.md)
* [SDK reference](./09-sdk-reference.md)
