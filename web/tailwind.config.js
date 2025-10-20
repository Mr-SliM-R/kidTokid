/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Poppins'", "system-ui", "sans-serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#f5fbff",
          100: "#e6f4ff",
          200: "#cee9ff",
          300: "#a5d7ff",
          400: "#72bdff",
          500: "#3a9cff",
          600: "#1f7ee6",
          700: "#1062b8",
          800: "#0f4d8c",
          900: "#0f416f",
        },
        white: "#ffffff",
        black: "#000000",
        blossom: "#ffe3f1",
        dusk: "#171c2a",
      },
      boxShadow: {
        glow: "0 20px 45px -20px rgba(58,156,255,0.45)",
      },
      backgroundImage: {
        "aurora": "radial-gradient(circle at 20% 20%, rgba(58, 156, 255, 0.35), transparent 40%), radial-gradient(circle at 80% 0%, rgba(255, 189, 243, 0.35), transparent 45%), radial-gradient(circle at 20% 80%, rgba(140, 255, 210, 0.35), transparent 50%)",
      },
    },
  },
  plugins: [],
};
