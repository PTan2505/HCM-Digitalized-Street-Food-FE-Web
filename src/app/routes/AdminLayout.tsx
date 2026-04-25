import SidebarContent from '@components/layout/SidebarContent';
import type { NavigationItem } from '@components/layout/SidebarContent';
import { ADMIN_USER_INFO } from '@constants/adminTheme';
import useLogin from '@features/auth/hooks/useLogin';
import {
  BarChart as ChartBarIcon,
  Storefront as BuildingStorefrontIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Category as RectangleStackIcon,
  EmojiEvents as StarIcon,
  LocalDining as SparklesIcon,
  Group as UserGroupIcon,
  Person as UserCircleIcon,
  People as PeopleIcon,
  Menu as Bars3Icon,
  Close as XMarkIcon,
  Loyalty as ShoppingBagIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  Campaign as CampaignIcon,
  Assignment as AssignmentIcon,
  LocalOffer as LocalOfferIcon,
  Settings as SettingsIcon,
  Verified as VerifiedIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
} from '@mui/icons-material';
import FoodBankIcon from '@mui/icons-material/FoodBank';
import { Box, IconButton, Typography } from '@mui/material';
import { ROUTES } from '@constants/routes';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectUser } from '@slices/auth';
import type { JSX } from 'react';
import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import UpdateUserProfileModal from '@features/user/components/UpdateUserProfileModal';

const adminBase = ROUTES.ADMIN.BASE;
const adminPaths = ROUTES.ADMIN.PATHS;

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: `${adminBase}/${adminPaths.DASHBOARD}`,
    icon: ChartBarIcon,
  },
  {
    name: 'Xác minh',
    href: `${adminBase}/${adminPaths.VERIFICATION}`,
    icon: VerifiedIcon,
  },
  {
    name: 'Quản lý cửa hàng',
    href: `${adminBase}/${adminPaths.VENDORS}`,
    icon: BuildingStorefrontIcon,
  },
  // {
  //   name: 'Xem thông tin chi nhánh',
  //   href: `${adminBase}/${adminPaths.BRANCH}`,
  //   icon: BuildingStorefrontIcon,
  // },
  {
    name: 'Quản lý danh mục món ăn',
    href: `${adminBase}/${adminPaths.CATEGORY}`,
    icon: RectangleStackIcon,
  },
  {
    name: 'Quản lý khẩu vị món ăn',
    href: `${adminBase}/${adminPaths.TASTE}`,
    icon: SparklesIcon,
  },
  {
    name: 'Quản lý người dùng',
    icon: PeopleIcon,
    children: [
      {
        name: 'Khách hàng',
        href: `${adminBase}/${adminPaths.USERS_CUSTOMER}`,
        icon: UserCircleIcon,
      },
      {
        name: 'Đối tác',
        href: `${adminBase}/${adminPaths.USERS_VENDOR}`,
        icon: BuildingStorefrontIcon,
      },
      {
        name: 'Hệ thống',
        href: `${adminBase}/${adminPaths.USERS_SYSTEM}`,
        icon: UserGroupIcon,
      },
    ],
  },
  {
    name: 'Chế độ ăn',
    icon: FoodBankIcon,
    children: [
      {
        name: 'Quản lý chế độ ăn',
        href: `${adminBase}/${adminPaths.USER_DIETARY}`,
        icon: FoodBankIcon,
      },
      {
        name: 'Chế độ ăn của người dùng',
        href: `${adminBase}/${adminPaths.USER_WITH_DIETARY}`,
        icon: UserCircleIcon,
      },
    ],
  },
  {
    name: 'Huy hiệu',
    icon: StarIcon,
    children: [
      {
        name: 'Quản lý huy hiệu',
        href: `${adminBase}/${adminPaths.BADGE}`,
        icon: StarIcon,
      },
      {
        name: 'Huy hiệu của người dùng',
        href: `${adminBase}/${adminPaths.BADGE_USERS}`,
        icon: ShoppingBagIcon,
      },
    ],
  },
  {
    name: 'Quản lý tag phản hồi',
    href: `${adminBase}/${adminPaths.FEEDBACK_TAG}`,
    icon: ChatBubbleOutlineIcon,
  },
  {
    name: 'Quản lý chiến dịch',
    icon: CampaignIcon,
    children: [
      {
        name: 'Từ hệ thống',
        href: `${adminBase}/${adminPaths.CAMPAIGN}`,
        icon: CampaignIcon,
      },
      {
        name: 'Từ cửa hàng',
        href: `${adminBase}/${adminPaths.CAMPAIGN_VENDOR}`,
        icon: BuildingStorefrontIcon,
      },
    ],
  },
  {
    name: 'Quản lý voucher',
    href: `${adminBase}/${adminPaths.VOUCHER}`,
    icon: LocalOfferIcon,
  },
  {
    name: 'Quản lý nhiệm vụ',
    href: `${adminBase}/${adminPaths.QUEST}`,
    icon: AssignmentIcon,
  },
  {
    name: 'Lịch sử rút tiền',
    href: `${adminBase}/${adminPaths.PAYOUT}`,
    icon: AccountBalanceWalletIcon,
  },
  {
    name: 'Cấu hình hệ thống',
    href: `${adminBase}/${adminPaths.SETTING}`,
    icon: SettingsIcon,
  },
];

function AdminLayout(): JSX.Element {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { onLogout } = useLogin();
  // Mock user data for UI only
  const user = useAppSelector(selectUser);

  const handleLogoClick = (): void => {
    navigate(adminBase);
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

  const currentPageTitle =
    navigation.find((item) => item.href === location.pathname)?.name ??
    navigation
      .flatMap((item) => item.children ?? [])
      .find((child) => child.href === location.pathname)?.name ??
    'Dashboard';

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
                  {currentPageTitle}
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
          <Box className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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

export default AdminLayout;
