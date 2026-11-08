// Preview gallery, published with the registry on GitHub Pages.
import "./index.css";
import { type ComponentType, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ChallengeChartDemo from "../registry/idavoll/demos/challenge-chart-demo";
import ChallengeProgressDemo from "../registry/idavoll/demos/challenge-progress-demo";
import PlatformBadgeDemo from "../registry/idavoll/demos/platform-badge-demo";
import StatCardDemo from "../registry/idavoll/demos/stat-card-demo";

const sections: { name: string; title: string; Demo: ComponentType }[] = [
  { name: "challenge-chart", title: "Challenge Chart", Demo: ChallengeChartDemo },
  { name: "challenge-progress", title: "Challenge Progress", Demo: ChallengeProgressDemo },
  { name: "stat-card", title: "Stat Card", Demo: StatCardDemo },
  { name: "platform-badge", title: "Platform Badge", Demo: PlatformBadgeDemo },
];

function Gallery() {
  return (
    <main className="mx-auto max-w-4xl space-y-12 px-4 py-12">
      <header className="space-y-3">
        <h1 className="font-heading text-4xl font-semibold tracking-tight">idavoll-ui</h1>
        <p className="text-muted-foreground">
          Free, open-source React components built on shadcn/ui. Install them with the shadcn CLI; the code lands in
          your project and is yours to change.
        </p>
        <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-sm">
          npx shadcn@latest registry add @idavoll=https://che-wf.github.io/idavoll-ui/r/{"{name}"}.json
        </pre>
      </header>
      {sections.map(({ name, title, Demo }) => (
        <section key={name} id={name} className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-heading text-2xl font-semibold">{title}</h2>
            <code className="text-muted-foreground text-sm">npx shadcn@latest add @idavoll/{name}</code>
          </div>
          <Demo />
        </section>
      ))}
    </main>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");
createRoot(root).render(
  <StrictMode>
    <Gallery />
  </StrictMode>,
);
