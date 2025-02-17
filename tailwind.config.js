/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2bc8d6', //#0276A1 /#0281b0/#3085d6 Verde/azul verdoso principal
        secondary: '#ACF2E3', // Verde claro
        blackberry: '#8B5CF6', // Morado o lila
        accent: '#E3342F', // Color de acento adicional
        danger: '#EF4444', // Rojo brillante para estados de error o botones
        customBlue: '#1B99B5', // Azul personalizado
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        'spin-reverse': 'spin 1s linear infinite reverse', // Animación de rotación inversa
        bounce: 'bounce 1s infinite', // Rebote infinito
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      scale: {
        200: '2', // Escala al 200%
        300: '3', // Escala al 300%
      },
    },
  },
  plugins: [],
};
