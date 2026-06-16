/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand primario
        brand: {
          50:  '#EBF0FB',
          100: '#C8D5F5',
          200: '#95ACEA',
          300: '#6283DE',
          400: '#3F64D4',
          500: '#1A56DB', // principal
          600: '#1545B8',
          700: '#103494',
          800: '#0B2470',
          900: '#061550',
        },
        // Grises neutros
        gray: {
          50:  '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        // Semánticos
        success: { light: '#D1FAE5', DEFAULT: '#059669', dark: '#065F46' },
        warning: { light: '#FEF3C7', DEFAULT: '#D97706', dark: '#92400E' },
        danger:  { light: '#FEE2E2', DEFAULT: '#DC2626', dark: '#991B1B' },
        info:    { light: '#DBEAFE', DEFAULT: '#2563EB', dark: '#1E40AF' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)',
      },
    },
  },
  plugins: [],
}
