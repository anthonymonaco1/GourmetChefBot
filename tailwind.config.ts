import type { Config } from "tailwindcss";
import chroma from 'chroma-js';

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        "eton-blue": "#A0D1CA",
        "coral-pink": '#F4A191',
        "powder-blue": '#33BFC4',
        "dark-eton-blue": chroma("#A0D1CA").darken(1.5).hex(),
        "dark-powder-blue": chroma("#3BC6C4").darken(0.5).hex(),
        "light-powder-blue": chroma("#3BC6C4").brighten(0.5).hex(),
        "pseudo-white": '#E5E5E5',
        "disabled": "#C5C5D1"
      },
      minHeight: {
        '1/2': '50%',
        '2/5': '40%',
        '1/3': '33%'
      },
      maxHeight: {
        '9/10': '90%',
        '8/10': '80%',
        '7/10': '70%',
        '75': '75%',
        '65': '65%',
        '35': '35%',
        '97.5': '97.5%'
      },
      height: {
        '97.5': '97.5%'
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;
