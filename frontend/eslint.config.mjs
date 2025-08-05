import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Disable TypeScript unused variable errors
      "@typescript-eslint/no-unused-vars": "off",
      
      // Allow explicit 'any' types
      "@typescript-eslint/no-explicit-any": "off",
      
      // Turn exhaustive deps from error to warning
      "react-hooks/exhaustive-deps": "warn",
      
      // Allow unescaped quotes/apostrophes in JSX
      "react/no-unescaped-entities": "off",
      
      // Allow custom fonts in pages
      "@next/next/no-page-custom-font": "off",
      
      // Allow 'this' aliasing (for your Gradient.js file)
      "@typescript-eslint/no-this-alias": "off",
      
      // Allow unused expressions (for your Gradient.js file)
      "@typescript-eslint/no-unused-expressions": "off",
      
      // Allow <img> elements instead of requiring Next.js <Image>
      "@next/next/no-img-element": "off"
    }
  }
];

export default eslintConfig;
