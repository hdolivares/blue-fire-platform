import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // Adjusted for your 'app' directory structure
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-primary': 'linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%)',
        'gradient-secondary': 'linear-gradient(to right, #6a11cb 0%, #2575fc 100%)',
        'gradient-accent': 'linear-gradient(to right, #8e2de2, #4a00e0)',
      },
    },
  },
  plugins: [],
};
export default config;