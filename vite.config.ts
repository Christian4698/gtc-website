import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function bundleVisualizer(): Plugin {
  return {
    name: "gtc-bundle-visualizer",
    generateBundle(_: unknown, bundle: Record<string, any>) {
      const assets = Object.values(bundle)
        .filter(item => item.type === "chunk")
        .map(chunk => ({
          fileName: chunk.fileName,
          size: Buffer.byteLength(chunk.code ?? "", "utf8"),
          modules: Object.entries(chunk.modules ?? {})
            .map(([id, info]: [string, any]) => ({
              id: id.replace(__dirname, ""),
              size: info.renderedLength ?? info.originalLength ?? 0,
            }))
            .sort((a, b) => b.size - a.size)
            .slice(0, 20),
        }))
        .sort((a, b) => b.size - a.size);

      const rows = assets
        .map(
          asset => `<section>
  <h2>${asset.fileName} - ${(asset.size / 1024).toFixed(2)} KB</h2>
  <ol>${asset.modules
    .map(module => `<li><code>${module.id}</code> <strong>${(module.size / 1024).toFixed(2)} KB</strong></li>`)
    .join("")}</ol>
</section>`,
        )
        .join("");

      this.emitFile({
        type: "asset",
        fileName: "bundle-visualizer.html",
        source: `<!doctype html><html><head><meta charset="utf-8"><title>GTC Bundle Visualizer</title><style>body{font-family:Arial,sans-serif;margin:32px;color:#0B1F3A}section{border:1px solid #dbe3ef;border-radius:8px;padding:16px;margin:16px 0}code{font-size:12px}li{margin:6px 0}</style></head><body><h1>GTC Bundle Visualizer</h1>${rows}</body></html>`,
      });
    },
  };
}

export default defineConfig({
  root: "client",

  build: {
    outDir: "../dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 550,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("@tanstack") || id.includes("@trpc") || id.includes("superjson")) {
            return "data-vendor";
          }
          if (id.includes("@radix-ui")) {
            return "ui-vendor";
          }
          if (id.includes("react") || id.includes("react-dom") || id.includes("wouter")) {
            return "react-vendor";
          }
          if (id.includes("lucide-react")) {
            return "icons-vendor";
          }
          if (id.includes("recharts") || id.includes("lodash")) {
            return "charts-vendor";
          }
        },
      },
    },
  },

  plugins: [react(), tailwindcss(), process.env.ANALYZE_BUNDLE === "true" ? bundleVisualizer() : null].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
})
