# AGENTS.md

Instructions for AI assistants working on **idavoll-ui**, a public shadcn registry of
free, MIT-licensed React components. Components are distributed as JSON built by
`shadcn build` and published to GitHub Pages; consumers install them with
`shadcn add @idavoll/<name>`.

## Safety rules

1. Never commit secrets or personal details (server names, home paths, usernames).
   The pre-commit hook runs gitleaks and checks `.private-terms.local`; never bypass it
   with `--no-verify`.
2. Never add paid, proprietary or unlicensed code, fonts or icons. Everything here must
   be MIT-compatible. Don't copy components from commercial kits.
3. Don't loosen `minimumReleaseAge` or `onlyBuiltDependencies` in
   `pnpm-workspace.yaml`. Pin exact versions.
4. Ask before pushing, publishing or changing GitHub settings.

## Layout

```
registry.json                     The registry index. Every item must be listed here.
registry/idavoll/components/      Component source (installed to components/idavoll/)
registry/idavoll/demos/           One <name>-demo.tsx example per component
src/                              Preview gallery (src/main.tsx) + shadcn base components (src/components/ui)
public/r/                         Built registry JSON (generated, gitignored)
```

## Adding a component

1. Write `registry/idavoll/components/<name>.tsx`.
   - Import shadcn primitives as `@/components/ui/<x>`, utilities as `@/lib/utils`,
     other Idavoll components as `@/components/idavoll/<x>`. The CLI rewrites these to
     the consumer's aliases.
   - Need a shadcn primitive that isn't in `src/components/ui` yet? Add it with
     `pnpm exec shadcn add <x>` so the gallery and type checks work.
   - Export a props interface with a short doc comment on every prop. Use plain
     language. Colors come from theme variables (`--primary`, `--chart-1`…), never
     hard-coded brand colors, except where a component represents a third party
     (e.g. platform dots).
   - Accessible by default: labels for progress bars and icons, `sr-only` text for
     meaning carried by color or arrows.
2. Write `registry/idavoll/demos/<name>-demo.tsx` with a default export showing
   realistic usage. The shadcn MCP finds examples by this `-demo` name.
3. Add both items to `registry.json`. The component is `registry:component` with
   `target: "components/idavoll/<name>.tsx"`. Its `description` must list every prop
   (assistants read it). Fill in `dependencies` (npm packages) and
   `registryDependencies` (shadcn items like `card`, or `@idavoll/<x>`). The demo is
   `registry:block` with `registryDependencies: ["@idavoll/<name>"]`.
4. Add the demo to the `sections` list in `src/main.tsx`.
5. Run `pnpm format && pnpm check && pnpm build && pnpm test:a11y`. All must pass.

## Commands

| Command                | Purpose                                                       |
| ---------------------- | ------------------------------------------------------------- |
| `pnpm dev`             | Preview gallery                                               |
| `pnpm check`           | Biome lint, type checks, `shadcn registry validate`           |
| `pnpm build`           | Build registry JSON + gallery                                 |
| `pnpm test:a11y`       | axe-core WCAG 2.2 AA scan of the built gallery, all themes    |
| `pnpm format`          | Auto-fix formatting                                           |
| `pnpm exec shadcn mcp` | shadcn MCP server (configured for Claude Code in `.mcp.json`) |
