#!/usr/bin/env bash
# Installs gitleaks (the secret scanner the commit hook uses) into ~/.local/bin.
# Works on Linux, macOS and Windows (WSL). The download is checked against a
# known checksum before it is installed.
set -euo pipefail

VERSION="8.30.1"

case "$(uname -s)-$(uname -m)" in
  Linux-x86_64)        asset="linux_x64";    sha="551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb" ;;
  Linux-aarch64)       asset="linux_arm64";  sha="e4a487ee7ccd7d3a7f7ec08657610aa3606637dab924210b3aee62570fb4b080" ;;
  Darwin-x86_64)       asset="darwin_x64";   sha="dfe101a4db2255fc85120ac7f3d25e4342c3c20cf749f2c20a18081af1952709" ;;
  Darwin-arm64)        asset="darwin_arm64"; sha="b40ab0ae55c505963e365f271a8d3846efbc170aa17f2607f13df610a9aeb6a5" ;;
  *) echo "Unsupported system: $(uname -s) $(uname -m). See https://github.com/gitleaks/gitleaks#installing" >&2; exit 1 ;;
esac

if command -v gitleaks >/dev/null 2>&1; then
  echo "gitleaks is already installed: $(command -v gitleaks) ($(gitleaks version))"
  exit 0
fi

file="gitleaks_${VERSION}_${asset}.tar.gz"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

echo "Downloading gitleaks ${VERSION} (${asset})..."
curl -fsSL "https://github.com/gitleaks/gitleaks/releases/download/v${VERSION}/${file}" -o "$tmp/$file"

echo "Checking the download..."
if command -v sha256sum >/dev/null 2>&1; then
  echo "${sha}  $tmp/$file" | sha256sum -c - >/dev/null
else
  echo "${sha}  $tmp/$file" | shasum -a 256 -c - >/dev/null
fi

tar -xzf "$tmp/$file" -C "$tmp" gitleaks
mkdir -p "$HOME/.local/bin"
install -m 755 "$tmp/gitleaks" "$HOME/.local/bin/gitleaks"
echo "Installed to $HOME/.local/bin/gitleaks"

case ":$PATH:" in
  *":$HOME/.local/bin:"*) echo "Done. Check it with: gitleaks version" ;;
  *)
    echo
    echo "One more step: ~/.local/bin isn't on your PATH yet. Run this, then open a new terminal:"
    if [[ "$(basename "${SHELL:-}")" == zsh ]]; then
      echo "  echo 'export PATH=\"\$HOME/.local/bin:\$PATH\"' >> ~/.zshrc"
    else
      echo "  echo 'export PATH=\"\$HOME/.local/bin:\$PATH\"' >> ~/.bashrc"
    fi
    ;;
esac
