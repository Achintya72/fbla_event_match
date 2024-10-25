import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        blue: "#6490E7",
        yellow: "#C59F56"
      },
      fontFamily: {
        space: "var(--font-space)",
        raleway: "var(--font-raleway)"
      }
    },
  },
  plugins: [],
};
export default config;
