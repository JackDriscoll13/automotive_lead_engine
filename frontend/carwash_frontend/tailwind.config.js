/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: '#303030', // Adjust the color as needed
        'dark-charcoal': '#1A1A1A', // Adjust the color as needed
      },
    },
  },
  plugins: [],
}

// tailwind.config.js

