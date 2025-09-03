import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        // Material 3 System Colors
        "md-sys-color-background": "hsl(var(--md-sys-color-background))",
        "md-sys-color-surface": "hsl(var(--md-sys-color-surface))",
        "md-sys-color-surface-variant": "hsl(var(--md-sys-color-surface-variant))",
        "md-sys-color-surface-container": "hsl(var(--md-sys-color-surface-container))",
        "md-sys-color-surface-container-high": "hsl(var(--md-sys-color-surface-container-high))",
        "md-sys-color-surface-container-highest": "hsl(var(--md-sys-color-surface-container-highest))",
        "md-sys-color-on-background": "hsl(var(--md-sys-color-on-background))",
        "md-sys-color-on-surface": "hsl(var(--md-sys-color-on-surface))",
        "md-sys-color-on-surface-variant": "hsl(var(--md-sys-color-on-surface-variant))",
        "md-sys-color-outline": "hsl(var(--md-sys-color-outline))",
        "md-sys-color-outline-variant": "hsl(var(--md-sys-color-outline-variant))",
        "md-sys-color-primary": "hsl(var(--md-sys-color-primary))",
        "md-sys-color-on-primary": "hsl(var(--md-sys-color-on-primary))",
        "md-sys-color-primary-container": "hsl(var(--md-sys-color-primary-container))",
        "md-sys-color-on-primary-container": "hsl(var(--md-sys-color-on-primary-container))",
        "md-sys-color-secondary": "hsl(var(--md-sys-color-secondary))",
        "md-sys-color-on-secondary": "hsl(var(--md-sys-color-on-secondary))",
        "md-sys-color-secondary-container": "hsl(var(--md-sys-color-secondary-container))",
        "md-sys-color-on-secondary-container": "hsl(var(--md-sys-color-on-secondary-container))",
        "md-sys-color-tertiary": "hsl(var(--md-sys-color-tertiary))",
        "md-sys-color-on-tertiary": "hsl(var(--md-sys-color-on-tertiary))",
        "md-sys-color-tertiary-container": "hsl(var(--md-sys-color-tertiary-container))",
        "md-sys-color-on-tertiary-container": "hsl(var(--md-sys-color-on-tertiary-container))",
        "md-sys-color-error": "hsl(var(--md-sys-color-error))",
        "md-sys-color-on-error": "hsl(var(--md-sys-color-on-error))",
        "md-sys-color-error-container": "hsl(var(--md-sys-color-error-container))",
        "md-sys-color-on-error-container": "hsl(var(--md-sys-color-on-error-container))",
        
        // Pillar colors
        "health": "hsl(var(--health))",
        "health-container": "hsl(var(--health-container))",
        "on-health-container": "hsl(var(--on-health-container))",
        "relationships": "hsl(var(--relationships))",
        "relationships-container": "hsl(var(--relationships-container))",
        "on-relationships-container": "hsl(var(--on-relationships-container))",
        "work": "hsl(var(--work))",
        "work-container": "hsl(var(--work-container))",
        "on-work-container": "hsl(var(--on-work-container))",

        // Shadcn compatibility
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        xs: "var(--shape-corner-extra-small)",
        sm: "var(--shape-corner-small)",
        md: "var(--shape-corner-medium)",
        lg: "var(--shape-corner-large)",
        xl: "var(--shape-corner-extra-large)",
        DEFAULT: "var(--radius)",
      },
      boxShadow: {
        'elevation-1': 'var(--elevation-1)',
        'elevation-2': 'var(--elevation-2)',
        'elevation-3': 'var(--elevation-3)',
        'elevation-4': 'var(--elevation-4)',
        'elevation-5': 'var(--elevation-5)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(8px)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s var(--motion-easing-standard)",
        "fade-out": "fade-out 0.3s var(--motion-easing-standard)",
        "scale-in": "scale-in 0.2s var(--motion-easing-emphasized)",
        "slide-up": "slide-up 0.3s var(--motion-easing-emphasized)",
      },
      transitionTimingFunction: {
        'standard': 'var(--motion-easing-standard)',
        'emphasized': 'var(--motion-easing-emphasized)',
        'decelerated': 'var(--motion-easing-decelerated)',
        'accelerated': 'var(--motion-easing-accelerated)',
      },
      transitionDuration: {
        'short': 'var(--motion-duration-short4)',
        'medium': 'var(--motion-duration-medium2)',
        'long': 'var(--motion-duration-long2)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;