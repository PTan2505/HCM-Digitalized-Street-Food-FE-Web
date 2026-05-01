import SidebarContent from '@components/layout/SidebarContent';
import NotificationBell from '@components/NotificationBell';
import { ROUTES } from '@constants/routes';
import { MODERATOR_USER_INFO } from '@constants/moderatorTheme';
import useLogin from '@features/auth/hooks/useLogin';
import {
  Menu as Bars3Icon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  LocationOn as LocationOnIcon,
  Storefront as StorefrontIcon,
  FactCheck as FactCheckIcon,
  Close as XMarkIcon,
} from '@mui/icons-material';
import { useAppSelector } from '@hooks/reduxHooks';
import { Box, IconButton, Typography } from '@mui/material';
import { selectUser } from '@slices/auth';
import type { JSX } from 'react';
import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import UpdateUserProfileModal from '@features/user/components/UpdateUserProfileModal';

const moderatorBase = ROUTES.MODERATOR.BASE;
const moderatorPaths = ROUTES.MODERATOR.PATHS;

const navigation = [
  // {
  //   name: 'Dashboard',
  //   href: `${ROUTES.MODERATOR.BASE}/${ROUTES.MODERATOR.PATHS.REVENUE}`,
  //   icon: ChartBarIcon,
  // },
  {
    name: 'Quán Ăn Chờ Duyệt',
    href: `${moderatorBase}/${moderatorPaths.VERIFICATION_VENDOR}`,
    icon: StorefrontIcon,
  },
  {
    name: 'Quán reviewer chia sẻ',
    href: `${moderatorBase}/${moderatorPaths.VERIFICATION_GHOST_PIN}`,
    icon: LocationOnIcon,
  },
  {
    name: 'Yêu cầu sở hữu quán',
    href: `${moderatorBase}/${moderatorPaths.VERIFICATION_OWNERSHIP_REQUEST}`,
    icon: FactCheckIcon,
  },
  {
    name: 'Lịch sử chi nhánh',
    href: `${moderatorBase}/${moderatorPaths.BRANCH}`,
    icon: StorefrontIcon,
  },
];

const titleByPath: Record<string, string> = {
  [`${moderatorBase}/${moderatorPaths.VERIFICATION_GHOST_PIN}`]:
    'Xác minh - Quán reviewer chia sẻ',
  [`${moderatorBase}/${moderatorPaths.VERIFICATION_VENDOR}`]:
    'Xác minh - Quán ăn chờ duyệt',
  [`${moderatorBase}/${moderatorPaths.VERIFICATION_OWNERSHIP_REQUEST}`]:
    'Xác minh - Yêu cầu sở hữu quán',
  [`${moderatorBase}/${moderatorPaths.BRANCH}`]: 'Xem thông tin chi nhánh',
};

function ModeratorLayout(): JSX.Element {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { onLogout } = useLogin();

  // Mock user data for UI only
  const user = useAppSelector(selectUser);

  const handleLogoClick = (): void => {
    navigate(moderatorBase);
  };

  const sidebarUserInfo = {
    name:
      user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : MODERATOR_USER_INFO.name,
    email: user?.email ?? MODERATOR_USER_INFO.email,
    role: MODERATOR_USER_INFO.role,
    avatarUrl: user?.avatarUrl ?? null,
  };
  const pageTitle =
    titleByPath[location.pathname] ?? 'Xác minh - Quán ăn chờ duyệt';

  return (
    <Box className="min-h-screen bg-white text-gray-900">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-40 md:hidden ${
          sidebarOpen ? '' : 'hidden'
        }`}
      >
        <div
          className="bg-opacity-75 fixed inset-0 bg-gray-600"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="relative flex h-full w-[85vw] max-w-xs flex-col bg-white shadow-xl">
          <div className="absolute top-3 right-3 z-10">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <SidebarContent
            collapsed={false}
            navigation={navigation}
            userInfo={sidebarUserInfo}
            onLogout={onLogout}
            onLogoClick={handleLogoClick}
            onNavigateItemClick={() => setSidebarOpen(false)}
            onUserInfoClick={() => setIsProfileModalOpen(true)}
          />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div
        className={`hidden transition-all duration-300 ease-in-out md:fixed md:inset-y-0 md:flex md:flex-col ${
          sidebarCollapsed ? 'md:w-16' : 'md:w-64'
        }`}
      >
        <SidebarContent
          collapsed={sidebarCollapsed}
          navigation={navigation}
          userInfo={sidebarUserInfo}
          onLogout={onLogout}
          onLogoClick={handleLogoClick}
          onUserInfoClick={() => setIsProfileModalOpen(true)}
        />
      </div>

      {/* Main content */}
      <Box
        className={`pl-0 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'md:pl-16' : 'md:pl-64'
        }`}
      >
        {/* Top navigation */}
        <Box className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
          <Box className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <Box className="flex items-center gap-4">
              <IconButton
                className="md:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Bars3Icon className="h-6 w-6" />
              </IconButton>

              {/* Desktop collapse button */}
              <IconButton
                className="hidden md:block"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                {sidebarCollapsed ? (
                  <ChevronRightIcon className="h-5 w-5" />
                ) : (
                  <ChevronLeftIcon className="h-5 w-5" />
                )}
              </IconButton>

              <Box className="hidden md:block">
                <Typography
                  variant="h6"
                  component="h2"
                  className="text-xl font-semibold"
                >
                  {pageTitle}
                </Typography>
              </Box>
            </Box>

            <Box className="flex items-center gap-4">
              {/* <NotificationBell /> */}
            </Box>
          </Box>
        </Box>

        {/* Page content */}
        <Box component="main" className="py-6">
          <Box className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <Outlet />
          </Box>
        </Box>
      </Box>
      <UpdateUserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </Box>
  );
}

export default ModeratorLayout;
