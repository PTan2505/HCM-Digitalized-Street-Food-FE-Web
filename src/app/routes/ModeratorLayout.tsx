import SidebarContent from '@components/layout/SidebarContent';
import NotificationBell from '@components/NotificationBell';
import { MODERATOR_USER_INFO } from '@constants/moderatorTheme';
import useLogin from '@features/auth/hooks/useLogin';
import {
  Menu as Bars3Icon,
  BarChart as ChartBarIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Verified as ShoppingBagIcon,
  Close as XMarkIcon,
} from '@mui/icons-material';
import { useAppSelector } from '@hooks/reduxHooks';
import { Box, IconButton, Typography } from '@mui/material';
import { selectUser } from '@slices/auth';
import type { JSX } from 'react';
import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const navigation = [
  { name: 'Dashboard', href: '/moderator/revenue', icon: ChartBarIcon },
  {
    name: 'Xác minh người bán',
    href: '/moderator/verification',
    icon: ShoppingBagIcon,
  },
];

function ModeratorLayout(): JSX.Element {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { onLogout } = useLogin();

  // Mock user data for UI only
  const user = useAppSelector(selectUser);

  const handleLogoClick = (): void => {
    navigate('/moderator');
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
        <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:ring-2 focus:ring-white focus:outline-none focus:ring-inset"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent
            collapsed={false}
            navigation={navigation}
            userInfo={sidebarUserInfo}
            settingsPath="/moderator/settings"
            onLogout={onLogout}
            onLogoClick={handleLogoClick}
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
          settingsPath="/moderator/settings"
          onLogout={onLogout}
          onLogoClick={handleLogoClick}
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
                  {navigation.find((item) => item.href === location.pathname)
                    ?.name ?? 'Dashboard'}
                </Typography>
              </Box>
            </Box>

            <Box className="flex items-center gap-4">
              <NotificationBell />
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
    </Box>
  );
}

export default ModeratorLayout;
