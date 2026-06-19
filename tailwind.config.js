/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        ocean: "#1b6b8f",
        mint: "#36b37e",
        coral: "#ff6b4a",
        amber: "#f4b740",
        violet: "#6f5bd8",
        cloud: "#f5f8fb"
      },
      boxShadow: {
        panel: "0 18px 48px rgba(23, 32, 51, 0.12)"
      }
    }
  }
};
