/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-jakarta)', 'sans-serif'],
        display: ['var(--font-space)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        bento: {
          dark: "#080c14",
          card: "#0f1626",
          cardHover: "#152037",
          border: "#1e293b",
          borderHighlight: "#334155",
        },
        sbi: {
          50: "#f0f4fd",
          100: "#e0eafd",
          200: "#c7d9fc",
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#1e40af",
          800: "#1e3a8a",
          900: "#172554",
        },
      },
      boxShadow: {
        bento: "0 10px 30px -10px rgba(0,0,0,0.5), inset 0 1px 0 0 rgba(255,255,255,0.06)",
        bentoGlow: "0 0 40px -10px rgba(37,99,235,0.25), inset 0 1px 0 0 rgba(255,255,255,0.1)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-pattern': 'radial-gradient(circle at 50% 0%, rgba(37, 99, 235, 0.15), transparent 50%), radial-gradient(circle at 100% 100%, rgba(16, 185, 129, 0.08), transparent 40%)',
      },
    },
  },
  plugins: [],
};
