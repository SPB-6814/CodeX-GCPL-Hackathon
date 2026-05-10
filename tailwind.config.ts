import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./community_hub/**/*.{html,js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "on-secondary": "#ffffff",
        "on-primary-fixed": "#002022",
        "on-secondary-container": "#3c6a6e",
        "tertiary-fixed": "#ffdbc7",
        "surface-variant": "#dee3e4",
        "on-primary": "#ffffff",
        "surface-container": "#e9eff0",
        "surface-container-low": "#eff5f5",
        "on-tertiary-fixed-variant": "#733500",
        "primary-fixed-dim": "#49d9e5",
        tertiary: "#964906",
        secondary: "#38656a",
        "primary-fixed": "#7ef4ff",
        "surface-tint": "#006970",
        "on-surface": "#171d1e",
        "on-tertiary-container": "#6b3100",
        error: "#ba1a1a",
        "on-primary-fixed-variant": "#004f55",
        "on-background": "#171d1e",
        "secondary-container": "#b9e8ed",
        "on-secondary-fixed-variant": "#1e4d52",
        "surface-container-highest": "#dee3e4",
        background: "#f5fafb",
        "secondary-fixed-dim": "#a0cfd4",
        "error-container": "#ffdad6",
        "surface-bright": "#f5fafb",
        "on-tertiary": "#ffffff",
        "surface-container-high": "#e4e9ea",
        "inverse-surface": "#2b3132",
        "outline-variant": "#bbc9ca",
        "on-error": "#ffffff",
        "secondary-fixed": "#bcebf0",
        "primary-container": "#1dc0cc",
        surface: "#f5fafb",
        primary: "#006970",
        "surface-dim": "#d5dbdc",
        "inverse-primary": "#49d9e5",
        "tertiary-container": "#f89652",
        "tertiary-fixed-dim": "#ffb688",
        "on-tertiary-fixed": "#311300",
        "inverse-on-surface": "#ecf2f3",
        "on-surface-variant": "#3c494a",
        "surface-container-lowest": "#ffffff",
        outline: "#6c7a7b",
        "on-secondary-fixed": "#002023",
        "on-error-container": "#93000a",
        "on-primary-container": "#00494f"
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px"
      },
      spacing: {
        md: "24px",
        base: "8px",
        xs: "4px",
        "container-margin": "20px",
        gutter: "16px",
        lg: "40px",
        sm: "12px",
        xl: "64px"
      },
      fontFamily: {
        "body-lg": ["Manrope"],
        "label-sm": ["Manrope"],
        "headline-md": ["Manrope"],
        "headline-lg": ["Manrope"],
        "display-score": ["Manrope"],
        "body-md": ["Manrope"],
        headline: ["Manrope"],
        display: ["Manrope"],
        body: ["Manrope"],
        label: ["Manrope"]
      },
      fontSize: {
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "label-sm": ["13px", { lineHeight: "18px", letterSpacing: "0.02em", fontWeight: "600" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "display-score": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }]
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
};
export default config;
