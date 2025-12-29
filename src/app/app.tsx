import { AppProvider } from '@app/provider';
import { router } from '@app/router';
import type { JSX } from 'react';
import { RouterProvider } from 'react-router';

function App(): JSX.Element {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}

export default App;
