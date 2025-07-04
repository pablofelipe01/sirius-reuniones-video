import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Neon colors
        'neon-cyan': '#00F5FF',
        'neon-purple': '#B026FF',
        'neon-pink': '#FF006E',
        'neon-green': '#39FF14',
        'neon-orange': '#FF6B00',
        'neon-blue': '#0080FF',
        
        // Background colors
        'bg-primary': '#0A0A0F',
        'bg-secondary': '#050507',
        'bg-tertiary': '#1A1A2E',
      },
      backgroundImage: {
        'gradient-neon': 'linear-gradient(135deg, #00F5FF 0%, #B026FF 100%)',
        'gradient-cyberpunk': 'linear-gradient(135deg, #B026FF 0%, #FF006E 100%)',
        'gradient-matrix': 'linear-gradient(135deg, #39FF14 0%, #008000 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #FA709A 0%, #FEE140 100%)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'rotate-slow': 'rotate 10s linear infinite',
        'glitch': 'glitch 0.3s ease-in-out infinite',
        'scanlines': 'scanlines 2s linear infinite',
        'typing': 'typing 3s steps(30) infinite, blink 1s infinite',
        'holographic-shift': 'holographic-shift 3s ease-in-out infinite',
        'matrix-rain': 'matrix-rain 20s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 5px #00F5FF'
          },
          '50%': {
            boxShadow: '0 0 20px #00F5FF, 0 0 30px #00F5FF'
          }
        },
        'float': {
          '0%, 100%': {
            transform: 'translateY(0px)'
          },
          '50%': {
            transform: 'translateY(-10px)'
          }
        },
        'rotate': {
          '0%': {
            transform: 'rotate(0deg)'
          },
          '100%': {
            transform: 'rotate(360deg)'
          }
        },
        'glitch': {
          '0%, 100%': {
            transform: 'translate(0)'
          },
          '10%': {
            transform: 'translate(-2px, 2px)'
          },
          '20%': {
            transform: 'translate(2px, -2px)'
          },
          '30%': {
            transform: 'translate(-2px, 2px)'
          },
          '40%': {
            transform: 'translate(2px, -2px)'
          },
          '50%': {
            transform: 'translate(-2px, 2px)'
          },
          '60%': {
            transform: 'translate(2px, -2px)'
          },
          '70%': {
            transform: 'translate(-2px, 2px)'
          },
          '80%': {
            transform: 'translate(2px, -2px)'
          },
          '90%': {
            transform: 'translate(-2px, 2px)'
          }
        },
        'scanlines': {
          '0%': {
            backgroundPosition: '0 0'
          },
          '100%': {
            backgroundPosition: '0 100%'
          }
        },
        'typing': {
          'from': {
            width: '0'
          },
          'to': {
            width: '100%'
          }
        },
        'blink': {
          '0%, 50%': {
            borderColor: 'transparent'
          },
          '51%, 100%': {
            borderColor: '#00F5FF'
          }
        },
        'holographic-shift': {
          '0%, 100%': {
            backgroundPosition: '0% 50%'
          },
          '50%': {
            backgroundPosition: '100% 50%'
          }
        },
        'matrix-rain': {
          '0%': {
            transform: 'translateY(-100%)'
          },
          '100%': {
            transform: 'translateY(100%)'
          }
        }
      },
      boxShadow: {
        'neon': '0 0 20px #00F5FF',
        'neon-strong': '0 0 30px #00F5FF, 0 0 60px #00F5FF',
        'purple-glow': '0 0 20px #B026FF',
        'pink-glow': '0 0 20px #FF006E',
        'green-glow': '0 0 20px #39FF14',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config 