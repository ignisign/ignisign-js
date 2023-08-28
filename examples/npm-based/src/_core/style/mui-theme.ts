
const focusedColor = "orange";
export const muiTheme = {
  palette: {
    type: 'dark',
    primary: {
      main: '#FD5B2D',
      light: '#FD5B2D',
      dark: '#FD5B2D'
    },
    text: {
      // primary: '#d1d5dc',
      // secondary: '#b2bac5',
      light: 'black',
      dark: 'white'
    },
    secondary: {
      main: '#d1d5dc',
      light: '#828282',
      dark: '#d1d5dc',
    },
    success: {
      light: '#1BB55C',
      main: '#21A796',
    },
    error: {
      main: '#f44336',
    }
  },

  overrides: {
    typography: {
      button: {
        textTransform: 'none'
      }
    },

    MuiSpeedDialAction: {
      staticTooltipLabel: {

        width : "200px",
      },
    },
  },
};


export default muiTheme;
