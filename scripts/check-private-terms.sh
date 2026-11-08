#!/usr/bin/env bash
# Blocks personal details (server names, home paths, usernames, private network
# names) from entering this public repo.
#
# List your own terms in .private-terms.local, one per line (case-insensitive,
# # for comments). That file is gitignored, so the list itself stays private.
#
#   check-private-terms.sh          check staged changes (used by the pre-commit hook)
#   check-private-terms.sh --all    check every file that would be committed
set -euo pipefail

TERMS_FILE=".private-terms.local"
[[ -f "$TERMS_FILE" ]] || exit 0

terms="$(mktemp)"
trap 'rm -f "$terms"' EXIT
grep -vE '^\s*(#|$)' "$TERMS_FILE" | sed 's/[[:space:]]*$//' > "$terms" || true
[[ -s "$terms" ]] || exit 0

found=0
report() { printf '\033[31mPrivate term found\033[0m %s\n' "$1" >&2; found=1; }

if [[ "${1:-}" == --all ]]; then
  while IFS= read -r file; do
    [[ -f "$file" && "$file" != "$TERMS_FILE" ]] || continue
    if printf '%s\n' "$file" | grep -qiF -f "$terms"; then report "in file name: $file"; fi
    if grep -qiF -f "$terms" -- "$file" 2>/dev/null; then report "in: $file"; fi
  done < <(git ls-files --cached --others --exclude-standard)
else
  while IFS= read -r file; do
    if printf '%s\n' "$file" | grep -qiF -f "$terms"; then report "in file name: $file"; fi
  done < <(git diff --cached --name-only --diff-filter=ACMR)
  added="$(git diff --cached -U0 --diff-filter=ACMR | grep -E '^\+[^+]' || true)"
  if [[ -n "$added" ]] && printf '%s\n' "$added" | grep -qiF -f "$terms"; then
    report "in staged changes (run: pnpm check:private)"
  fi
fi

if [[ "$found" == 1 ]]; then
  echo "Remove personal details before committing. Your terms are listed in $TERMS_FILE." >&2
  exit 1
fi
