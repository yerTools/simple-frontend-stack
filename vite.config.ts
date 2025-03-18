import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import { Options } from "unplugin-icons/types";
import Icons from "unplugin-icons/vite";
import LightningCSS from "unplugin-lightningcss/vite";
import { Plugin, defineConfig } from "vite";
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
    (Icons as (options: Options) => Plugin)({
      compiler: "solid",
    }),
    LightningCSS(),
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
      treeshake: "recommended",

      output: {
        //entryFileNames: "index.js",

        esModule: false,
        exports: "none",
      },
    },
  },
});
