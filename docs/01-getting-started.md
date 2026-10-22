---
description: >-
  Install and start Besvelte. Connect AI coding agents to local machines, sandboxes, and remote computers.
---

# Getting started

Besvelte is an agent execution platform. You assign coding agents to virtual or remote computers. The agents execute tasks in background threads while you watch their live screens.

## Key features

* **Multi-agent runtime** - Run Claude Code, Codex, Gemini CLI, OpenCode, or Shell scripts.
* **Computer abstraction** - Target your local Mac, isolated sandboxes, Docker containers, or SSH hosts.
* **Live desktop observer** - Watch the mouse movements and clicks of an agent in real time.
* **Interactive takeover** - Click the screen to take full keyboard and mouse control.
* **Parallel fanout** - Dispatch the same prompt to multiple computers at the same time.

## System prerequisites

Before you begin, make sure that your system meets these requirements:

* **Node.js** - Version 20 or newer.
* **Agent CLI** - At least one installed agent CLI, such as Claude Code (`npm install -g @anthropic-ai/claude-code`).
* **Operating system** - macOS 14 or newer for Apple container sandboxes, or Linux with Docker.

## Installation

Install dependencies and compile the project:

```bash
cd /Users/amrit/fractaldesign/apps/besvelte
npm install
npm run build
```

## Starting the dashboard

Start the unified development server:

```bash
npm run dev
```

The command starts the backend process and launches the Svelte 5 user interface.

If you want to run in a standard web browser without opening a desktop window, run:

```bash
npm run dev:browser
```

The server binds to `127.0.0.1:4600`. It prints a private URL that contains a security token:

```
http://127.0.0.1:4600/#token=d3f8a109c4e2...
```

Open the link in your browser. The dashboard rejects requests that do not carry this token.

## Your first agent turn

You can start an agent thread directly from the command line:

```bash
# Start a background thread on your local machine
node dist/cli.js start "Analyze git status and list modified files"
```

The command returns a unique thread identifier, such as `claudecode-7a91bf2e`.

To watch the live log output and tool executions, run:

```bash
node dist/cli.js logs claudecode-7a91bf2e -f
```

To send a follow-up prompt into the same conversation, run:

```bash
node dist/cli.js send claudecode-7a91bf2e "Create a commit with these changes" --wait
```

When you finish your task, close the thread and clean up the work directory:

```bash
node dist/cli.js close claudecode-7a91bf2e
```

## Related pages

* [Architecture and computers](./02-architecture-and-computers.md)
* [Agents and adapters](./03-agents-and-adapters.md)
* [CLI reference](./08-cli-reference.md)
* [SDK reference](./09-sdk-reference.md)
