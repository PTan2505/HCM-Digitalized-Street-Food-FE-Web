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
      navigate(ROUTES.LOGIN);
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
      } else if (user.role === ROLES.USER) {
        if (!user.userInfoSetup) {
          if (currentPath !== ROUTES.USER_INFO_SETUP) {
            navigate(ROUTES.USER_INFO_SETUP, { replace: true });
          }
        } else if (
          currentPath === ROUTES.ROOT ||
          !currentPath.startsWith(ROUTES.VENDOR.BASE)
          //THAY VÌ NAVIGATE TỚI TRANG ĐĂNG KÍ THÌ SẼ NAVIGATE TỚI ROUTES.VENDOR.BASE/ROUTES.VENDOR.PATHS.BRANCH
          // CÓ THỂ HIỆN BẢNG TRỐNG XONG THÊM 1 NÚT ĐĂNG KÝ VENDOR VÔ ĐÓ, NHẤN VÀO NÚT ĐÓ MỚI NAVIGATE TỚI ROUTES.VENDOR_REGISTRATION
          // ĐĂNG KÝ XONG MỚI NAVIGATE TỚI ROUTES.VENDOR.BASE/ROUTES.VENDOR.PATHS.BRANCH
        ) {
          navigate(`${ROUTES.VENDOR.BASE}/${ROUTES.VENDOR.PATHS.BRANCH}`, {
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
