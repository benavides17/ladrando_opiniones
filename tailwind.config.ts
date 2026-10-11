import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta moderna Azul Petróleo & Fresca:
        // 1. Fondos y contenedores azules
        deepblue: {
          950: '#070E11', // Fondo más oscuro
          900: '#0B1519', // Fondo base de la página
          850: '#0E1D23', // Degradado intermedio
          800: '#12252C', // Contenedor secundario
          750: '#162D36', // Fondo tarjetas
          700: '#1B3641', // Fondo tarjetas hover
          600: '#234451', // Bordes sutiles
          500: '#2D5566', // Bordes interactivos
        },
        // 2. Verde azulado / Teal (#277D8E)
        teal: {
          50: '#f0f9fa',
          100: '#daf0f3',
          200: '#b8e3e9',
          300: '#87cfdb',
          400: '#4fb2c5',
          500: '#277D8E', // Verde azulado principal
          600: '#216c7b',
          700: '#1c5a66',
          800: '#184a54',
          900: '#143b43',
          DEFAULT: '#277D8E',
        },
        // 3. Menta (#9FD3CB)
        menta: {
          50: '#f4faf9',
          100: '#e5f5f2',
          200: '#ccebe6',
          300: '#9FD3CB', // Menta fresca acento
          400: '#75b9af',
          500: '#539e94',
          600: '#3e7f77',
          DEFAULT: '#9FD3CB',
        },
        // 4. Amarillo dorado (#EEB756)
        dorado: {
          50: '#fdfaf2',
          100: '#fbf3de',
          200: '#f7e4b9',
          300: '#f2cf8d',
          400: '#EEB756', // Amarillo dorado CTA
          500: '#e29e37',
          600: '#c57c28',
          700: '#9c5c22',
          DEFAULT: '#EEB756',
        },
        // 5. Azul petróleo (#283D43)
        petroleo: {
          50: '#f2f5f6',
          100: '#dfe7e9',
          200: '#c2d2d6',
          300: '#9ab6bc',
          400: '#6d949c',
          500: '#4e757e',
          600: '#3c5d65',
          700: '#283D43',
          800: '#213237',
          900: '#1a272b',
          950: '#111a1d',
          DEFAULT: '#283D43',
        },
        // Blanco humo
        humo: {
          50: '#ffffff',
          100: '#F5F7F6',
          200: '#e9eeec',
          300: '#d7dfdc',
          400: '#bac4c0',
          DEFAULT: '#F5F7F6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        glowTeal: '0 0 25px -4px rgba(39, 125, 142, 0.45)',
        glowGold: '0 0 25px -4px rgba(238, 183, 86, 0.45)',
        card: '0 10px 30px -5px rgba(5, 12, 15, 0.6)',
      },
    },
  },
  plugins: [],
};

export default config;
