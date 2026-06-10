/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        noir: {
          bg: '#020617',      // Pure black
          surface: '#0a0a0a', // Slightly lighter panels
          glass: 'rgba(10, 10, 10, 0.6)', 
          border: '#1e293b',  // Subtle borders
          borderHover: '#334155', 
          text: '#ffffff',    // Zinc 50
          muted: '#a1a1aa',   // Secondary text
          accent: '#3b82f6',  // Premium Sky Blue
          accentGlow: 'rgba(59, 130, 246, 0.1)',
          purple: '#f97316',  // Premium Violet
          primary: '#3b82f6', // Primary is Premium Sky Blue
          error: '#ff003c',   // Cyberpunk red
          success: '#00ff66', // Cyberpunk green
          warning: '#ffb300', // Cyberpunk yellow
        }
      },
      fontFamily: {
        mono: ['"Share Tech Mono"', 'monospace'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)' },
        }
      },
      backdropBlur: {
        md: '8px',
        lg: '16px',
        xl: '24px',
      }
    },
  },
  plugins: [],
}
