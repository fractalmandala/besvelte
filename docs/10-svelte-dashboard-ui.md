---
description: >-
  Explore the Besvelte frontend dashboard. Inspect Svelte 5 runes architecture, 3D bot avatars, and live screen controls.
---

# Svelte dashboard UI

The Besvelte dashboard is a Svelte 5 application. It combines three primary views: the bot list on the left, the conversation thread in the center, and the live computer screen on the right.

## Key features

* **Svelte 5 runes architecture** - Reactive UI state powered by `$state` and `$derived` classes.
* **Animated 3D bot avatars** - WebGL bot faces that react to agent thinking, errors, and task completion.
* **Integrated screen canvas** - Real-time canvas rendering with cursor position tracking and click ripples.
* **Local audio dictation** - Offline speech-to-text recording with whisper.cpp.
* **Screen video recording** - Record `.webm` videos of agent actions directly in the browser.

## Architecture

The dashboard is structured into modular reactive services:

* `screen.svelte.ts` - Manages long-polling loop against `/api/screen/:on`.
* `thread.svelte.ts` - Synchronizes conversation turns, costs, and tool logs.
* `recorder.svelte.ts` - Captures canvas frames into a MediaStream for WebM export.
* `speech.ts` - Transcribes microphone audio using a local `whisper-cpp` binary.

## Interactive capabilities

### 3D Bot expressions

Each agent displays a 3D animated face rendered via Three.js / OGL:

* **Idle** - The avatar blinks and glances around calmly.
* **Working** - The eyes sparkle and animate rapidly while tools execute.
* **Complete** - The avatar smiles when a turn finishes successfully.
* **Failed** - The eyes indicate an error condition if a turn fails.
* **Closed** - The avatar falls asleep when the thread closes.

### Live screen controls

* **Live preview** - Shows what the agent sees at 3 to 4 frames per second.
* **Take over** - Expands the canvas to full screen and unlocks manual mouse and keyboard control.
* **Record video** - Captures a `.webm` recording of the session for documentation or debugging.
* **Shift + Escape** - Exits takeover mode and hands control back to the agent.

### Local speech dictation

Besvelte includes an offline microphone dictation button:

1. Click the microphone icon in the chat input.
2. Speak your task instructions.
3. Audio records into memory and transcribes locally on your Mac using `whisper.cpp`.
4. The transcribed text inserts into the message box.

## Launching the dashboard

```bash
# Start in a dedicated desktop window
npm run dev

# Start in a standard browser tab
npm run dev:browser
```

The server prints a security URL with an authentication token. You must open that specific link to access the dashboard.

## Related pages

* [Getting started](./01-getting-started.md)
* [Screen sharing and takeover](./06-screen-sharing-and-takeover.md)
* [SDK reference](./09-sdk-reference.md)
