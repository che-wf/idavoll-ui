import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// The preview gallery and the registry JSON (public/r) are published together to
// GitHub Pages at https://<owner>.github.io/idavoll-ui/
export default defineConfig({
  base: process.env.PAGES_BASE ?? "/idavoll-ui/",
  plugins: [react(), tailwindcss()],
  resolve: {
    // Registry components import each other as "@/components/idavoll/..." (their path
    // once installed in an app); map that to the registry folder here.
    alias: [
      {
        find: /^@\/components\/idavoll\//,
        replacement: `${path.resolve(import.meta.dirname, "registry/idavoll/components")}/`,
      },
      { find: /^@\//, replacement: `${path.resolve(import.meta.dirname, "src")}/` },
    ],
  },
  envPrefix: "IDAVOLL_UI_NEVER_",
});
