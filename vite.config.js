import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        x1: resolve(__dirname, "x1.html"),
        support: resolve(__dirname, "support.html"),
        contact: resolve(__dirname, "contact.html"),
      },
    },
  },
});
