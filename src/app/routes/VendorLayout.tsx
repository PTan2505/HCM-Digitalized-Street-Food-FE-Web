import RequestTransferModal from '@components/RequestTransferModal';
import SidebarContent, {
  type NavigationItem,
} from '@components/layout/SidebarContent';
import NotificationBell from '@components/NotificationBell';
import useLogin from '@features/auth/hooks/useLogin';
import FeedbackDetailsModal from '@features/vendor/components/FeedbackDetailsModal';
import OrderDetailsModal from '@features/vendor/components/OrderDetailsModal';
import OnboardingMissingBranchModal from '@features/vendor/components/OnboardingMissingBranchModal';
import OnboardingMissingBranchDishModal from '@features/vendor/components/OnboardingMissingBranchDishModal';
import OnboardingMissingDietaryModal from '@features/vendor/components/OnboardingMissingDietaryModal';
import OnboardingMissingDishModal from '@features/vendor/components/OnboardingMissingDishModal';
import useDish from '@features/vendor/hooks/useDish';
import usePayment from '@features/vendor/hooks/usePayment';
import useVendor from '@features/vendor/hooks/useVendor';
import type { VendorRequestTransferRequest } from '@features/vendor/types/payment';
import UpdateUserProfileModal from '@features/user/components/UpdateUserProfileModal';
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
  ShoppingCart as QueueListIcon,
  LocationOn as MapPinIcon,
  Campaign as CampaignIcon,
  Public as PublicIcon,
  Group as UserGroupIcon,
} from '@mui/icons-material';
import { ROUTES } from '@constants/routes';
import { ROLES } from '@constants/role';
import { useAppSelector } from '@hooks/reduxHooks';
import { Box, IconButton, Typography, Button } from '@mui/material';
import { selectUser } from '@slices/auth';
import { selectVendorAccountBalance } from '@slices/payment';
import {
  selectMyVendorDietaryPreferences,
  selectMyVendor,
  selectBranchScheduleMap,
} from '@slices/vendor';
import {
  selectVendorDishesPagination,
  selectBranchDishCountMap,
} from '@slices/dish';
import type { JSX } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const vendorBase = ROUTES.VENDOR.BASE;
const vendorPaths = ROUTES.VENDOR.PATHS;

const navigation = [
  {
    name: 'Dashboard',
    href: `${vendorBase}/${vendorPaths.DASHBOARD}`,
    icon: HomeIcon,
    isForVendor: true,
  },
  {
    name: 'Chi nhánh',
    href: `${vendorBase}/${vendorPaths.BRANCH}`,
    icon: BuildingStorefrontIcon,
    isForVendor: false,
  },
  {
    name: 'Quản lý món ăn',
    href: `${vendorBase}/${vendorPaths.DISH}`,
    icon: ShoppingBagIcon,
    isForVendor: true,
  },
  {
    name: 'Quản lý đơn hàng',
    href: `${vendorBase}/${vendorPaths.ORDER}`,
    icon: QueueListIcon,
    isForVendor: true,
  },
  {
    name: 'Chế độ ăn',
    href: `${vendorBase}/${vendorPaths.DIETARY}`,
    icon: UserGroupIcon,
    isForVendor: true,
  },
  {
    name: 'Xác nhận sở hữu quán',
    href: `${vendorBase}/${vendorPaths.GHOST_PIN}`,
    icon: MapPinIcon,
    isForVendor: false,
  },
  {
    name: 'Quản lý chiến dịch',
    icon: CampaignIcon,
    isForVendor: true,
    children: [
      {
        name: 'Cửa hàng',
        href: `${vendorBase}/${vendorPaths.CAMPAIGN}`,
        icon: BuildingStorefrontIcon,
      },
      {
        name: 'Hệ thống',
        href: `${vendorBase}/${vendorPaths.CAMPAIGN_SYSTEM}`,
        icon: PublicIcon,
      },
    ],
  },
  {
    name: 'Lịch sử',
    icon: DocumentTextIcon,
    isForVendor: false,
    children: [
      {
        name: 'Lịch sử đăng ký',
        href: `${vendorBase}/${vendorPaths.REGISTRATION_HISTORY}`,
        icon: DocumentTextIcon,
      },
      {
        name: 'Lịch sử thanh toán',
        href: `${vendorBase}/${vendorPaths.PAYMENT_HISTORY}`,
        icon: ClipboardDocumentListIcon,
      },
    ],
  },
];

function VendorLayout(): JSX.Element {
  type PendingOnboardingModal =
    | 'branch'
    | 'dish'
    | 'dietary'
    | 'branchDish'
    | null;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);
  const [feedbackModalId, setFeedbackModalId] = useState<number | null>(null);
  const [orderModalId, setOrderModalId] = useState<number | null>(null);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [isDietaryModalOpen, setIsDietaryModalOpen] = useState(false);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [isBranchDishModalOpen, setIsBranchDishModalOpen] = useState(false);
  // isInitialCheckDone: tránh hiển thị badge trước khi fetch lần đầu xong
  const [isInitialCheckDone, setIsInitialCheckDone] = useState(false);
  const [pendingOnboardingModal, setPendingOnboardingModal] =
    useState<PendingOnboardingModal>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { onLogout } = useLogin();
  const { onGetVendorBalance, onVendorRequestTransfer } = usePayment();
  const { onGetDishesOfAVendor, onGetDishesByBranch } = useDish();
  const {
    onGetMyVendor,
    onGetDietaryPreferencesOfMyVendor,
    onGetWorkSchedules,
  } = useVendor();
  const hasShownDietaryModalRef = useRef(false);
  const hasShownBranchDishModalRef = useRef(false);
  const user = useAppSelector(selectUser);
  const accountBalance = useAppSelector(selectVendorAccountBalance);
  // Đọc reactive từ Redux store - tự cập nhật khi trang con thay đổi dữ liệu
  const myVendorDietaryPreferences = useAppSelector(
    selectMyVendorDietaryPreferences
  );
  const vendorDishesPagination = useAppSelector(selectVendorDishesPagination);
  const myVendor = useAppSelector(selectMyVendor);
  const branchScheduleMap = useAppSelector(selectBranchScheduleMap);
  const branchDishCountMap = useAppSelector(selectBranchDishCountMap);
  const isVendor = user?.role === ROLES.VENDOR;

  // Badge được tính reactive từ Redux state (không cần re-fetch khi navigate)
  const isDishMissing =
    isInitialCheckDone && vendorDishesPagination.totalCount === 0;
  const isDietaryMissing =
    isInitialCheckDone && myVendorDietaryPreferences.length === 0;

  // Branch schedule badge: reactive từ branchScheduleMap trong Redux store
  const acceptedBranches = useMemo(
    () =>
      (myVendor?.branches ?? []).filter(
        (branch) => branch.licenseStatus === 'Accept'
      ),
    [myVendor]
  );

  const subscribedBranches = useMemo(
    () => (myVendor?.branches ?? []).filter((branch) => branch.isSubscribed),
    [myVendor]
  );

  const missingScheduleBranches = useMemo(
    () =>
      isInitialCheckDone
        ? acceptedBranches.filter(
            (branch) => branchScheduleMap[branch.branchId] === false
          )
        : [],
    [isInitialCheckDone, acceptedBranches, branchScheduleMap]
  );

  // Chi nhánh đã subscribed mà chưa có món ăn nào được gán
  const missingBranchDishBranches = useMemo(
    () =>
      isInitialCheckDone
        ? subscribedBranches.filter(
            (branch) =>
              branchDishCountMap[branch.branchId] !== undefined &&
              branchDishCountMap[branch.branchId] === 0
          )
        : [],
    [isInitialCheckDone, subscribedBranches, branchDishCountMap]
  );

  const isBranchDishMissing = missingBranchDishBranches.length > 0;

  const isBranchScheduleMissing = missingScheduleBranches.length > 0;

  const vendorBranchPath = `${vendorBase}/${vendorPaths.BRANCH}`;
  const vendorDietaryPath = `${vendorBase}/${vendorPaths.DIETARY}`;
  const vendorDishPath = `${vendorBase}/${vendorPaths.DISH}`;

  const filteredNavigation = navigation
    .filter((item) => !item.isForVendor || isVendor)
    .map((item) => {
      if (item.href === vendorBranchPath) {
        const hasBadge = isBranchScheduleMissing || isBranchDishMissing;
        return {
          ...item,
          badgeText: hasBadge ? 'Cập nhật' : undefined,
          onClick: (): void => {
            if (isBranchScheduleMissing) {
              setPendingOnboardingModal('branch');
            } else if (isBranchDishMissing) {
              setPendingOnboardingModal('branchDish');
            }
          },
        };
      }

      if (item.name === 'Lịch sử') {
        if (!isVendor) {
          return {
            name: 'Lịch sử đăng ký',
            href: `${vendorBase}/${vendorPaths.REGISTRATION_HISTORY}`,
            icon: DocumentTextIcon,
          };
        }
        return item;
      }

      if (item.href !== vendorDietaryPath) {
        if (item.href !== vendorDishPath) {
          return item;
        }

        return {
          ...item,
          badgeText: isDishMissing ? 'Mới' : undefined,
          onClick: (): void => {
            if (!isDishMissing) {
              return;
            }

            setPendingOnboardingModal('dish');
          },
        };
      }

      return {
        ...item,
        badgeText: isDietaryMissing ? 'Mới' : undefined,
        onClick: (): void => {
          if (!isDietaryMissing) {
            return;
          }

          setPendingOnboardingModal('dietary');
        },
      };
    });

  const pageTitle = useMemo(() => {
    const directMatch = filteredNavigation.find(
      (item) => item.href === location.pathname
    );

    if (directMatch) {
      return directMatch.name;
    }

    for (const item of filteredNavigation as NavigationItem[]) {
      const childMatch = item.children?.find(
        (child) => child.href === location.pathname
      );
      if (childMatch) {
        return childMatch.name;
      }
    }

    return 'Dashboard';
  }, [filteredNavigation, location.pathname]);

  useEffect(() => {
    if (
      pendingOnboardingModal === 'branch' &&
      location.pathname === vendorBranchPath
    ) {
      setIsBranchModalOpen(true);
      setPendingOnboardingModal(null);
      return;
    }

    if (
      pendingOnboardingModal === 'dish' &&
      location.pathname === vendorDishPath
    ) {
      setIsDishModalOpen(true);
      setPendingOnboardingModal(null);
      return;
    }

    if (
      pendingOnboardingModal === 'dietary' &&
      location.pathname === vendorDietaryPath
    ) {
      setIsDietaryModalOpen(true);
      setPendingOnboardingModal(null);
      return;
    }

    if (
      pendingOnboardingModal === 'branchDish' &&
      location.pathname === vendorBranchPath
    ) {
      setIsBranchDishModalOpen(true);
      setPendingOnboardingModal(null);
    }
  }, [
    location.pathname,
    pendingOnboardingModal,
    vendorBranchPath,
    vendorDishPath,
    vendorDietaryPath,
  ]);

  // Hiển thị dietary modal 1 lần nếu thiếu chế độ ăn (reactive theo Redux state)
  useEffect(() => {
    if (
      isInitialCheckDone &&
      isDietaryMissing &&
      !hasShownDietaryModalRef.current
    ) {
      setIsDietaryModalOpen(true);
      hasShownDietaryModalRef.current = true;
    }
  }, [isInitialCheckDone, isDietaryMissing]);

  // Hiển thị branchDish modal 1 lần nếu có chi nhánh subscribed chưa có món ăn
  useEffect(() => {
    if (
      isInitialCheckDone &&
      isBranchDishMissing &&
      !hasShownBranchDishModalRef.current
    ) {
      setIsBranchDishModalOpen(true);
      hasShownBranchDishModalRef.current = true;
    }
  }, [isInitialCheckDone, isBranchDishMissing]);

  useEffect(() => {
    if (!isVendor) {
      return;
    }

    void onGetVendorBalance();
  }, [isVendor, onGetVendorBalance]);

  // Fetch toàn bộ dữ liệu onboarding 1 lần duy nhất khi mount (không phụ thuộc pathname)
  // Badge sau đó được tính reactive từ Redux state → cập nhật ngay khi trang con thay đổi dữ liệu
  useEffect(() => {
    if (!isVendor) {
      return;
    }

    let isCancelled = false;

    const runInitialChecks = async (): Promise<void> => {
      try {
        // Dùng myVendor từ store nếu đã có, tránh gọi API thừa
        const vendor = myVendor ?? (await onGetMyVendor());

        if (!vendor?.vendorId || isCancelled) {
          return;
        }

        const acceptedBranches = (vendor.branches ?? []).filter(
          (branch) => branch.licenseStatus === 'Accept'
        );

        const subscribedBranchList = (vendor.branches ?? []).filter(
          (branch) => branch.isSubscribed
        );

        // Chạy song song: fetch dish, dietary, work schedules, và branch dishes
        await Promise.all([
          // Fetch dishes để cập nhật vendorDishesPagination vào store
          onGetDishesOfAVendor({
            vendorId: vendor.vendorId,
            params: { pageNumber: 1, pageSize: 1 },
          }),
          // Fetch dietary preferences để cập nhật myVendorDietaryPreferences vào store
          onGetDietaryPreferencesOfMyVendor({ vendorId: vendor.vendorId }),
          // Kiểm tra work schedules cho từng branch được chấp thuận
          // (kết quả lưu vào branchScheduleMap trong Redux - VendorLayout tự reactive)
          (async (): Promise<void> => {
            await Promise.all(
              acceptedBranches.map(async (branch) => {
                try {
                  await onGetWorkSchedules(branch.branchId);
                } catch (error) {
                  console.error(
                    `Error checking work schedules for branch ${branch.branchId}:`,
                    error
                  );
                }
              })
            );
          })(),
          // Kiểm tra số lượng món ăn cho từng branch đã subscribed
          // (kết quả lưu vào branchDishCountMap trong Redux - VendorLayout tự reactive)
          (async (): Promise<void> => {
            await Promise.all(
              subscribedBranchList.map(async (branch) => {
                try {
                  await onGetDishesByBranch({
                    branchId: branch.branchId,
                    params: { pageNumber: 1, pageSize: 1 },
                  });
                } catch (error) {
                  console.error(
                    `Error checking dishes for branch ${branch.branchId}:`,
                    error
                  );
                }
              })
            );
          })(),
        ]);

        if (!isCancelled) {
          setIsInitialCheckDone(true);
        }
      } catch (error) {
        console.error('Error during onboarding checks:', error);
        if (!isCancelled) {
          setIsInitialCheckDone(true);
        }
      }
    };

    void runInitialChecks();

    return (): void => {
      isCancelled = true;
    };
  }, [isVendor]); // chỉ chạy 1 lần khi mount - intentionally omit các callback dependencies

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
            navigation={filteredNavigation}
            userInfo={sidebarUserInfo}
            settingsPath="/vendor/settings"
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
          navigation={filteredNavigation}
          userInfo={sidebarUserInfo}
          settingsPath="/vendor/settings"
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
        <Box className="sticky top-0 z-30 border-b border-gray-200 bg-white shadow-sm">
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
              {isVendor && (
                <Box className="flex items-center gap-3">
                  <Box className="border-primary-200 bg-primary-50 text-primary-700 flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-bold whitespace-nowrap shadow-sm">
                    {/* <AccountBalanceIcon fontSize="small" /> */}
                    Số dư: {formatCurrencyVnd(accountBalance?.balance)}
                  </Box>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setIsTransferModalOpen(true)}
                    disabled={accountBalance?.balance === 0}
                    // startIcon={<MoneyIcon />}
                    className="bg-primary-600 hover:bg-primary-700 h-10 rounded-lg px-4 text-sm font-bold whitespace-nowrap text-white shadow-sm"
                    disableElevation
                  >
                    Yêu cầu rút tiền
                  </Button>
                </Box>
              )}
              {isVendor ? (
                <NotificationBell
                  onFeedbackNotificationClick={setFeedbackModalId}
                  onOrderNotificationClick={setOrderModalId}
                />
              ) : (
                <NotificationBell />
              )}
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
      <OrderDetailsModal
        isOpen={orderModalId !== null}
        onClose={() => setOrderModalId(null)}
        orderId={orderModalId}
      />
      <OnboardingMissingBranchModal
        open={isBranchModalOpen}
        missingBranches={missingScheduleBranches}
        onClose={() => setIsBranchModalOpen(false)}
      />
      <OnboardingMissingDietaryModal
        open={isDietaryModalOpen}
        onClose={() => setIsDietaryModalOpen(false)}
      />
      <OnboardingMissingDishModal
        open={isDishModalOpen}
        onClose={() => setIsDishModalOpen(false)}
      />
      <OnboardingMissingBranchDishModal
        open={isBranchDishModalOpen}
        missingBranches={missingBranchDishBranches}
        onClose={() => setIsBranchDishModalOpen(false)}
      />
      <UpdateUserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </Box>
  );
}

export default VendorLayout;
