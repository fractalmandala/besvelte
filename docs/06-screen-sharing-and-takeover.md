---
description: >-
  Watch agent screen activity in real time. Take over keyboard and mouse controls with direct VNC tunnels and long-polling screen frames.
---

# Screen sharing and takeover

Besvelte displays a live feed of the computer that an agent is driving. You can observe cursor movements, inspect tool actions, and take manual control of the screen.

## Key features

* **Live desktop observer** - Stream desktop frames at 3 to 4 frames per second directly in the web UI.
* **Cursor tracking** - Render a green halo around the pointer of the agent and pulse ripples on clicks.
* **Interactive takeover** - Send keyboard, click, and scroll events directly to the target system.
* **Zero relay tunnels** - Establish direct local SSH tunnels to remote VNC servers without external cloud relays.

## How live screen streaming works

The `ScreenHub` class manages capture loops on active computers:

```
[Target Computer] ──(frame capture)──> [ScreenHub] ──(HTTP long-poll)──> [Svelte UI Canvas]
```

1. When a user opens a thread in the dashboard, the Svelte UI begins requesting frames using `next(on, seq)`.
2. `ScreenHub` executes overlapping capture workers to reduce latency.
3. If no user requests frames for eight seconds, the capture loop stops automatically to save CPU.
4. When an agent clicks a UI coordinate, the adapter emits a `tool` event with coordinates `(x, y)`. The UI draws an animated ripple at that position.

## Taking manual control

If an agent needs help with an authentication popup or a complex UI state, you can take over:

1. Click the live screen preview or select **Take over**.
2. Besvelte pauses the active agent turn so that you do not fight the agent for mouse control.
3. The viewer expands to full screen.
4. Keyboard inputs, clicks, and scroll gestures pass directly through to the computer.
5. When you finish, press `Shift + Escape` or select **Give back control**. The agent resumes its turn.

## Opening native VNC viewers

If you prefer a full-speed 60 FPS native desktop session, use the `view` CLI command:

```bash
node dist/cli.js view mini
```

Besvelte executes a view plan based on the target computer type:

* **Local computer** - Displays an informational message because the screen is already in front of you.
* **SSH host** - Allocates a local port, opens an encrypted SSH port forward (`-L 127.0.0.1:<port>:127.0.0.1:5900`), and opens the native macOS Screen Sharing app (`vnc://127.0.0.1:<port>`).
* **Cua sandbox** - Spawns the native Cua viewer using `cua sandbox view <name>`.
* **Docker container** - Connects directly to the published VNC port on `127.0.0.1:<port>`.

Press `Ctrl + C` in your terminal when you want to terminate the SSH tunnel.

## Related pages

* [Getting started](./01-getting-started.md)
* [Architecture and computers](./02-architecture-and-computers.md)
* [CLI reference](./08-cli-reference.md)
* [Svelte dashboard UI](./10-svelte-dashboard-ui.md)
