import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import lqip from "vite-plugin-lqip";
import solidPlugin from "vite-plugin-solid";
import webfontDownload from "vite-plugin-webfont-dl";

export default defineConfig({
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
    target: "esnext",
  },
});
