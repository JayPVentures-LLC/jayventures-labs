import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";

// Worker/edge runtime globals (available in Cloudflare Workers)
const workerGlobals = {
  Request: "readonly",
  RequestInfo: "readonly",
  RequestInit: "readonly",
  Response: "readonly",
  URL: "readonly",
  URLSearchParams: "readonly",
  ExecutionContext: "readonly",
  KVNamespace: "readonly",
  Queue: "readonly",
  MessageBatch: "readonly",
  fetch: "readonly",
  crypto: "readonly",
  TextEncoder: "readonly",
  TextDecoder: "readonly",
  atob: "readonly",
  btoa: "readonly",
  console: "readonly",
};

// Node.js-only globals (NOT available in Cloudflare Workers/edge runtime)
const nodeGlobals = {
  process: "readonly",
  __dirname: "readonly",
  require: "readonly",
};

export default [
  {
    ignores: [".next/**", "node_modules/**", "dist/**", "build/**", "coverage/**"],
  },
  {
    ...js.configs.recommended,
    languageOptions: {
      ...js.configs.recommended.languageOptions,
      globals: workerGlobals,
    },
  },
  // Node.js-only files: scripts, config files, tooling
  {
    files: ["scripts/**/*.{js,mjs,ts}", "*.config.{js,mjs,ts}", "eslint.config.mjs", "vitest.config.ts", "next.config.js"],
    languageOptions: {
      globals: {
        ...workerGlobals,
        ...nodeGlobals,
      },
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...workerGlobals,
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
      },
    },
    plugins: { "@typescript-eslint": tseslint },
    rules: {
      ...tseslint.configs.recommended.rules,
      "no-undef": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
  // Node.js-only TypeScript files: scripts, config
  {
    files: ["scripts/**/*.ts", "*.config.ts"],
    languageOptions: {
      globals: {
        ...workerGlobals,
        ...nodeGlobals,
      },
    },
  },
  {
    files: ["**/*.jsx", "**/*.tsx"],
    plugins: { react: reactPlugin },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/no-unknown-property": ["error", { ignore: ["jsx", "global"] }],
    },
    settings: { react: { version: "detect" } },
  },
];
