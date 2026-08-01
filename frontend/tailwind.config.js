/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        mint: '#abebd9',
        'mint-light': '#f0faf7',
        'mint-border': '#d4f0e8',
        teal: '#1a3a3a',
        body: '#4a5568',
        label: '#6b7c6b',
      },
    },
  },
  plugins: [],
}
