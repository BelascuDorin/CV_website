import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Mirrors the `@/*` path in tsconfig.json.
    alias: { "@": path.resolve(__dirname) },
  },
  test: {
    // The eval spends real money; it runs only through `yarn eval`.
    exclude: ["**/node_modules/**", "eval/**"],
  },
});
