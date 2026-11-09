// Gallery-only theme picker. Theme colors come from the registry:theme items in registry.json,
// so what you see here is exactly what `shadcn add @idavoll/theme-<name>` installs.
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import registry from "../registry.json";

type Vars = Record<string, string>;
interface ThemeItem {
  name: string;
  title: string;
  type: string;
  cssVars?: { light?: Vars; dark?: Vars };
}

const THEMES = (registry.items as ThemeItem[]).filter((i) => i.type === "registry:theme");
const OPTIONS = [
  { id: "neutral", label: "shadcn" },
  ...THEMES.map((t) => ({ id: t.name, label: t.title.replace(/ theme$/, "") })),
];

// ?theme=dusk&mode=dark in the URL picks a look directly, for sharing.
const params = new URLSearchParams(window.location.search);
const URL_VALUES: Record<string, string | null> = {
  "idavoll-theme": params.get("theme") && `theme-${params.get("theme")}`.replace("theme-neutral", "neutral"),
  "idavoll-mode": params.get("mode"),
};

function read(key: string, fallback: string) {
  const fromUrl = URL_VALUES[key];
  if (fromUrl) return fromUrl;
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage can be blocked; the choice just won't be remembered.
  }
}

const toCss = (selector: string, vars: Vars = {}) =>
  `${selector}{${Object.entries(vars)
    .map(([k, v]) => `--${k}:${v};`)
    .join("")}}`;

// Apply the saved choice before the first paint so the page doesn't flash the wrong theme.
const initialTheme = read("idavoll-theme", "theme-gilded");
const initialDark =
  read("idavoll-mode", window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light") === "dark";
applyTheme(initialTheme);
document.documentElement.classList.toggle("dark", initialDark);

function applyTheme(name: string) {
  const item = THEMES.find((t) => t.name === name);
  let style = document.getElementById("idavoll-theme") as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = "idavoll-theme";
    document.head.append(style);
  }
  style.textContent = item ? toCss(":root", item.cssVars?.light) + toCss(".dark", item.cssVars?.dark) : "";
}

export function ThemeControls() {
  const [theme, setTheme] = useState(initialTheme);
  const [dark, setDark] = useState(initialDark);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    write("idavoll-mode", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    applyTheme(theme);
    write("idavoll-theme", theme);
  }, [theme]);

  return (
    <div className="flex items-center gap-2">
      <fieldset className="inline-flex rounded-lg border-0 bg-muted p-0.5 text-xs">
        <legend className="sr-only">Theme</legend>
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={theme === o.id}
            onClick={() => setTheme(o.id)}
            className={cn(
              "rounded-md px-2.5 py-1 font-medium text-foreground/70 transition-colors focus-visible:outline-2 focus-visible:outline-ring",
              theme === o.id && "bg-background text-foreground shadow-xs",
            )}
          >
            {o.label}
          </button>
        ))}
      </fieldset>
      <button
        type="button"
        onClick={() => setDark((d) => !d)}
        aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        className="grid size-8 place-items-center rounded-lg bg-muted text-foreground/70 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
      >
        {dark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
      </button>
    </div>
  );
}
