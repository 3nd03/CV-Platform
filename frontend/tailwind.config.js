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
        purple: '#7c3aed',
        gold: '#d97706',
        'page-bg': '#f7f8fa',
        'card-border': '#eeeeee',
        'sidebar-border': '#f0f0f0',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.1)',
      },
      transitionDuration: {
        DEFAULT: '150ms',
      },
      maxWidth: {
        content: '900px',
      },
      spacing: {
        sidebar: '220px',
      },
    },
  },
  plugins: [],
}
