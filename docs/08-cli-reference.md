---
description: >-
  Complete command-line interface reference for Besvelte. Manage computers, sandboxes, threads, and screen viewers.
---

# CLI reference

The Besvelte command line tool is available as `openspaces` or directly through `node dist/cli.js`.

## Managing computers

### List computers

```bash
node dist/cli.js computers ls
```

### Add a computer

```bash
node dist/cli.js computers add <name> <address>
```

Address formats:
* Local machine: `local`
* SSH remote host: `ssh:user@host`
* Docker container: `docker:container-name` or `docker:user@container-name`
* Apple container: `container:container-name`
* Cua desktop sandbox: `cua:sandbox-name`

### Remove a computer

```bash
node dist/cli.js computers rm <name>
```

### Test computer reachability

```bash
node dist/cli.js computers test [name]
```

## Running threads and tasks

### Start a thread in the background

```bash
node dist/cli.js start [options] "<prompt>"
```

Options:
* `--on <computer>` - Target computer (default: `local`).
* `--agent <name>` - Agent adapter: `claude-code`, `codex`, `gemini`, `opencode`, `shell`, or `emgem`.
* `--cwd <path>` - Work inside an absolute directory on the target.
* `--auto-approve` - Skip tool permission confirmation prompts.
* `--model <id>` - Select a specific model override (e.g., `claude-3-7-sonnet-20250219`).
* `--env <NAME>` - Forward an environment variable from your shell or Keychain.
* `--wait` - Block until the turn completes and print the final answer.

### Send follow-up prompt

```bash
node dist/cli.js send <id> "<prompt>" [--wait]
```

### Wait for completion

```bash
node dist/cli.js wait <id>
```

### View logs in real time

```bash
node dist/cli.js logs <id> -f
```

### Inspect status

```bash
# List all active threads
node dist/cli.js status

# Inspect one specific thread
node dist/cli.js status <id>
```

### Interrupt a turn

```bash
node dist/cli.js interrupt <id>
```

### Close and clean up a thread

```bash
node dist/cli.js close <id>
```

## Multi-computer parallel execution (fanout)

Dispatch a task to several computers at the same time:

```bash
node dist/cli.js run --on local,mini,dev "Run git status and report free disk space"
```

## Desktop viewer

Open a direct VNC connection or Cua viewer:

```bash
node dist/cli.js view <computer> [--port 5900] [--view-only]
```

## Sandboxes

### Create a sandbox

```bash
node dist/cli.js sandbox create <name> [options]
```

Options:
* `--agents <list>` - Comma-separated list of agent CLIs to install (default: `claude-code`).
* `--cpus <num>` - Number of CPU cores (default: `4`).
* `--memory <gb>` - Memory in gigabytes (default: `4`).
* `--runtime <engine>` - `container`, `docker`, or `podman`.

### Manage sandboxes

```bash
node dist/cli.js sandbox ls
node dist/cli.js sandbox stop <name>
node dist/cli.js sandbox start <name>
node dist/cli.js sandbox rm <name>
```

## Storing secrets

Store an agent authentication token in the macOS Keychain:

```bash
node dist/cli.js secrets set CLAUDE_CODE_OAUTH_TOKEN
```

Paste the secret value when prompted on standard input.

## Starting the user interface

```bash
node dist/cli.js ui [--port 4600] [--no-open]
```

## Related pages

* [Getting started](./01-getting-started.md)
* [Architecture and computers](./02-architecture-and-computers.md)
* [SDK reference](./09-sdk-reference.md)
