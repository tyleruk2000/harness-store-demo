import type { Config } from "tailwindcss";

/**
 * Semantic tokens map to CSS custom properties defined in globals.css (OKLCH).
 * Keeping the raw values in CSS lets us theme without touching Tailwind config
 * and keeps the palette readable in one place.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "oklch(var(--color-bg) / <alpha-value>)",
        surface: "oklch(var(--color-surface) / <alpha-value>)",
        "surface-2": "oklch(var(--color-surface-2) / <alpha-value>)",
        border: "oklch(var(--color-border) / <alpha-value>)",
        "border-strong": "oklch(var(--color-border-strong) / <alpha-value>)",
        ink: "oklch(var(--color-ink) / <alpha-value>)",
        "ink-strong": "oklch(var(--color-ink-strong) / <alpha-value>)",
        muted: "oklch(var(--color-muted) / <alpha-value>)",
        "muted-2": "oklch(var(--color-muted-2) / <alpha-value>)",
        primary: {
          50: "oklch(var(--color-primary-50) / <alpha-value>)",
          100: "oklch(var(--color-primary-100) / <alpha-value>)",
          200: "oklch(var(--color-primary-200) / <alpha-value>)",
          300: "oklch(var(--color-primary-300) / <alpha-value>)",
          400: "oklch(var(--color-primary-400) / <alpha-value>)",
          500: "oklch(var(--color-primary-500) / <alpha-value>)",
          600: "oklch(var(--color-primary-600) / <alpha-value>)",
          700: "oklch(var(--color-primary-700) / <alpha-value>)",
          800: "oklch(var(--color-primary-800) / <alpha-value>)",
          900: "oklch(var(--color-primary-900) / <alpha-value>)",
          950: "oklch(var(--color-primary-950) / <alpha-value>)",
          DEFAULT: "oklch(var(--color-primary-600) / <alpha-value>)",
        },
        accent: {
          400: "oklch(var(--color-accent-400) / <alpha-value>)",
          500: "oklch(var(--color-accent-500) / <alpha-value>)",
          600: "oklch(var(--color-accent-600) / <alpha-value>)",
          700: "oklch(var(--color-accent-700) / <alpha-value>)",
          DEFAULT: "oklch(var(--color-accent-500) / <alpha-value>)",
        },
        success: "oklch(var(--color-success) / <alpha-value>)",
        warning: "oklch(var(--color-warning) / <alpha-value>)",
        danger: "oklch(var(--color-danger) / <alpha-value>)",
        info: "oklch(var(--color-info) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        card: "0 1px 2px oklch(0.45 0.06 285 / 0.04), 0 4px 16px oklch(0.45 0.06 285 / 0.06)",
        "card-hover": "0 2px 6px oklch(0.45 0.10 285 / 0.08), 0 12px 32px oklch(0.45 0.10 285 / 0.12)",
        glow: "0 8px 30px oklch(0.70 0.185 55 / 0.30)",
      },
      zIndex: {
        dropdown: "1000",
        sticky: "1100",
        backdrop: "1200",
        modal: "1300",
        toast: "1400",
        tooltip: "1500",
      },
      transitionTimingFunction: {
        "out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
