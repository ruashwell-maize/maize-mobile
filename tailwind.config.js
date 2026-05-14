/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}', './lib/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        maize: {
          primary: '#5F7C8A',
          hover:   '#4A6370',
          light:   '#E8EDEF',
          ink:     '#2d3748',
          muted:   '#718096',
        },
      },
    },
  },
  plugins: [],
};
