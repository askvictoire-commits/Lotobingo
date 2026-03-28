import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bingo: {
          blue: "#0066FF",
          violet: "#7B2FFF",
          pink: "#FF2D78",
          inactive: "#E5E5E5",
        },
      },
      fontFamily: {
        anton: ["var(--font-anton)"],
        dm: ["var(--font-dm-sans)"],
      },
      keyframes: {
        pulse_bingo: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.05)", opacity: "0.9" },
        },
        pop_in: {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "80%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        number_hit: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.25)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        pulse_bingo: "pulse_bingo 1s ease-in-out infinite",
        pop_in: "pop_in 0.3s ease-out forwards",
        number_hit: "number_hit 0.15s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
