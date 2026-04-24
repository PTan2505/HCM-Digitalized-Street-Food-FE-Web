import SidebarContent, {
  type NavigationItem,
} from '@components/layout/SidebarContent';
import NotificationBell from '@components/NotificationBell';
import useLogin from '@features/auth/hooks/useLogin';
import OnboardingMissingBranchModal from '@features/vendor/components/OnboardingMissingBranchModal';
import useVendor from '@features/vendor/hooks/useVendor';
import UpdateUserProfileModal from '@features/user/components/UpdateUserProfileModal';
import {
  Menu as Bars3Icon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Storefront as BuildingStorefrontIcon,
  Description as DocumentTextIcon,
  Close as XMarkIcon,
  LocationOn as MapPinIcon,
} from '@mui/icons-material';
import { ROUTES } from '@constants/routes';
import { useAppSelector } from '@hooks/reduxHooks';
import { Box, IconButton, Typography } from '@mui/material';
import { selectUser } from '@slices/auth';
import { selectBranchScheduleMap, selectMyVendor } from '@slices/vendor';
import type { JSX } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const userBase = ROUTES.USER.BASE;
const userPaths = ROUTES.USER.PATHS;

const navigation = [
  {
    name: 'Chi nhánh',
    href: `${userBase}/${userPaths.BRANCH}`,
    icon: BuildingStorefrontIcon,
  },
  {
    name: 'Xác nhận sở hữu quán',
    href: `${userBase}/${userPaths.GHOST_PIN}`,
    icon: MapPinIcon,
  },
  {
    name: 'Lịch sử đăng ký',
    icon: DocumentTextIcon,
    href: `${userBase}/${userPaths.REGISTRATION_HISTORY}`,
    // children: [
    //   {
    //     name: 'Lịch sử đăng ký',
    //     href: `${userBase}/${userPaths.REGISTRATION_HISTORY}`,
    //     icon: DocumentTextIcon,
    //   },
    //   {
    //     name: 'Lịch sử thanh toán',
    //     href: `${userBase}/${userPaths.PAYMENT_HISTORY}`,
    //     icon: ClipboardDocumentListIcon,
    //   },
    // ],
  },
];

function UserLayout(): JSX.Element {
  type PendingOnboardingModal = 'branch' | null;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [isInitialCheckDone, setIsInitialCheckDone] = useState(false);
  const [pendingOnboardingModal, setPendingOnboardingModal] =
    useState<PendingOnboardingModal>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { onLogout } = useLogin();
  const { onGetMyVendor, onGetWorkSchedules } = useVendor();
  const user = useAppSelector(selectUser);
  const myVendor = useAppSelector(selectMyVendor);
  const branchScheduleMap = useAppSelector(selectBranchScheduleMap);

  const userBranchPath = `${userBase}/${userPaths.BRANCH}`;

  const acceptedBranches = useMemo(
    () =>
      (myVendor?.branches ?? []).filter(
        (branch) => branch.licenseStatus === 'Accept'
      ),
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

  const isBranchScheduleMissing = missingScheduleBranches.length > 0;

  const filteredNavigation = navigation.map((item) => {
    if (item.href === userBranchPath) {
      const hasBadge = isBranchScheduleMissing;
      return {
        ...item,
        badgeText: hasBadge ? 'Cập nhật' : undefined,
        onClick: (): void => {
          if (isBranchScheduleMissing) {
            setPendingOnboardingModal('branch');
          }
        },
      };
    }
    return item;
  });

  const pageTitle = useMemo(() => {
    const directMatch = filteredNavigation.find(
      (item) => item.href === location.pathname
    );
    if (directMatch) return directMatch.name;

    for (const item of filteredNavigation as NavigationItem[]) {
      const childMatch = item.children?.find(
        (child) => child.href === location.pathname
      );
      if (childMatch) return childMatch.name;
    }

    return 'Chi nhánh';
  }, [filteredNavigation, location.pathname]);

  useEffect(() => {
    if (
      pendingOnboardingModal === 'branch' &&
      location.pathname === userBranchPath
    ) {
      setIsBranchModalOpen(true);
      setPendingOnboardingModal(null);
    }
  }, [location.pathname, pendingOnboardingModal, userBranchPath]);

  useEffect(() => {
    let isCancelled = false;

    const runInitialChecks = async (): Promise<void> => {
      try {
        const vendor = myVendor ?? (await onGetMyVendor());
        if (!vendor?.vendorId || isCancelled) return;

        const accepted = (vendor.branches ?? []).filter(
          (b) => b.licenseStatus === 'Accept'
        );

        await Promise.all(
          accepted.map(async (branch) => {
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

        if (!isCancelled) setIsInitialCheckDone(true);
      } catch (error) {
        console.error('Error during user onboarding checks:', error);
        if (!isCancelled) setIsInitialCheckDone(true);
      }
    };

    void runInitialChecks();
    return (): void => {
      isCancelled = true;
    };
  }, []); // chỉ chạy 1 lần khi mount

  const roleLabel = 'User';

  const sidebarUserInfo = {
    name:
      user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : roleLabel,
    email: user?.email ?? '',
    role: roleLabel,
    avatarUrl: user?.avatarUrl ?? null,
  };

  const handleLogoClick = (): void => {
    navigate(`${userBase}/${userPaths.BRANCH}`);
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

      <OnboardingMissingBranchModal
        open={isBranchModalOpen}
        missingBranches={missingScheduleBranches}
        onClose={() => setIsBranchModalOpen(false)}
      />
      <UpdateUserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </Box>
  );
}

export default UserLayout;
