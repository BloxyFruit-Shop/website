import { scrollbarGutter, scrollbarWidth, scrollbarColor } from "tailwind-scrollbar-utilities"
import tailwindCssAnimate from "tailwindcss-animate"
import tailwindContainerQueries from "@tailwindcss/container-queries"

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    screens: {
      sm: "600px",
      md: "1080px",
      lg: "1300px",
      xl: "1536px"
    },
    extend: {
      content: {
        empty: '""'
      },
      opacity: {
        '1': '0.01',
        '2': '0.02',
        '3': '0.03',
        '4': '0.04',
        '6': '0.06',
        '7': '0.07',
        '8': '0.08',
        '9': '0.09',
      },
      colors: {
        "background": "#0C0E16",
        "paper": "#0b0e22",
        "edge": "#1e2239",
        "aquan-400": "#b4c4d2",
        "aquan-500": "#a2bcd4",
        "accent-400": "#92e3ff",
        "accent-500": "#00bdff",
      },
      keyframes: {
        scaleX: {
          '0%': { transform: "scaleX(0)" },
          '100%': { transform: "scaleX(1)" },
        },
        float: {
          '0%': { transform: 'translateY(0) rotate(var(--rotation))' },
          '50%': { transform: 'translateY(-14px) rotate(var(--adjusted-rotation))' },
          '100%': { transform: 'translateY(0) rotate(var(--rotation))' },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-100% - var(--gap)))" },
        },
      },
      animation: {
        'scale-x': 'scaleX 1s',
        marquee: "marquee var(--duration) linear infinite",
        float: 'float var(--duration) ease-in-out infinite',
      }
    },
  },
  plugins: [
    scrollbarGutter(), scrollbarWidth(), scrollbarColor(), tailwindCssAnimate, tailwindContainerQueries
  ]
}
