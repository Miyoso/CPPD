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
        brand: {
          50: "#f5f7ff",
          100: "#e8edff",
          200: "#cdd6ff",
          300: "#a3b3ff",
          400: "#7689ff",
          500: "#4f63f5",
          600: "#3a47db",
          700: "#2f37b0",
          800: "#262d8a",
          900: "#1f266e",
        },
      },
    },
  },
  plugins: [],
};

export default config;
