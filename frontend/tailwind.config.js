/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontSize: {
        'xxs': ['0.625rem', { lineHeight: '0.875rem' }],  // 10px / 14px
        'xs':  ['0.75rem',  { lineHeight: '1rem' }],       // 12px / 16px  (overrides Tailwind default)
        'sm':  ['0.875rem', { lineHeight: '1.25rem' }],    // 14px / 20px  (overrides Tailwind default)
      },
      colors: {
        primary: {
          DEFAULT: '#0B3D2E',
          50:  '#E6F0EC',
          100: '#C2D9CE',
          200: '#9BC1AE',
          300: '#74A98E',
          400: '#4D916E',
          500: '#0B3D2E',
          600: '#093527',
          700: '#072C20',
          800: '#052319',
          900: '#031A12',
        },
        secondary: {
          DEFAULT: '#22C55E',
          50:  '#E8FBF0',
          100: '#C5F5D9',
          200: '#9EEEC0',
          300: '#77E7A7',
          400: '#4EDE8C',
          500: '#22C55E',
          600: '#1BA84F',
          700: '#148B40',
          800: '#0E6E31',
          900: '#085122',
        },
        tertiary: {
          DEFAULT: '#F472B6',
          50:  '#FEF0F7',
          100: '#FDD9EC',
          200: '#FBB8DA',
          300: '#F897C8',
          400: '#F685BE',
          500: '#F472B6',
          600: '#D4569A',
          700: '#B03C7E',
          800: '#8C2562',
          900: '#681046',
        },
        neutral: {
          DEFAULT: '#1A1A1A',
          50:  '#F5F5F5',
          100: '#E0E0E0',
          200: '#BDBDBD',
          300: '#9E9E9E',
          400: '#757575',
          500: '#1A1A1A',
          600: '#161616',
          700: '#121212',
          800: '#0E0E0E',
          900: '#0A0A0A',
        },
        background: {
          primary:   '#FFFFFF',
          secondary: '#F0F0EF',
          card:      '#F7F7F7',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          raised:  '#F7F7F7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
