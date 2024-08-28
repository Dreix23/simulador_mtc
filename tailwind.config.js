/** @type {import('tailwindcss').Config} */
const { addDynamicIconSelectors } = require("@iconify/tailwind");
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
      colors: {
        "color-gray": "#5B5555",
        "color-gray-line": "#E0E0E0",
        "color-red": "#D25353",
        "color-red-bg": "#B0000B",
        "color-gray-bg": "#FAFAFA",
        "color-gray-cover": "#F2F2F2",
        "color-purple-1": "#F5F6F8",
        "color-purple-2": "#E6E7EC",
        "color-blue-max": "#0A1B39",
        "color-green": "#16a34a",
      },
      boxShadow: {
        "shadow-form": "0px 0px 10.2px 0px rgba(0, 0, 0, 0.75);",
        "shadow-btn": "5px 4px 6.7px 0px #000;",
        "shadow-container": "0px 0px 5.9px 0px rgba(0, 0, 0, 0.57);",
      },
      border:{
        "line": "border: 1px #E0E0E0;",
      }
    },
  },
  plugins: [addDynamicIconSelectors()],
};
