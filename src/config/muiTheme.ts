import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  typography: {
    fontFamily: "'Nunito', sans-serif",
  },
  palette: {
    primary: {
      main: '#9fd356', // Updated to match index.css --color-primary-500
      light: '#b8e986',
      dark: '#7ab82d',
      contrastText: '#ffffff', // White text on green buttons
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
          color: '#7FAE9B',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          padding: '8px 16px',

          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#7FAE9B',
          },

          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#7FAE9B',
          },

          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#14143D',
          },

          '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: '#F53425',
          },

          '&.Mui-focused': {
            color: '#14143D',
          },

          '&.Mui-error': {
            color: '#F53425',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          textTransform: 'none',
          ...(ownerState.color === 'primary' && {
            '&.Mui-disabled': {
              background: '#48888633',
              color: '#264F67B2',
            },
          }),
          ...(ownerState.color === 'secondary' && {
            '&.Mui-disabled': {
              background: '#7FAE9B33',
              color: '#888888',
            },
          }),
        }),
      },
    },
  },
});
