import RequestTransferModal from '@components/RequestTransferModal';
import SidebarContent from '@components/layout/SidebarContent';
import NotificationBell from '@components/NotificationBell';
import useLogin from '@features/auth/hooks/useLogin';
import FeedbackDetailsModal from '@features/vendor/components/FeedbackDetailsModal';
import OnboardingMissingDietaryModal from '@features/vendor/components/OnboardingMissingDietaryModal';
import usePayment from '@features/vendor/hooks/usePayment';
import useVendor from '@features/vendor/hooks/useVendor';
import type { VendorRequestTransferRequest } from '@features/vendor/types/payment';
import {
  Menu as Bars3Icon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Home as HomeIcon,
  Storefront as BuildingStorefrontIcon,
  Receipt as ClipboardDocumentListIcon,
  Description as DocumentTextIcon,
  Close as XMarkIcon,
  RestaurantMenu as ShoppingBagIcon,
  LocalDining as SparklesIcon,
  ShoppingCart as QueueListIcon,
  LocationOn as MapPinIcon,
} from '@mui/icons-material';
import MoneyIcon from '@mui/icons-material/Money';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { ROLES } from '@constants/role';
import { useAppSelector } from '@hooks/reduxHooks';
import { Box, IconButton, Typography, Button } from '@mui/material';
import { selectUser } from '@slices/auth';
import { selectVendorAccountBalance } from '@slices/payment';
import type { JSX } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const navigation = [
  {
    name: 'Dashboard',
    href: '/vendor/dashboard',
    icon: HomeIcon,
    isForVendor: true,
  },
  {
    name: 'Xác nhận sở hữu quán',
    href: '/vendor/ghost-pin',
    icon: MapPinIcon,
    isForVendor: false,
  },
  {
    name: 'Chi nhánh',
    href: '/vendor/branch',
    icon: BuildingStorefrontIcon,
    isForVendor: false,
  },
  {
    name: 'Lịch sử đăng ký',
    href: '/vendor/registration-history',
    icon: DocumentTextIcon,
    isForVendor: false,
  },
  {
    name: 'Lịch sử thanh toán',
    href: '/vendor/payment-history',
    icon: ClipboardDocumentListIcon,
    isForVendor: true,
  },
  {
    name: 'Quản lý món ăn',
    href: '/vendor/dish',
    icon: ShoppingBagIcon,
    isForVendor: true,
  },
  {
    name: 'Quản lý đơn hàng',
    href: '/vendor/orders',
    icon: QueueListIcon,
    isForVendor: true,
  },
  {
    name: 'Chế độ ăn',
    href: '/vendor/dietary-preferences',
    icon: SparklesIcon,
    isForVendor: true,
  },
];

function VendorLayout(): JSX.Element {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);
  const [feedbackModalId, setFeedbackModalId] = useState<number | null>(null);
  const [isDietaryModalOpen, setIsDietaryModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { onLogout } = useLogin();
  const { onGetVendorBalance, onVendorRequestTransfer } = usePayment();
  const { onGetMyVendor, onGetDietaryPreferencesOfMyVendor } = useVendor();
  const hasCheckedDietaryRef = useRef(false);
  const user = useAppSelector(selectUser);
  const accountBalance = useAppSelector(selectVendorAccountBalance);
  const isVendor = user?.role === ROLES.VENDOR;
  const filteredNavigation = navigation.filter(
    (item) => !item.isForVendor || isVendor
  );

  useEffect(() => {
    if (!isVendor) {
      return;
    }

    void onGetVendorBalance();
  }, [isVendor, onGetVendorBalance]);

  useEffect(() => {
    if (!isVendor || hasCheckedDietaryRef.current) {
      return;
    }

    let isCancelled = false;

    const checkDietaryPreferences = async (): Promise<void> => {
      try {
        const vendor = await onGetMyVendor();

        if (!vendor?.vendorId) {
          return;
        }

        const dietaryPreferences = await onGetDietaryPreferencesOfMyVendor({
          vendorId: vendor.vendorId,
        });

        if (!isCancelled && dietaryPreferences.length === 0) {
          setIsDietaryModalOpen(true);
        }
      } catch (error) {
        console.error('Error checking dietary preferences:', error);
      } finally {
        hasCheckedDietaryRef.current = true;
      }
    };

    void checkDietaryPreferences();

    return (): void => {
      isCancelled = true;
    };
  }, [isVendor, onGetMyVendor, onGetDietaryPreferencesOfMyVendor]);

  const handleLogoClick = (): void => {
    navigate('/vendor');
  };

  const roleKey =
    Object.entries(ROLES).find(([, value]) => value === user?.role)?.[0] ??
    'Vendor';
  const roleLabel =
    roleKey.charAt(0).toUpperCase() + roleKey.slice(1).toLowerCase();

  const sidebarUserInfo = {
    name:
      user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : roleLabel,
    email: user?.email ?? '',
    role: roleLabel,
    avatarUrl: user?.avatarUrl ?? null,
  };

  const formatCurrencyVnd = (value?: number | null): string => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return '0 VND';
    }

    return `${value.toLocaleString('vi-VN')} VND`;
  };

  const handleSubmitTransferRequest = async (
    payload: VendorRequestTransferRequest
  ): Promise<void> => {
    setIsSubmittingTransfer(true);
    try {
      await onVendorRequestTransfer(payload);
      // await onGetVendorBalance();
    } finally {
      setIsSubmittingTransfer(false);
    }
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
            navigation={filteredNavigation}
            userInfo={sidebarUserInfo}
            settingsPath="/vendor/settings"
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
          navigation={filteredNavigation}
          userInfo={sidebarUserInfo}
          settingsPath="/vendor/settings"
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
                  {filteredNavigation.find(
                    (item) => item.href === location.pathname
                  )?.name ?? 'Dashboard'}
                </Typography>
              </Box>
            </Box>

            <Box className="flex items-center gap-4">
              {isVendor && (
                <Box className="flex items-center gap-3">
                  <Box className="border-primary-200 bg-primary-50 text-primary-700 flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-bold whitespace-nowrap shadow-sm">
                    <AccountBalanceIcon fontSize="small" />
                    Số dư: {formatCurrencyVnd(accountBalance?.balance)}
                  </Box>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setIsTransferModalOpen(true)}
                    disabled={accountBalance?.balance === 0}
                    startIcon={<MoneyIcon />}
                    className="bg-primary-600 hover:bg-primary-700 h-10 rounded-lg px-4 text-sm font-bold whitespace-nowrap text-white shadow-sm"
                    disableElevation
                  >
                    Yêu cầu rút tiền
                  </Button>
                </Box>
              )}
              <NotificationBell
                onFeedbackNotificationClick={setFeedbackModalId}
              />
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

      <RequestTransferModal
        isOpen={isTransferModalOpen}
        isSubmitting={isSubmittingTransfer}
        currentBalance={accountBalance?.balance}
        onClose={() => setIsTransferModalOpen(false)}
        onSubmit={handleSubmitTransferRequest}
      />
      <FeedbackDetailsModal
        isOpen={feedbackModalId !== null}
        onClose={() => setFeedbackModalId(null)}
        feedbackId={feedbackModalId}
      />
      <OnboardingMissingDietaryModal
        open={isDietaryModalOpen}
        onClose={() => setIsDietaryModalOpen(false)}
      />
    </Box>
  );
}

export default VendorLayout;
