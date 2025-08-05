/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#1A1A1A', // Dark background from your summary, matches the images' blackish base
        neonCyan: '#00FFFF', // Bright cyan blue for glows, like in the logo and buttons
        neonPink: '#FF00FF', // Magenta pink for accents, matching the logo's edges
        neonText: '#FFFFFF', // White text for contrast on dark bg
      },
      boxShadow: {
        neon: '0 0 10px #00FFFF, 0 0 20px #FF00FF, 0 0 30px #00FFFF', // Multi-color glow shadow to mimic neon tube lighting
      },
      borderColor: {
        neon: '#00FFFF', // Default neon border, can override with pink if needed
      },
      backgroundImage: {
        'neon-gradient': 'linear-gradient(to right, #00FFFF, #FF00FF)', // Gradient for buttons/logos to match the multi-hue in images
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', // Subtle glow pulse for hover effects
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 }, // Fades slightly for a flickering neon feel
        },
      },
    },
  },
  plugins: [],
};