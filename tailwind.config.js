/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        cream: "#f5f5dc",
        charcoal: "#1a1a1a",
        gold: {
          DEFAULT: "#d4af37",
          light: "#e6c158" // Adding gold-light color
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ...existing code...
      },
      fontFamily: {
        'serif': ['Playfair Display', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Cormorant Garamond', 'serif'],
        'accent': ['Marcellus', 'serif'],
        'alt': ['Raleway', 'sans-serif'],
      },
      // ...existing code...
    },
  },
  // ...existing code...
}