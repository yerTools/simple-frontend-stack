import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import { defineConfig } from "vite";
import lqip from "vite-plugin-lqip";
import solidPlugin from "vite-plugin-solid";
import webfontDownload from "vite-plugin-webfont-dl";

const root = resolve(__dirname, "src");

export default defineConfig({
  root: root,
  plugins: [
    webfontDownload(undefined, {
      injectAsStyleTag: false,
    }),
    solidPlugin(),
    tailwindcss(),
    lqip(),
  ],
  server: {
    port: 3000,
  },
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,

    target: "esnext",

    minify: "terser",
    sourcemap: false,
    cssMinify: "esbuild",

    rollupOptions: {
      input: ["index.html"].map((file) => resolve(root, file)),
      treeshake: "recommended",

      output: {
        //entryFileNames: "index.js",

        esModule: false,
        exports: "none",
      },
    },
  },
});
