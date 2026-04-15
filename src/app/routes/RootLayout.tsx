import { ROLES } from '@constants/role';
import { ROUTES } from '@constants/routes';
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
  const user = useAppSelector(selectUser);
  const userStatus = useAppSelector(selectUserStatus);
  const dispatch = useAppDispatch();
  const isDone = userStatus === 'succeeded' || userStatus === 'failed';
  const location = useLocation();

  useEffect(() => {
    if (userStatus === 'idle') {
      dispatch(loadUserFromStorage());
    }
  }, [dispatch, userStatus]);

  useEffect(() => {
    if (isDone && !user) {
      if (location.pathname === ROUTES.ROOT) {
        navigate(ROUTES.HOME, { replace: true });
      } else {
        navigate(ROUTES.LOGIN);
      }
      return;
    }

    if (isDone && user) {
      console.log('User loaded:', user);
      const currentPath = location.pathname;
      if (user.role === ROLES.ADMIN) {
        if (
          currentPath === ROUTES.ROOT ||
          !currentPath.startsWith(ROUTES.ADMIN.BASE)
        ) {
          navigate(ROUTES.ADMIN.BASE, { replace: true });
        }
      } else if (user.role === ROLES.MODERATOR) {
        if (
          currentPath === ROUTES.ROOT ||
          !currentPath.startsWith(ROUTES.MODERATOR.BASE)
        ) {
          navigate(ROUTES.MODERATOR.BASE, { replace: true });
        }
      } else if (user.role === ROLES.MANAGER) {
        if (
          currentPath === ROUTES.ROOT ||
          !currentPath.startsWith(ROUTES.MANAGER.BASE)
        ) {
          navigate(ROUTES.MANAGER.BASE, { replace: true });
        }
      } else if (user.role === ROLES.USER) {
        if (!user.userInfoSetup) {
          if (currentPath !== ROUTES.USER_INFO_SETUP) {
            navigate(ROUTES.USER_INFO_SETUP, { replace: true });
          }
        } else if (
          currentPath === ROUTES.ROOT ||
          !currentPath.startsWith(ROUTES.USER.BASE)
        ) {
          navigate(`${ROUTES.USER.BASE}/${ROUTES.USER.PATHS.BRANCH}`, {
            replace: true,
          });
        }
      } else if (user.role === ROLES.VENDOR) {
        if (
          currentPath === ROUTES.ROOT ||
          !currentPath.startsWith(ROUTES.VENDOR.BASE)
        ) {
          navigate(ROUTES.VENDOR.BASE, { replace: true });
        }
      }
    }
  }, [user, userStatus, navigate, isDone, location]);

  return (
    <>
      {user && (
        <div className="app-layout">
          <main className="content">
            <Outlet />
          </main>
        </div>
      )}
    </>
  );
};

export default RootLayout;
