import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'neutral50': '#FAFAFA',
        'neutral300': '#D4D4D4',
        'neutral900': '#171717',
        'navy50': '#F8FAFC',
        'navy100': '#F1F5F9',
        'navy200': '#E2E8F0',
        'navy500': '#64748B',
        'navy600': '#475569',
        'navy700': '#334155',
        'navy900': '#161C2D',
        'cherry': '#CD2026',
        'cherryDark': '#B91C1C',
        'pubnubbabyblue': '#C3E6FA',
        'success': '#22C55E',
        'inputring': '#57969C',
        'statusIndicatorInfo100': '#DBEAFE',
        'statusIndicatorSuccess100': '#DCFCE7'
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
