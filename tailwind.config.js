/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#00FF78',
        'primary-green': '#4CCD59',
        'gradient-orange': '#FB9E47',
        'gradient-blue': '#2A6EF5',
        'button-green-start': '#19BF2A',
        'button-green-end': '#88FEC0',
      },
    },
  },
  plugins: [],
}

