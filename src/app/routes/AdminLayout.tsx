import {
  Bars3Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CurrencyDollarIcon,
  HomeIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  UserGroupIcon,
  UsersIcon,
  XMarkIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import type { JSX } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SidebarContent from '@components/layout/SidebarContent';
import { Box, Typography, IconButton, Avatar } from '@mui/material';
import {
  MODERATOR_THEME,
  MODERATOR_USER_INFO,
} from '@constants/moderatorTheme';

const navigation = [
  { name: 'Dashboard', href: '/moderator/revenue', icon: ChartBarIcon },
  {
    name: 'Quản lý giao dịch',
    href: '/moderator/transactions',
    icon: HomeIcon,
  },
  {
    name: 'Xác minh người bán',
    href: '/moderator/verification',
    icon: ShoppingBagIcon,
  },
  { name: 'Quản lý bài viết', href: '/moderator/posts', icon: UserGroupIcon },
  { name: 'Quản lý người dùng', href: '/moderator/users', icon: UsersIcon },
  {
    name: 'Yêu cầu rút tiền',
    href: '/moderator/cashout',
    icon: CurrencyDollarIcon,
  },
];

function AdminLayout(): JSX.Element {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Mock user data for UI only
  const user = {
    firstName: 'Moderator',
    lastName: 'User',
    username: 'moderator',
    email: 'moderator@example.com',
    avatarUrl: null,
  };

  const handleLogout = (): void => {
    console.log('Logging out...');
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
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'white',
        color: 'gray.900',
      }}
    >
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
            gradientColors={MODERATOR_THEME.gradientColors}
            textColors={MODERATOR_THEME.textColors}
            userInfo={sidebarUserInfo}
            settingsPath="/moderator/settings"
            onLogout={handleLogout}
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
          gradientColors={MODERATOR_THEME.gradientColors}
          textColors={MODERATOR_THEME.textColors}
          userInfo={sidebarUserInfo}
          settingsPath="/moderator/settings"
          onLogout={handleLogout}
        />
      </div>

      {/* Main content */}
      <Box
        sx={{
          transition: 'all 0.3s ease-in-out',
          pl: { xs: 0, md: sidebarCollapsed ? 8 : 32 },
        }}
      >
        {/* Top navigation */}
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            borderBottom: '1px solid #e5e7eb',
            bgcolor: 'white',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              height: '64px',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: { xs: 2, sm: 3, lg: 4 },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton
                sx={{ display: { md: 'none' } }}
                onClick={() => setSidebarOpen(true)}
              >
                <Bars3Icon className="h-6 w-6" />
              </IconButton>

              {/* Desktop collapse button */}
              <IconButton
                sx={{ display: { xs: 'none', md: 'block' } }}
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                {sidebarCollapsed ? (
                  <ChevronRightIcon className="h-5 w-5" />
                ) : (
                  <ChevronLeftIcon className="h-5 w-5" />
                )}
              </IconButton>

              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Typography variant="h6" component="h2">
                  {navigation.find((item) => item.href === location.pathname)
                    ?.name ?? 'Moderator Panel'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {/* User menu */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    display: { xs: 'none', sm: 'flex' },
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : (user?.username ?? 'Moderator User')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.email ?? 'moderator@example.com'}
                  </Typography>
                </Box>
                <Avatar
                  src={user?.avatarUrl ?? undefined}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.8 },
                  }}
                >
                  {!user?.avatarUrl && <UserCircleIcon className="h-6 w-6" />}
                </Avatar>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Page content */}
        <Box component="main" sx={{ py: 3 }}>
          <Box
            sx={{
              maxWidth: '1280px',
              mx: 'auto',
              px: { xs: 2, sm: 3, lg: 4 },
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default AdminLayout;
