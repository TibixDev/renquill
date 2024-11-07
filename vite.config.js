import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

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
  }
});
