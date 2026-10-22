---
description: >-
  Create isolated Linux sandboxes for AI agents. Run untrusted code safely using Apple container, Docker, or Podman.
---

# Sandboxes and isolation

Sandboxes give an AI coding agent a dedicated virtual environment. When an agent runs inside a sandbox, it has rootless permissions inside that container. It cannot access your host filesystem or network credentials.

## Key features

* **Fast provisioning** - Create a ready sandbox in twenty seconds.
* **Apple container integration** - Use native macOS virtualization without running Docker Desktop.
* **Unprivileged execution** - Run tools as user `agent` to prevent system modifications.
* **Automatic pre-approval** - Automatically enable `autoApprove` inside sandboxes because host files are protected.

## How it works

When you create a sandbox, Besvelte performs these steps:

1. Detects an available container runtime (`container` on macOS, or `docker` / `podman` on Linux).
2. Launches a Debian Linux container with CPU and memory limits.
3. Installs common development tools (`git`, `curl`, `python3`, `procps`).
4. Creates an unprivileged user named `agent`.
5. Installs the requested agent CLI packages globally using `npm`.
6. Registers the container in the Besvelte computer registry under your chosen name.

## Creating a sandbox

### Create a sandbox on macOS

On macOS, install Apple's open-source container engine:

```bash
brew install container
container system start
```

Create a new sandbox named `dev`:

```bash
node dist/cli.js sandbox create dev --agents claude-code,codex --cpus 4 --memory 8
```

### Create a sandbox with Docker

If you prefer Docker on macOS or Linux, pass `--runtime docker`:

```bash
node dist/cli.js sandbox create ci-runner --runtime docker --agents claude-code
```

## Managing sandboxes

### List all sandboxes

```bash
node dist/cli.js sandbox ls
```

The output shows the sandbox name, runtime, container identifier, and current status (`running`, `stopped`, or `missing`).

### Stop a sandbox

If you want to save battery and memory, stop the container when it is idle:

```bash
node dist/cli.js sandbox stop dev
```

### Start a stopped sandbox

```bash
node dist/cli.js sandbox start dev
```

### Delete a sandbox

When you do not need the sandbox anymore, delete the container and its registry entry:

```bash
node dist/cli.js sandbox rm dev
```

## Running tasks in a sandbox

After you create a sandbox, target it using the `--on` flag:

```bash
node dist/cli.js start --on dev "Clone https://github.com/example/repo.git and run the test suite"
```

Because the sandbox is isolated, Besvelte enables `autoApprove` automatically. The agent can create files, install dependencies, and execute test scripts without asking for manual permission.

## Related pages

* [Getting started](./01-getting-started.md)
* [Architecture and computers](./02-architecture-and-computers.md)
* [CLI reference](./08-cli-reference.md)
