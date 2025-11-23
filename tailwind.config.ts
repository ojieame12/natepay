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
        // Ledger Palette
        'alabaster': '#FAFAF9',
        'ink-black': '#0A0A0A',
        'racing-green': {
          DEFAULT: '#1A4D2E',
          active: '#143D24',
        },
        'acid-lime': '#D4F34A',
        'ledger-grey': '#E5E5E5',

        // Legacy Mappings (to prevent immediate breakage, mapped to new palette)
        'feather-green': '#1A4D2E', // Maps to Racing Green
        'macaw-blue': '#0A0A0A',    // Maps to Ink Black (Secondary actions)
        'cardinal-red': '#FF4B4B',  // Keep Red for errors
        'fox-orange': '#D4F34A',    // Maps to Acid Lime
        'bee-yellow': '#D4F34A',    // Maps to Acid Lime
        'eel-black': '#0A0A0A',     // Maps to Ink Black
        'wolf-grey': '#777777',     // Keep Grey
        'hare-grey': '#E5E5E5',     // Maps to Ledger Grey
        'swan-white': '#FAFAF9',    // Maps to Alabaster
      },
      borderRadius: {
        'xl': '8px',   // Tighter
        '2xl': '12px', // Tighter
        '3xl': '16px', // Tighter
      },
      boxShadow: {
        'btn': '0px 0px 0px 0px', // Flat
        'lift': '0px 4px 12px rgba(0,0,0,0.08)', // Soft lift
      },
      fontFamily: {
        sans: ['"Satoshi"', 'sans-serif'],
        display: ['"Clash Display"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      }
    },
  },
  plugins: [],
}

export default config;
