import { defineConfig, PluginOption } from "vite";
import { enterDevPlugin, enterProdPlugin } from "vite-plugin-enter-dev";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const plugins = [...enterProdPlugin()];

  if (mode === "development") {
    plugins.push(...enterDevPlugin());
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: plugins.filter(Boolean) as PluginOption[],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    base: "/terrazone/",
    build: {
      outDir: "dist",
    },
    test: {
      environment: "jsdom",
      setupFiles: "./src/test/setup.ts",
      globals: true,
    },
  };
});