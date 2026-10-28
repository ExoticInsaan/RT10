import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const here = path.dirname(fileURLToPath(import.meta.url));
const appVersion = JSON.parse(readFileSync(path.resolve(here, "package.json"), "utf8")).version as string;
const root = path.resolve(here, "..");
const shim = (f: string) => path.resolve(here, "src/shims", f);
const mod = (name: string) => path.resolve(here, "node_modules", name);

/**
 * The app reuses the website's components (../components, ../lib) without changing them.
 * Those files import Next.js modules, so each one is pointed at a small stand-in in src/shims.
 * Packages are resolved from mobile/node_modules, because the shared files live outside this folder.
 */
function pdfWorker(): Plugin {
  return {
    name: "pdf-worker-url",
    transform(code, id) {
      if (!id.endsWith("pdf-engine.ts")) return;
      return code.replace(
        'new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString()',
        '"./pdf.worker.min.mjs"',
      );
    },
  };
}

export default defineConfig({
  plugins: [pdfWorker(), react(), tailwindcss()],
  base: "./",
  define: { __APP_VERSION__: JSON.stringify(appVersion) },
  resolve: {
    alias: [
      { find: /^next\/image$/, replacement: shim("next-image.tsx") },
      { find: /^next\/link$/, replacement: shim("next-link.tsx") },
      { find: /^next\/dynamic$/, replacement: shim("next-dynamic.tsx") },
      { find: /^next\/navigation$/, replacement: shim("next-navigation.ts") },
      { find: /^next\/font\/google$/, replacement: shim("next-font.ts") },
      { find: /^@\/lib\/supabase\/client$/, replacement: shim("supabase-client.ts") },
      { find: /^@\/components\/AuthProvider$/, replacement: shim("AuthProvider.tsx") },
      { find: /^@\//, replacement: root + "/" },
      { find: /^react$/, replacement: mod("react") },
      { find: /^react\/(.*)$/, replacement: mod("react") + "/$1" },
      { find: /^react-dom$/, replacement: mod("react-dom") },
      { find: /^react-dom\/(.*)$/, replacement: mod("react-dom") + "/$1" },
      { find: /^pdf-lib$/, replacement: mod("pdf-lib") },
      { find: /^pdfjs-dist$/, replacement: mod("pdfjs-dist") },
      { find: /^@supabase\/supabase-js$/, replacement: mod("@supabase/supabase-js") },
    ],
  },
  server: { fs: { allow: [root] } },
  build: { outDir: "dist", target: "es2022", chunkSizeWarningLimit: 1500 },
});
