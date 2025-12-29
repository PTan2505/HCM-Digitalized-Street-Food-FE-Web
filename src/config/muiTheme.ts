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
});
