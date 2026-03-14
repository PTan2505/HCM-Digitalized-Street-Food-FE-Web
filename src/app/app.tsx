import { AppProvider } from '@app/provider';
import { router } from '@app/router';
import type { JSX } from 'react';
import { RouterProvider } from 'react-router';
import { ToastContainer } from 'react-toastify';

function App(): JSX.Element {
  return (
    <AppProvider>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </AppProvider>
  );
}

export default App;
