import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import next from "@next/eslint-plugin-next";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    name: "project/ignores",
    ignores: [".next/", "node_modules/", "public/", "next-env.d.ts"]
  },
  {
    name: "project/javascript-recommended",
    files: ["**/*.{js,jsx,ts,tsx}"],
    ...js.configs.recommended
  },
  ...tseslint.configs.recommended,
  {
    name: "project/nextjs",
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "@next/next": next
    },
    rules: {
      ...next.configs.recommended.rules,
      ...next.configs["core-web-vitals"].rules
    }
  }
]);

