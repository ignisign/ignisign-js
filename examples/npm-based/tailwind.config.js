
// ussage of https://github.com/jjranalli/nightwind

const primary = {
  50: '#ffefea',
  100: '#ffded5',
  200: '#febdab',
  300: '#fe9d81',
  400: '#fd7c57',
  500: '#fd5b2d',
  600: '#ca4924',
  700: '#98371b',
  800: '#652412',
  900: '#331209',
  A100: '#b3f5ff',
  A200: '#80eeff',
  A400: '#4de8ff',
  A700: '#33e4ff',
  'contrastDefaultColor': 'light',
};

//EDC96A

const secondary = {


  50: '#fdf5e6',
  100: '#fae6c2',
  200: '#f7d599',
  300: '#f3c470',
  400: '#f1b751',
  500: '#eeaa32',
  600: '#eca32d',
  700: '#e99926',
  800: '#e7901f',
  900: '#e27f13',
  A100: '#ffffff',
  A200: '#ffeede',
  A400: '#ffd4ab',
  A700: '#ffc791',
  'contrastDefaultColor': 'light',
};


const error = {
  50: '#fee8e7',
  100: '#fcc7c3',
  200: '#faa19b',
  300: '#f77b72',
  400: '#f65f54',
  500: '#f44336',
  600: '#f33d30',
  700: '#f13429',
  800: '#ef2c22',
  900: '#ec1e16',
  A100: '#ffffff',
  A200: '#ffe9e9',
  A400: '#ffb8b6',
  A700: '#ff9f9c',
  'contrastDefaultColor': 'light',
};

const colorShades = [ 50, 100, 200, 300, 400, 500, 600, 700, 800, 900 ];
const whitelist = (colorShades.map(c =>
    [`bg-primary-${c}`, `bg-secondary-${c}`, `text-primary-${c}`, `text-secondary-${c}` ])).flat();

// console.log({whitelist});

module.exports = {
  purge: {
    content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
    options: {
      whitelist: whitelist,
      safelist: whitelist,
    }
  },
  darkMode: "class", // or 'media' or 'class'
  theme: {
    minHeight: {
      p100: '100px',
    },
    fontFamily: {
      copy: ['Courier Prime']
    },

    // colors: {
    //   primary : colors.indigo
    // },
    container: {
      center: true,
    },
    extend: {
      zIndex: {
        '-10': '-10',
        '100' : '100',
        '200' : '200',
        '300' : '300',
        '1500' : '1500',
      },
      colors: {
        primary: primary,
        secondary: secondary,
        error : error

      },
      lineHeight: {
        '12': '3rem',
        '14': '3.5rem',
      },
      maxWidth : {
        '256' : '64rem',
      },
      spacing: {
        '160': '40rem',
        '200': '50rem',

        '2/3': '66.666667%',
        '1/3': '33.333333%'
      }
    },
  },
  variants: {

    extend: {
      
     
      borderWidth: ['hover', 'focus'],
      display : [ "hover"],
      padding : [ "hover" ],
      margin : [ "hover" ],
      fontWeight : [ "hover"],
      outline : [ "focus"],
      backgroundColor: ['disabled', 'active', 'focus'],
      opacity: ['disabled'],
    },
  },
  plugins: [
    require("nightwind"),
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
