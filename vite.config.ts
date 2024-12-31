import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

export default defineConfig(({ mode }) => {
  const commonConfig = {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html"],
        exclude: [
          "node_modules/",
          "src/test/",
          "**/*.d.ts",
          "**/*.config.*",
          "**/index.ts",
        ],
      },
      include: ["src/**/*.{test,spec}.{js,jsx,ts,tsx}"],
      exclude: ["node_modules", "dist", "src/**/*.stories.*"],
    },
  };

  if (mode === "development") {
    return {
      ...commonConfig,
      server: {
        host: "local.arshadshah.com",
        port: 5173,
        https: {
          key: fs.readFileSync("./certs/localhost+2-key.pem"),
          cert: fs.readFileSync("./certs/localhost+2.pem"),
        },
      },
    };
  } else {
    return commonConfig;
  }
});
