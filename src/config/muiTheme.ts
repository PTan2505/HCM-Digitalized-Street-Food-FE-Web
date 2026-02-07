import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#264F67',
      contrastText: '#F6F6F6',
    },
    secondary: {
      main: '#7FAE9B',
      contrastText: '#F6F6F6',
    },
    success: {
      main: '#00b37466',
      contrastText: '#F6F6F6',
    },
    error: {
      main: '#f5342566',
      contrastText: '#F53425',
    },
    warning: {
      main: '#e394004d',
      contrastText: '#F6F6F6',
    },
  },
  components: {
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          '&.Mui-error': {
            color: '#F53425',
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: '#F9FFF9',
          width: '100%',
          height: '40px',
          border: `1px solid #7FAE9B`,
          borderRadius: '20px',
          padding: '8px 16px',
          color: '#7FAE9B',

          '&.Mui-focused': {
            borderColor: '#14143D',
            color: ' #14143D',
          },

          '&.Mui-error': {
            borderColor: '#F53425',
            color: '#F53425',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: ({ ownerState }) => {
          switch (ownerState.color) {
            case 'primary':
              return {
                '&.Mui-disabled': {
                  background: '#48888633',
                  color: '#264F67B2',
                },
              };
            case 'secondary':
              return {
                '&.Mui-disabled': {
                  background: '#7FAE9B33',
                  color: '#888888',
                },
              };
            default:
              return;
          }
        },
      },
    },
  },
});
