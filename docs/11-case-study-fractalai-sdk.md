---
description: >-
  Case study on how Besvelte integrates the Fractal AI SDK (@fractaldesign/fractalai) for headless multi-provider coding agents and native sandboxed tool execution.
---

# Case Study: Fractal AI SDK Implementation in Besvelte

This document details the architectural integration and real-world benefits of embedding `@fractaldesign/fractalai` into Besvelte.

---

## 1. Motivation

Besvelte is an agent execution platform designed to run AI coding workers across local computers, remote SSH boxes, and isolated Docker sandboxes.

Initially, every agent turn in Besvelte relied on spawning vendor CLI processes (`claude`, `codex`, `gemini`, `opencode`). While functional, this model presented significant operational hurdles:

1. **Strict Dependency on Pre-installed CLIs**: Every target container or remote host required vendor CLI tools pre-installed and authenticated.
2. **Brittle Stream Parsing**: Besvelte had to maintain ad-hoc regex and JSON stream scrapers for every vendor CLI's terminal output.
3. **No Direct Tool Extensibility**: Standard vendor CLIs execute only their own built-in tools. Besvelte could not directly expose bespoke workspace tools (like semantic memory recall or screen capture) to the LLM runtime.

---

## 2. Solution: The Fractal AI Agent Adapter

With `@fractaldesign/fractalai`, Besvelte introduced a first-class **Fractal AI Agent** (`fractalai`) that interacts directly with frontier APIs (Anthropic, OpenAI, Gemini, Grok, OpenRouter, and local vLLM/Ollama endpoints).

### Architecture

```
[User Turn Prompt]
       │
       ▼
[Besvelte Thread Executor]
       │
       ▼
[Fractal AI Adapter] (src/agents/fractalai.ts)
       │
       ▼
[CLI Worker: openspaces fractalai <prompt>] (src/cli/commands.ts)
       │
       ├─► createFractalAi() [Unified Provider Resolver]
       │     └─► Anthropic / OpenAI / Gemini / Grok / Local Provider
       │
       ├─► Native Workspace Tools
       │     ├─► execBash: Direct shell execution in workspace
       │     ├─► readFile / writeFile: File system operations
       │     ├─► listFiles: Workspace directory inspection
       │     └─► semanticRecall: Vector search via MemoryVectorIndex
       │
       ▼
[generateText({ maxSteps: 8, tools })]
       │
       ▼
[Normalized AgentEvents emitted to Besvelte UI]
  • session
  • tool (execBash, readFile, writeFile, semanticRecall)
  • text (streaming tokens)
  • result (turn completion)
```

---

## 3. Key Components Implemented

### 1. Unified Agent Adapter (`src/agents/fractalai.ts`)
* Implements the `AgentAdapter` interface.
* Uses standard `node` as its binary—present on nearly every machine and container, ensuring 100% probe availability (`✓ node`).

### 2. Multi-Step Sandboxed Tool Engine (`src/cli/commands.ts`)
* Configures `generateText` with `maxSteps: 8`.
* Exposes five native tools:
  * `execBash`: Runs commands directly in the active thread's working directory.
  * `readFile`: Inspects files up to 100KB with error recovery.
  * `writeFile`: Writes updates directly to the file system.
  * `listFiles`: Inspects directories.
  * `semanticRecall`: Connects to Besvelte's persistent memory store.

### 3. Svelte 5 Dashboard Integration (`ui/`)
* **Agent Dropdown**: `Fractal AI` appears in the Agent selection menu with a distinct cyan-to-indigo gradient gecko avatar (`#38bdf8` to `#6366f1`).
* **Real-time Event Display**: Tool calls and outputs are rendered smoothly in [`ThreadView.svelte`](file:///Users/amrit/fractaldesign/apps/besvelte/ui/src/lib/components/ThreadView.svelte) and [`AgentTurn.svelte`](file:///Users/amrit/fractaldesign/apps/besvelte/ui/src/lib/components/AgentTurn.svelte).

---

## 4. Operational Gains

* **Zero CLI Installations**: Containers only need Node.js; no vendor CLI binaries or interactive authentication needed.
* **Multi-Provider Flexibility**: Switch between Claude 3.7 Sonnet, GPT-4o, Gemini 2.0 Flash, Grok 2, or local Ollama models simply by setting the corresponding API key or model name.
* **Native Multi-Step Autonomy**: The agent autonomously executes commands, inspects outputs, fixes syntax errors, and writes code across up to 8 automated steps per turn.
* **Prompt Caching Efficiency**: Built-in support for provider prompt caching cuts token costs by up to 75% on large repositories.
