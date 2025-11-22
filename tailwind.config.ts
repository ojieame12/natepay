import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Keep src just in case
  ],
  theme: {
    extend: {
      colors: {
        'feather-green': {
          DEFAULT: '#58CC02',
          active: '#46A302', // Darker for active state
        },
        'macaw-blue': {
          DEFAULT: '#1CB0F6',
          active: '#1899D6',
        },
        'cardinal-red': {
          DEFAULT: '#FF4B4B',
          active: '#D93A3A',
        },
        'fox-orange': {
          DEFAULT: '#FF9600',
          active: '#D97F00',
        },
        'bee-yellow': {
          DEFAULT: '#FFC800',
          active: '#E5B400',
        },
        'eel-black': '#4B4B4B',
        'wolf-grey': '#777777',
        'hare-grey': '#E5E5E5',
        'swan-white': '#FFFFFF',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        'btn': '0px 4px 0px 0px', // Hard shadow for 3D effect
      },
      fontFamily: {
        sans: ['"Nunito"', 'sans-serif'], // We'll need to import this
      }
    },
  },
  plugins: [],
}

export default config;
