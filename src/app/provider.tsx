import { store } from '@app/store';
import { theme } from '@config/muiTheme';
import { ThemeProvider } from '@mui/material';
import { GoogleOAuthProvider } from '@react-oauth/google';
import * as React from 'react';
import { Provider } from 'react-redux';
import { NotificationProvider } from '@contexts/NotificationContext';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export function AppProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <NotificationProvider>{children}</NotificationProvider>
        </ThemeProvider>
      </Provider>
    </GoogleOAuthProvider>
  );
}
