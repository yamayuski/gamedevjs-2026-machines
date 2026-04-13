# My workspace template with DevContainer

## Requirements

### Git on host OS

Git credential helper may be installed and its configuration will be shared to container.

- GitHub Docs: <https://docs.github.com/get-started/git-basics/caching-your-github-credentials-in-git>
- Windows: <https://github.com/git-for-windows/git/releases>
  - `git credential-manager github login` to login GitHub

### OPTIONAL: Sharing GPG KEys

If you want to sign your git commits, you can share your GPG keys to container.

<https://code.visualstudio.com/remote/advancedcontainers/sharing-git-credentials#_sharing-gpg-keys>

### Any docker-compatible engine

I am Windows user but I do not need Graphical User Interface, so I will use [Docker Engine for Linux](https://docs.docker.com/engine/install/) in WSL2(Ubuntu Distro). **DO NOT CLONE ANY REPOSITORY INSIDE WINDOWS FILESYSTEM**. It will be very slow.

You can also [attach to a container in a Kubernetes cluster](https://code.visualstudio.com/docs/devcontainers/attach-container#_attach-to-a-container-in-a-kubernetes-cluster) or pick [Alternate ways to install Docker](https://code.visualstudio.com/remote/advancedcontainers/docker-options).

**NOTICE: You need Docker Buildx to build this devcontainer.**

### vscode or JetBrains IDE

- [Remote Development extension pack](https://aka.ms/vscode-remote/download/extension) in vscode

## References

- [Developing inside a Container](https://code.visualstudio.com/docs/devcontainers/containers)
- [Development containers](https://containers.dev/)
