/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontSize: {
        "size-10": "10px",
        "size-11": "11px",
        "size-12": "12px",
        "size-14": "14px",
        "size-15": "15px",
        "size-16": "16px",
        "size-18": "18px",
        "size-20": "20px",
      },
      colors:{
        "color-gray": "#5B5555",
      },
      boxShadow: {
        'shadow-form': '0px 0px 15.4px 0px rgba(0, 0, 0, 0.25)',
        'shadow-btn': '2px 3px 2.8px 0px rgba(0, 0, 0, 0.25);'
      }
    },
  },
  plugins: [],
};
