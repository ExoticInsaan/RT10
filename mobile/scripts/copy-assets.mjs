// Copies the website's images (single source of truth: ../public) into mobile/public so the app bundles them offline.
import { cpSync, mkdirSync, rmSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const site = path.resolve(here, "../../public");
const out = path.resolve(here, "../public");

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const dir of ["shelf", "fun-zone", "mascot"]) cpSync(path.join(site, dir), path.join(out, dir), { recursive: true });
for (const file of ["logo-mark.png", "logo-mark-light.png"]) cpSync(path.join(site, file), path.join(out, file));

const worker = path.resolve(here, "../node_modules/pdfjs-dist/build/pdf.worker.min.mjs");
if (existsSync(worker)) cpSync(worker, path.join(out, "pdf.worker.min.mjs"));
console.log("assets copied");
