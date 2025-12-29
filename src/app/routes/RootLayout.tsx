import { type JSX } from 'react';
import { Outlet } from 'react-router-dom';

const RootLayout = (): JSX.Element => {
  return (
    <>
      <div className="app-layout">
        <main className="content">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default RootLayout;
