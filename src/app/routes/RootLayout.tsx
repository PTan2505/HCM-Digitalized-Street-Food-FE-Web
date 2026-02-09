import Navbar from '@components/Navbar';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  loadUserFromStorage,
  selectUser,
  selectUserStatus,
} from '@slices/auth';
import { useEffect, type JSX } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const RootLayout = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector(selectUser);
  const userStatus = useAppSelector(selectUserStatus);
  const dispatch = useAppDispatch();
  const isModeratorUrl = location.pathname.includes('moderator');
  const isDone = userStatus === 'succeeded' || userStatus === 'failed';

  useEffect(() => {
    if (userStatus === 'idle') {
      dispatch(loadUserFromStorage());
    }
  }, [dispatch, userStatus]);

  useEffect(() => {
    if (isDone && !user) {
      const redirectPath = isModeratorUrl ? '/moderator/login' : '/login';
      navigate(redirectPath);
    }
  }, [user, userStatus, navigate, isModeratorUrl]);

  return (
    <>
      {user && (
        <div className="app-layout">
          <Navbar />
          <main className="content">
            <Outlet />
          </main>
        </div>
      )}
    </>
  );
};

export default RootLayout;
