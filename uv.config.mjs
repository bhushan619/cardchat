import tsparser from "@typescript-eslint/parser";
import ts from "@typescript-eslint/eslint-plugin";
export default [{
  files: ["src/**/*.{ts,tsx}"],
  ignores: ["src/components/ui/**"],
  languageOptions: { parser: tsparser, parserOptions: { ecmaFeatures: { jsx: true } } },
  plugins: { "@typescript-eslint": ts },
  rules: { "@typescript-eslint/no-unused-vars": ["warn", { args: "none", ignoreRestSiblings: false }] },
}];
