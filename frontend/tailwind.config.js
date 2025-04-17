/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FF6600", // Orange color
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#234E70", // Dark blue
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#F8F9FA",
          foreground: "#333333",
        },
        destructive: {
          DEFAULT: "#FF4136",
          foreground: "#FFFFFF",
        },
        border: "rgba(0, 0, 0, 0.1)",
        input: "rgba(0, 0, 0, 0.1)",
        ring: "#FF6600",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}
