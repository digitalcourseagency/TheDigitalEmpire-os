import type { Config } from "tailwindcss";
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-cormorant)", "serif"],
        body: ["var(--font-jost)", "sans-serif"],
      },
      colors: {
        ink: "#1A1917",
        cream: "#F5F1EC",
        bone: "#EDE8E1",
        taupe: "#A09890",
        gold: "#B89A5A",
        ash: {
          50: "#F7F4F0",
          100: "#EDE8E1",
          200: "#D5CFC6",
          300: "#B8B0A5",
          400: "#9A9188",
          500: "#7D7470",
          600: "#605C58",
          700: "#444140",
          800: "#2C2A28",
          900: "#1A1917",
        }
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "shimmer": "shimmer 2s infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
      }
    },
  },
  plugins: [],
};
export default config;
