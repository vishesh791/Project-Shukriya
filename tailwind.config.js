/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Shukriya palette
        ink: {
          DEFAULT: "#2B1D3F", // plum ink — text and dark surfaces
          soft: "#5B4B73",     // secondary text
          mute: "#8E82A3",     // placeholders, hints
        },
        marigold: {
          DEFAULT: "#F5B82E",
          deep: "#D99A0B",
          pale: "#FFF1C9",
        },
        rose: {
          DEFAULT: "#D94F70",
          pale: "#FBE4EB",
        },
        lilac: {
          DEFAULT: "#F2EEFB", // section backgrounds
          line: "#E3DCF3",    // borders
        },
        mint: {
          DEFAULT: "#1F8A5B",
          pale: "#D8F3E4",
        },
      },
      fontFamily: {
        sans: ["'Bricolage Grotesque Variable'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        note: "0 18px 40px -18px rgba(43, 29, 63, 0.35)",
        lift: "0 10px 30px -14px rgba(43, 29, 63, 0.25)",
      },
      borderRadius: {
        note: "14px",
      },
      keyframes: {
        "note-in": {
          "0%": { opacity: 0, transform: "translateY(16px) rotate(var(--tilt, 0deg))" },
          "100%": { opacity: 1, transform: "translateY(0) rotate(var(--tilt, 0deg))" },
        },
      },
      animation: {
        "note-in": "note-in 600ms cubic-bezier(.2,.8,.2,1) both",
      },
    },
  },
  plugins: [],
};
