import tailwindcss from "@tailwindcss/vite";
import { readFileSync } from "fs";
import { resolve } from "path";
import { Options } from "unplugin-icons/types";
import Icons from "unplugin-icons/vite";
import LightningCSS from "unplugin-lightningcss/vite";
import { Plugin, defineConfig } from "vite";
import viteCompression from "vite-plugin-compression";
import lqip from "vite-plugin-lqip";
import solidPlugin from "vite-plugin-solid";
import webfontDownload from "vite-plugin-webfont-dl";

interface AppConfig {
  name: string;
  description: string;
  author: string;
  version: string;
}

const root = resolve(__dirname, "src");
const appConfig = JSON.parse(
  readFileSync(resolve(__dirname, "config/app.config.json"), "utf-8"),
) as AppConfig;

export default defineConfig({
  root: root,
  plugins: [
    {
      name: "html-transform",
      transformIndexHtml(html) {
        return html
          .replace("%VITE_APP_NAME%", appConfig.name)
          .replace("%VITE_APP_DESCRIPTION%", appConfig.description);
      },
    },
    webfontDownload(undefined, {
      injectAsStyleTag: false,
    }),
    solidPlugin(),
    tailwindcss(),
    lqip(),
    (Icons as (options: Options) => Plugin)({
      compiler: "solid",
    }),
    LightningCSS(),
    viteCompression({
      algorithm: "brotliCompress",
      ext: ".br",
      deleteOriginFile: false,
      filter: /\.(js|mjs|json|css|html|svg|ttf|woff|woff2)$/,
    }),
  ],
  server: {
    port: 8161,
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
      treeshake: {
        preset: "smallest",
        propertyReadSideEffects: false,
        moduleSideEffects: (id) => id.includes("/prismjs/"),
        annotations: true,
      },

      output: {
        //entryFileNames: "index.js",
        manualChunks: {
          solid: ["@solidjs/router", "solid-js"],
          ui: [
            "@felte/solid",
            "@formkit/auto-animate",
            "@kobalte/core",
            "@kobalte/tailwindcss",
            "@xstate/store",
            "ag-grid-community",
            "lucide-solid",
            "solid-ag-grid",
            "solid-highlight",
            "solid-markdown",
            "swapy",
            "tailwindcss-intersect",
          ],
          core: ["nanostores", "pocketbase", "yup"],
        },
        esModule: true,
        exports: "auto",
      },
    },
  },
  resolve: {
    alias: {
      "@prism": resolve(__dirname, "node_modules/prismjs"),
      "@prism-jsx": resolve(
        __dirname,
        "node_modules/prismjs/components/prism-jsx",
      ),
      "@prism-jsx-tsx": resolve(
        __dirname,
        "node_modules/prismjs/components/prism-tsx",
      ),
    },
  },
});
