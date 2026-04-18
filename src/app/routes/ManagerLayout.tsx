import SidebarContent from '@components/layout/SidebarContent';
import NotificationBell from '@components/NotificationBell';
import { ROUTES } from '@constants/routes';
import { MANAGER_USER_INFO } from '@constants/managerTheme';
import useLogin from '@features/auth/hooks/useLogin';
import FeedbackDetailsModal from '@features/vendor/components/FeedbackDetailsModal';
import OrderDetailsModal from '@features/vendor/components/OrderDetailsModal';
import {
  Menu as Bars3Icon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ShoppingCart as ShoppingBagIcon,
  Store as StoreIcon,
  RestaurantMenu as RestaurantMenuIcon,
  RateReview as RateReviewIcon,
  Schedule as ScheduleIcon,
  EventBusy as EventBusyIcon,
  Close as XMarkIcon,
} from '@mui/icons-material';
import { useAppSelector } from '@hooks/reduxHooks';
import { Box, IconButton, Typography } from '@mui/material';
import { selectUser } from '@slices/auth';
import type { JSX } from 'react';
import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import UpdateUserProfileModal from '@features/user/components/UpdateUserProfileModal';

const managerBase = ROUTES.MANAGER.BASE;
const managerPaths = ROUTES.MANAGER.PATHS;

const navigation = [
  {
    name: 'Quản lý đơn hàng',
    href: `${managerBase}/${managerPaths.ORDER}`,
    icon: ShoppingBagIcon,
  },
  {
    name: 'Quản lý chi nhánh',
    href: `${managerBase}/${managerPaths.BRANCH}`,
    icon: StoreIcon,
  },
  {
    name: 'Quản lý thực đơn',
    href: `${managerBase}/${managerPaths.DISH}`,
    icon: RestaurantMenuIcon,
  },
  {
    name: 'Quản lý phản hồi chi nhánh',
    href: `${managerBase}/${managerPaths.FEEDBACK}`,
    icon: RateReviewIcon,
  },
  {
    name: 'Quản lý thời gian hoạt động',
    href: `${managerBase}/${managerPaths.WORK_SCHEDULE}`,
    icon: ScheduleIcon,
  },
  {
    name: 'Quản lý thời gian nghỉ',
    href: `${managerBase}/${managerPaths.DAY_OFF}`,
    icon: EventBusyIcon,
  },
];

function ManagerLayout(): JSX.Element {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [feedbackModalId, setFeedbackModalId] = useState<number | null>(null);
  const [orderModalId, setOrderModalId] = useState<number | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { onLogout } = useLogin();

  const user = useAppSelector(selectUser);

  const handleLogoClick = (): void => {
    navigate(managerBase);
  };

  const sidebarUserInfo = {
    name:
      user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : MANAGER_USER_INFO.name,
    email: user?.email ?? MANAGER_USER_INFO.email,
    role: MANAGER_USER_INFO.role,
    avatarUrl: user?.avatarUrl ?? null,
  };

  return (
    <Box className="min-h-screen bg-white text-gray-900">
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

      <Box
        className={`pl-0 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'md:pl-16' : 'md:pl-64'
        }`}
      >
        <Box className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
          <Box className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <Box className="flex items-center gap-4">
              <IconButton
                className="md:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Bars3Icon className="h-6 w-6" />
              </IconButton>

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
              <NotificationBell
                onFeedbackNotificationClick={setFeedbackModalId}
                onOrderNotificationClick={setOrderModalId}
              />
            </Box>
          </Box>
        </Box>

        <Box component="main" className="py-6">
          <Box className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </Box>
        </Box>
      </Box>

      <FeedbackDetailsModal
        isOpen={feedbackModalId !== null}
        onClose={() => setFeedbackModalId(null)}
        feedbackId={feedbackModalId}
      />
      <OrderDetailsModal
        isOpen={orderModalId !== null}
        onClose={() => setOrderModalId(null)}
        orderId={orderModalId}
      />
      <UpdateUserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </Box>
  );
}

export default ManagerLayout;
