import typescriptEslint from "@typescript-eslint/eslint-plugin";
import prettier from "eslint-plugin-prettier";
import _import from "eslint-plugin-import";
import { fixupPluginRules } from "@eslint/compat";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import solid from "eslint-plugin-solid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: ["node_modules/*", "dist/*", "eslint.config.mjs"],
  },
  ...compat.extends("plugin:@typescript-eslint/recommended", "prettier"),
  {
    plugins: {
      "@typescript-eslint": typescriptEslint,
      prettier,
      import: fixupPluginRules(_import),
    },

    languageOptions: {
      globals: {
        ...globals.browser,
      },

      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",

      parserOptions: {
        project: "./tsconfig.json",
      },
    },

    settings: {
      "import/resolver": {
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },

    rules: {
      "prettier/prettier": [
        "error",
        {
          singleQuote: false,
        },
      ],

      quotes: ["error", "double"],
      "no-console": "error",
      "no-debugger": "error",
      "no-alert": "error",
      "no-var": "error",
      "prefer-const": "error",
      "no-useless-rename": "error",
      "no-duplicate-imports": "error",
      "no-useless-constructor": "error",
      "no-useless-computed-key": "error",
      "no-useless-concat": "error",
      "no-useless-return": "error",
      "no-else-return": "error",
      "no-empty-function": "error",
      "no-empty-pattern": "error",
      "no-lone-blocks": "error",
      "no-multi-spaces": "error",
      "no-multiple-empty-lines": "error",
      "no-unneeded-ternary": "error",
      "no-whitespace-before-property": "error",
      "no-trailing-spaces": "error",
      "no-use-before-define": "error",
      "no-useless-call": "error",

      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
        },
      ],

      "@typescript-eslint/explicit-module-boundary-types": "off",

      "import/extensions": [
        "error",
        "ignorePackages",
        {
          js: "never",
          jsx: "never",
          ts: "never",
          tsx: "never",
        },
      ],

      "import/order": [
        "error",
        {
          groups: [
            ["builtin", "external", "internal"],
            ["parent", "sibling", "index"],
          ],
          "newlines-between": "always",
        },
      ],

      "import/no-unused-modules": "error",
      "require-await": "error",
      "no-return-await": "error",

      complexity: [
        "error",
        {
          max: 10,
        },
      ],

      "max-depth": ["error", 3],
      "space-in-parens": ["error", "never"],
      "space-infix-ops": "error",
      "require-atomic-updates": "error",
      "@typescript-eslint/strict-boolean-expressions": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/no-unnecessary-condition": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
    },
  },
  solid.configs["flat/typescript"],
  {
    "extends": [
      "plugin:prettier/recommended",
    ],
    "rules": {
      "prettier/prettier": ["error"],
    },
  },
];
