import { execSync } from "child_process"
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

/**
 * Der Code-Stand für das Interaktionsprotokoll, siehe telemetry.ts.
 *
 * Commit-Kürzel beim Build, mit "-dirty", wenn nicht committete Änderungen
 * mitgebaut wurden. Im Dev-Server "dev", weil sich der Code dort unter der
 * laufenden Seite ändern kann.
 */
function build(befehl: "build" | "serve"): string {
  if (befehl === "serve") return "dev"
  try {
    const commit = execSync("git rev-parse --short HEAD").toString().trim()
    const offen = execSync("git status --porcelain --untracked-files=no")
      .toString()
      .trim()
    return offen ? `${commit}-dirty` : commit
  } catch {
    return "unbekannt"
  }
}

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Relativer Basispfad, damit der Build auch unter einem Unterpfad wie
  // https://<user>.github.io/<repo>/ funktioniert.
  base: "./",
  plugins: [react(), tailwindcss()],
  define: {
    __BUILD__: JSON.stringify(build(command)),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}))
