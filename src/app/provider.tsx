import { store } from '@app/store';
import { theme } from '@config/muiTheme';
import { ThemeProvider } from '@mui/material';
import { AuthProvider } from '@contexts/AuthContext';
import * as React from 'react';
import { Provider } from 'react-redux';

export function AppProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </Provider>
  );
}
