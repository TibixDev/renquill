import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import * as child from "child_process";

const commitHash = child.execSync("git rev-parse --short HEAD").toString();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue({ reactivityTransform: true })],
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
    rollupOptions: {},
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  define: {
    '__APP_VERSION__': JSON.stringify(process.env.npm_package_version),
    '__COMMIT_HASH__': JSON.stringify(commitHash),
  }
});
