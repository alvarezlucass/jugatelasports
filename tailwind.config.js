/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#ffffff',
        foreground: '#2c3e50',
        primary: {
          DEFAULT: '#2ecc71',
          hover: '#27ae60',
        },
        secondary: '#3498db',
        accent: '#f39c12',
        muted: '#95a5a6',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // We'll need to import Inter later if not default
      }
    },
  },
  plugins: [],
}
