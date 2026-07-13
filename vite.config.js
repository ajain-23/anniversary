import { defineConfig } from "vite";

// base: "./" makes assets load correctly on GitHub Pages (project subpath).
export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
    assetsInlineLimit: 0,
  },
});
