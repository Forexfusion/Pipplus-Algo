/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    "text-green-400",
    "text-red-400",
    "hover:bg-gray-800",
    "text-right",
    "font-bold",
    "bg-gray-800",
    "text-gray-300",
    "text-gray-400",
    "divide-y",
    "divide-gray-700",
    "bg-[#0E1328]",
    "px-6",
    "py-3",
    "py-2",
    "rounded-lg",
    "shadow-lg",
    "overflow-x-auto",
    "whitespace-nowrap",
    "text-center",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
