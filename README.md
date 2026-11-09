# idavoll-ui

Free, open-source React components built on [shadcn/ui](https://ui.shadcn.com). No
paid tiers, no license keys: MIT licensed, so you can use them in anything.

Components install with the shadcn CLI, so the code lands **in your project** and is
yours to change. They're built on Radix, Tailwind CSS v4 and Recharts, and follow your
project's shadcn theme.

**Preview:** https://che-wf.github.io/idavoll-ui/

## Components

| Name                 | What it is                                                                                                       |
| -------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `challenge-chart`    | Progress over a challenge (e.g. 90 days) against a straight line to the goal, with milestones and a Today marker |
| `challenge-progress` | "Day 37 of 90" card with time and goal progress bars and an ahead/on-pace/behind label                           |
| `stat-card`          | One headline number with an optional up/down change                                                              |
| `platform-badge`     | Label for YouTube, TikTok, Instagram or Threads                                                                  |

Every component has a `-demo` example (e.g. `challenge-chart-demo`) showing how to use it.

## Use it in your project

You need a project already set up with shadcn/ui (`npx shadcn@latest init`).

**1. Add the registry once:**

```sh
npx shadcn@latest registry add @idavoll=https://che-wf.github.io/idavoll-ui/r/{name}.json
```

**2. Add components:**

```sh
npx shadcn@latest add @idavoll/challenge-chart
```

Files go to `components/idavoll/`. Any shadcn components they need (card, chart and
so on) are added too. If you already have one, the CLI asks before replacing it;
answer **no** to keep yours.

**3. Use them:**

```tsx
import { ChallengeChart } from "@/components/idavoll/challenge-chart";

<ChallengeChart data={points} goal={10000} today={37} valueLabel="Followers" />;
```

**Updating:** run `add` again. To see what changed first:
`npx shadcn@latest add @idavoll/challenge-chart --diff`.

## For AI assistants (MCP)

shadcn's MCP server lets AI assistants browse, search and install components from any
registry your project lists, including this one. Once you've done step 1 above,
assistants can find every `@idavoll` component, read its props, and pull its `-demo`
example.

Set it up for your tool:

```sh
npx shadcn@latest mcp init --client claude    # or: cursor, vscode, codex, opencode
```

Then ask things like "show me the @idavoll challenge-chart example" or "add the
idavoll stat card to the dashboard".

## Work on the library

```sh
corepack enable && pnpm install
pnpm dev          # preview gallery at http://localhost:5173/idavoll-ui/
pnpm check        # lint, type checks, registry validation
pnpm build        # builds public/r/*.json and the gallery
```

- Components live in `registry/idavoll/components/`, examples in
  `registry/idavoll/demos/`. Each must be listed in `registry.json`.
- Pushing to `main` publishes the registry and gallery to GitHub Pages
  (**Settings → Pages → Source: GitHub Actions**, once).
- AI assistants: see [`AGENTS.md`](AGENTS.md).

## License

[MIT](LICENSE). Each component file starts with a short license header, so the notice
travels with the code when `shadcn add` copies a single file into your project. Keep it.

### Trademarks

Platform names and logos (YouTube, TikTok, Instagram, Threads and others in
`social-icon`) are trademarks of their owners. They're included so apps can show which
platform a number comes from. The MIT license covers this code, not those trademarks:
follow each platform's brand guidelines, and don't use the logos to suggest endorsement.
