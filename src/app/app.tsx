import { AppProvider } from '@app/provider';
import { router } from '@app/router';
import type { JSX } from 'react';
import { RouterProvider } from 'react-router';
import { ToastContainer } from 'react-toastify';
import { BadgeCheck, CircleAlert, Info, TriangleAlert } from 'lucide-react';

function App(): JSX.Element {
  return (
    <AppProvider>
      <RouterProvider router={router} />
      <ToastContainer
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        icon={({ type }) => {
          switch (type) {
            case 'info':
              return <Info className="stroke-indigo-400" />;
            case 'error':
              return <CircleAlert className="stroke-red-500" />;
            case 'success':
              return <BadgeCheck className="stroke-green-500" />;
            case 'warning':
              return <TriangleAlert className="stroke-yellow-500" />;
            default:
              return null;
          }
        }}
      />
    </AppProvider>
  );
}

export default App;
