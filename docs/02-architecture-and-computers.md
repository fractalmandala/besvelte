---
description: >-
  Understand the computer target abstraction in Besvelte. Configure local execution, SSH machines, Docker containers, and Cua sandboxes.
---

# Architecture and computers

In Besvelte, a computer is any system that can execute a shell command. Besvelte does not require background daemons or agents installed on remote hosts. It communicates through standard SSH tunnels and container runtimes.

## Key features

* **Zero remote daemons** - Execute commands over standard shell transports.
* **Unified computer registry** - Manage named targets such as `mac-mini` or `ci-box`.
* **Safe secret forwarding** - Pass API tokens through standard input without writing them to disk.
* **Selective tool permissions** - Control whether file edits and shell commands run with approval.

## Computer types

Besvelte supports five kinds of computers:

* **Local** (`local`) - Runs directly on the host machine where Besvelte is running.
* **SSH host** (`ssh:user@host`) - Runs on a remote Linux or macOS machine reachable through SSH.
* **macOS container** (`container:[user@]name`) - Runs inside an isolated Linux virtual machine using the Apple `container` command.
* **Docker or Podman** (`docker:name`, `podman:name`) - Runs inside an existing Docker or Podman container.
* **Cua sandbox** (`cua:name`) - Runs inside a cloud browser or Linux desktop sandbox using the Cua CLI.

## How it works

When Besvelte starts a thread turn, it selects the computer transport:

```
[Besvelte Thread Manager]
          │
          ├── local     ──> child_process.spawn("sh")
          ├── ssh       ──> ssh -o BatchMode=yes user@host "sh"
          ├── container ──> container exec -i name sh
          ├── docker    ──> docker exec -i name sh
          └── cua       ──> cua sandbox exec name sh
```

The runner creates a dedicated work folder on the target machine:

```
~/.openspaces/work/<thread-id>/
```

If you specify an existing repository path with `--cwd`, the agent works in that directory. Besvelte never deletes your custom repository directory on cleanup.

## Managing the computer registry

You can save computer definitions in your local registry (`~/.openspaces/computers.json`).

### Add an SSH host

```bash
node dist/cli.js computers add mini ssh:developer@mac-mini.local
```

### Add a Docker container

```bash
node dist/cli.js computers add dev-box docker:my-dev-container
```

### List registered computers

```bash
node dist/cli.js computers ls
```

### Test computer reachability

Before you run tasks on a computer, make sure that it is reachable:

```bash
node dist/cli.js computers test mini
```

The test command checks network connectivity and reports which agent binaries exist on the target.

## Secret handling and environment forwarding

Agents often require API tokens, such as `ANTHROPIC_API_KEY` or `CLAUDE_CODE_OAUTH_TOKEN`.

Besvelte protects secrets through these rules:

1. Secrets pass to target processes through standard input pipes. They never appear in command line arguments (`argv`).
2. Secrets are never saved to thread state files or log streams.
3. On macOS, you can store secrets securely in the system Keychain:

```bash
# Save your token into the macOS Keychain
node dist/cli.js secrets set CLAUDE_CODE_OAUTH_TOKEN
```

When a thread starts, Besvelte retrieves the secret from the Keychain and forwards it into the agent process environment.

## Related pages

* [Getting started](./01-getting-started.md)
* [Agents and adapters](./03-agents-and-adapters.md)
* [Sandboxes and isolation](./05-sandboxes-and-isolation.md)
* [CLI reference](./08-cli-reference.md)
