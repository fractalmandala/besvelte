# Besvelte

> Besvelte lets you put Claude Code, Codex, or any AI coding agent on a computer you choose, and run tasks across all your computers at once.

You can run agents on your local Mac, isolated Linux container sandboxes, SSH servers, Docker containers, or Cua sandboxes. Watch the agent desktop live as it moves the mouse and runs tools. Take over control anytime.

---

## Key features

* **Multi-agent runtime** - Run Claude Code, Codex, Gemini CLI, OpenCode, Shell, or Emgem.
* **Computer abstraction** - Target local execution, SSH machines, Docker, or native macOS Apple containers.
* **Live desktop observer** - Watch cursor coordinates and tool execution ripples in real time.
* **Interactive takeover** - Click the desktop preview to send mouse clicks, scrolls, and keystrokes.
* **Parallel fanout** - Dispatch identical prompts to multiple machines simultaneously.
* **Multimodal memory** - Index work sessions and screenshots into SQLite with local vector search.
* **Svelte 5 runes dashboard** - Enjoy 3D bot avatars, local voice dictation, and WebM screen recording.

---

## Documentation

Full guides and technical documentation are located in the `docs/` folder:

* [01. Getting started](./docs/01-getting-started.md)
* [02. Architecture and computers](./docs/02-architecture-and-computers.md)
* [03. Agents and adapters](./docs/03-agents-and-adapters.md)
* [04. Threads and turns](./docs/04-threads-and-turns.md)
* [05. Sandboxes and isolation](./docs/05-sandboxes-and-isolation.md)
* [06. Screen sharing and takeover](./docs/06-screen-sharing-and-takeover.md)
* [07. Memory and visual search](./docs/07-memory-and-visual-search.md)
* [08. CLI reference](./docs/08-cli-reference.md)
* [09. SDK reference](./docs/09-sdk-reference.md)
* [10. Svelte dashboard UI](./docs/10-svelte-dashboard-ui.md)

---

## Quickstart

### 1. Start the web dashboard

```bash
npm install
npm run dev
```

Open the private security link printed in your terminal (for example `http://127.0.0.1:4600/#token=...`).

### 2. Run an agent from the command line

```bash
# Start an agent in the background
node dist/cli.js start "Analyze git status and summarize recent changes"

# Watch the agent run in real time
node dist/cli.js logs <thread-id> -f

# Send a follow-up instruction to the same conversation
node dist/cli.js send <thread-id> "Commit these changes and open a pull request" --wait
```

### 3. Use the TypeScript SDK

```ts
import { startThread } from "openspaces";

const thread = await startThread({
  agent: "claude-code",
  on: "local",
  prompt: "Inspect the repository and run all unit tests"
});

const result = await thread.wait();
console.log(result?.text);

// Continue conversation in the same session
await thread.send("Fix any failing tests");
await thread.close();
```

---

## License

MIT © [Fractal Mandala](https://github.com/fractalmandala)
