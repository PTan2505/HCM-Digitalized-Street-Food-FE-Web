import {
  Bars3Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HomeIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  UserGroupIcon,
  UsersIcon,
  XMarkIcon,
  ChartBarIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import type { JSX } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import SidebarContent from '@components/layout/SidebarContent';
import { Box, Typography, IconButton, Avatar } from '@mui/material';
import { ADMIN_USER_INFO } from '@constants/adminTheme';
import useLogin from '@features/auth/hooks/useLogin';

const navigation = [
  { name: 'Dashboard', href: '/admin/revenue', icon: ChartBarIcon },
  {
    name: 'Quản lý giao dịch',
    href: '/admin/transactions',
    icon: HomeIcon,
  },
  {
    name: 'Quản lý chế độ ăn',
    href: '/admin/user-dietary',
    icon: UserGroupIcon,
  },
  { name: 'Quản lý người dùng', href: '/admin/users', icon: UsersIcon },
  {
    name: 'Quản lý huy hiệu',
    href: '/admin/badge',
    icon: StarIcon,
  },
  {
    name: 'Huy hiệu của người dùng',
    href: '/admin/badge-users',
    icon: ShoppingBagIcon,
  },
];

function AdminLayout(): JSX.Element {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { onLogout } = useLogin();

  // Mock user data for UI only
  const user = {
    firstName: 'Admin',
    lastName: 'User',
    username: 'admin',
    email: 'admin@example.com',
    avatarUrl: null,
  };

  const handleLogoClick = (): void => {
    navigate('/admin');
  };

  const sidebarUserInfo = {
    name:
      user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : ADMIN_USER_INFO.name,
    email: user?.email ?? ADMIN_USER_INFO.email,
    role: ADMIN_USER_INFO.role,
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
            userInfo={sidebarUserInfo}
            settingsPath="/admin/settings"
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
          settingsPath="/admin/settings"
          onLogout={onLogout}
          onLogoClick={handleLogoClick}
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
                    ?.name ?? 'Dashboard'}
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
                      : (user?.username ?? 'Admin User')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.email ?? 'admin@example.com'}
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
