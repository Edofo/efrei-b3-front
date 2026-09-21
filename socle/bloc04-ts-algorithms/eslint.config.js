// ESLint, flat config. `npm run lint` — the same rules a team would agree on.
import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default defineConfig([
  { ignores: ["node_modules/", "dist/"] },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: {
      eqeqeq: ["error", "always"],
      "prefer-const": "error",
      "no-var": "error",
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
  {
    // Your code: every exported function says what it returns.
    files: ["src/**/*.ts", "_animateur/solution/src/**/*.ts"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": ["error", { allowExpressions: true }],
      "@typescript-eslint/explicit-module-boundary-types": "error",
    },
  },
]);
