/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
      "./index.html",         // Your main HTML file
      "./src/**/*.{js,jsx,ts,tsx}",  // All JS/TS files in src folder
    ],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}

