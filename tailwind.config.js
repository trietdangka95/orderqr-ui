/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,tsx}",
    "../order-qr/**/*.ts",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        "primary-soft": "var(--primary-soft)",
      },
    },
  },
  plugins: [],
};
