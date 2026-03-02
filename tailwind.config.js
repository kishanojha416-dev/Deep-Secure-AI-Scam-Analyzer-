/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        pink: '#EC4899',
        dark: '#0F172A',
        muted: '#475569',
        page: '#F8FAFC',
        card: '#FFFFFF',
        borderLight: '#E2E8F0',
        safe: '#16A34A',
        suspicious: '#F59E0B',
        scam: '#DC2626',
      },
      boxShadow: {
        soft: '0 8px 20px rgba(15, 23, 42, 0.08)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
