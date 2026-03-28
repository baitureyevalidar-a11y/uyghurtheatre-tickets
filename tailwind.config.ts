import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F5F0E8',
        burgundy: '#8B1A1A',
        'burgundy-light': '#A52525',
        'burgundy-dark': '#6B1010',
        gold: '#D4AF37',
        'gold-light': '#E8C84A',
        'gold-dark': '#B8962E',
        brown: '#3D2B1F',
        darkBrown: '#1A1A1A',
        charcoal: '#2D2D2D',
      },
      fontFamily: {
        heading: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Noto Sans', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #8B1A1A 0%, #D4AF37 100%)',
        'gradient-dark': 'linear-gradient(180deg, #1A1A1A 0%, #2D2D2D 100%)',
        'gradient-hero': 'linear-gradient(135deg, #1A1A1A 0%, #8B1A1A 50%, #1A1A1A 100%)',
        'gradient-card': 'linear-gradient(180deg, transparent 0%, rgba(26,26,26,0.95) 100%)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOutRight: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '0.6' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(212,175,55,0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(212,175,55,0.6)' },
        },
        flip: {
          '0%': { transform: 'rotateX(0deg)' },
          '50%': { transform: 'rotateX(90deg)' },
          '100%': { transform: 'rotateX(0deg)' },
        },
        seatPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212,175,55,0.7)' },
          '70%': { boxShadow: '0 0 0 8px rgba(212,175,55,0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out',
        fadeInUp: 'fadeInUp 0.6s ease-out forwards',
        fadeInDown: 'fadeInDown 0.5s ease-out forwards',
        fadeInLeft: 'fadeInLeft 0.6s ease-out forwards',
        fadeInRight: 'fadeInRight 0.6s ease-out forwards',
        scaleIn: 'scaleIn 0.3s ease-out',
        slideUp: 'slideUp 0.4s ease-out',
        slideDown: 'slideDown 0.4s ease-out',
        slideInRight: 'slideInRight 0.3s ease-out',
        slideOutRight: 'slideOutRight 0.3s ease-in',
        shimmer: 'shimmer 2s infinite linear',
        marquee: 'marquee 30s linear infinite',
        ripple: 'ripple 0.6s linear',
        float: 'float 3s ease-in-out infinite',
        glow: 'glow 2s ease-in-out infinite',
        flip: 'flip 0.6s ease-in-out',
        seatPulse: 'seatPulse 1.5s ease-out infinite',
      },
      boxShadow: {
        'gold': '0 4px 20px rgba(212, 175, 55, 0.3)',
        'gold-lg': '0 8px 40px rgba(212, 175, 55, 0.4)',
        'burgundy': '0 4px 20px rgba(139, 26, 26, 0.3)',
        'card': '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
        'card-hover': '0 20px 40px -8px rgba(0,0,0,0.2)',
      },
    },
  },
  plugins: [],
};

export default config;
