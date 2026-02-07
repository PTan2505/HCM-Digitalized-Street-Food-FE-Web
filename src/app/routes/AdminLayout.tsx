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
import { Outlet, useLocation } from 'react-router-dom';
import SidebarContent from '@components/layout/SidebarContent';
import type { JSX } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: ChartBarIcon },
  { name: 'Quản lý giao dịch', href: '/admin/transactions', icon: HomeIcon },
  {
    name: 'Xác minh người bán',
    href: '/admin/verification',
    icon: ShoppingBagIcon,
  },
  { name: 'Quản lý bài viết', href: '/admin/posts', icon: UserGroupIcon },
  { name: 'Quản lý người dùng', href: '/admin/users', icon: UsersIcon },
  {
    name: 'Yêu cầu rút tiền',
    href: '/admin/cashout',
    icon: CurrencyDollarIcon,
  },
];

function AdminLayout(): JSX.Element {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Mock user data for UI only
  const user = {
    firstName: 'Admin',
    lastName: 'User',
    username: 'admin',
    email: 'admin@example.com',
    avatarUrl: null,
  };

  const handleLogout = (): void => {
    console.log('Logging out...');
  };

  const adminConfig = {
    gradientColors: { from: '#06AA4C', to: '#06AA4C' },
    textColors: { primary: '#ffffff', secondary: '#e8f5e9', active: '#045a2e' },
    userInfo: {
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'Admin Panel',
    },
  };

  const sidebarUserInfo = {
    name:
      user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : adminConfig.userInfo.name,
    email: user?.email ?? adminConfig.userInfo.email,
    role: adminConfig.userInfo.role,
    avatarUrl: user?.avatarUrl ?? null,
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
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
            gradientColors={adminConfig.gradientColors}
            textColors={adminConfig.textColors}
            userInfo={sidebarUserInfo}
            settingsPath="/admin/settings"
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
          gradientColors={adminConfig.gradientColors}
          textColors={adminConfig.textColors}
          userInfo={sidebarUserInfo}
          settingsPath="/admin/settings"
          onLogout={handleLogout}
        />
      </div>

      {/* Main content */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'md:pl-16' : 'md:pl-64'
        }`}
      >
        {/* Top navigation */}
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 md:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Bars3Icon className="h-6 w-6" />
              </button>

              {/* Desktop collapse button */}
              <button
                type="button"
                className="hidden rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 md:block"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                {sidebarCollapsed ? (
                  <ChevronRightIcon className="h-5 w-5" />
                ) : (
                  <ChevronLeftIcon className="h-5 w-5" />
                )}
              </button>

              <div className="hidden md:block">
                <h2 className="text-lg font-semibold">
                  {navigation.find(
                    (item) =>
                      item.href === location.pathname ||
                      (location.pathname === '/admin/' &&
                        item.href === '/admin')
                  )?.name ?? 'Admin Panel'}
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* User menu */}
              <div className="relative flex items-center space-x-3">
                <div className="hidden sm:flex sm:flex-col sm:items-end">
                  <span className="text-sm font-medium text-gray-900">
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : (user?.username ?? 'Admin User')}
                  </span>
                  <span className="text-xs text-gray-500">
                    {user?.email ?? 'admin@example.com'}
                  </span>
                </div>
                <div
                  className="flex cursor-pointer items-center rounded-full p-2 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
                  title="User avatar"
                >
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="avatar"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="h-8 w-8" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
