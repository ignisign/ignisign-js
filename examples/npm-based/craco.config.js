
const tailwindcss = require('tailwindcss');

module.exports = {
  style: {
    postcss: {
      plugins: [
        tailwindcss,
        require('autoprefixer'),
      ],
    },
  },
  eslint: {
    enable: false,
  },
};
