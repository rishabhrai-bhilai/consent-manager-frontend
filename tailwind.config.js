/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Adjust this based on your project structure
  ],
  darkMode: 'class', // Enables dark mode via the 'dark' class on the body or html element
  theme: {
    extend: {
      colors: {
        // Light Theme Colors
        primary: '#8d55fe',       // Violet shade for buttons, links, accents
        secondary: '#EFF8FF',     // Light violet for card backgrounds, highlights light violet->  #EFF8FF
        background: '#F7FAFC',    // Main background color
        text: '#333333',          // Primary text color (dark gray)
        accent: '#8d55fe',        // Darker violet for hover states, borders
        outlines:'#E2E8F0',
        // Dark Theme Colors
        'dark-primary': '#7F9CF5',    // Lighter violet for contrast in dark mode
        'dark-secondary': '#2D3748',  // Dark gray for card backgrounds
        'dark-background': '#060606', // Deep black for main background
        'dark-background-secondary': '#181818', // Slightly lighter black for alternative backgrounds
        'dark-text': '#E2E8F0',       // Light gray for primary text
        'dark-accent': '#B794F4',     // Bright violet for hover states, borders
      },
      scrollbar: {
        hide: {
          '&::-webkit-scrollbar': { display: 'none' },
          '-ms-overflow-style': 'none', // IE and Edge
          'scrollbar-width': 'none',   // Firefox
        },
      },
    },
  },
  plugins: [],
};