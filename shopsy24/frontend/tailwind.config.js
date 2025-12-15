/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // React files
  ],
  darkMode: "class", // dark mode by class
  theme: {
    extend: {
      colors: {
        primary: "#f27f0d",
        "background-light": "#f8f7f5",
        "background-dark": "#221910",
      },
      fontFamily: {
        display: ["Plus Jakarta Sans", "sans-serif"], // fallback added
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
    },
  },
  plugins: [], // (if you want forms/container later)
};
