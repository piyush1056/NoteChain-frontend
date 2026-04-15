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
        
        purple: {
          400: "#E5C158",
          500: "#D4AF37", 
          600: "#B5952F", 
          700: "#997A21", 
        },
        
      
        gray: {
          400: "#A0A0A0",
          500: "#808080",
          600: "#3A3A3A",
          700: "#2A2A2A", 
          800: "#1A1A1A", 
          900: "#121212", 
        }
      },
    },
  },
  plugins: [],
};
export default config;