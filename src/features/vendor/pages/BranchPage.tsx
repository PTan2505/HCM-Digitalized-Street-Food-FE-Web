import { useEffect, useMemo, useRef, useState } from 'react';
import type { JSX } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, IconButton, Tooltip as MuiTooltip } from '@mui/material';
import DeleteConfirmationDialog from '@components/ui/DeleteConfirmationDialog';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ImageIcon from '@mui/icons-material/Image';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PaymentIcon from '@mui/icons-material/Payment';
import { Add as AddIcon } from '@mui/icons-material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import {
  type Controls,
  EVENTS,
  Joyride,
  STATUS,
  type EventData,
} from 'react-joyride';
import Table from '@features/vendor/components/Table';
import type { Branch } from '@features/vendor/types/vendor';
import useVendor from '@features/vendor/hooks/useVendor';
import usePayment from '@features/vendor/hooks/usePayment';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectMyVendor, selectVendorStatus } from '@slices/vendor';
import BranchDetailsModal from '@features/vendor/components/BranchDetailsModal';
import BranchFormModal from '@features/vendor/components/BranchFormModal';
import type { BranchFormMode } from '@features/vendor/components/BranchFormModal';
import ImagesDetailsModal from '@features/vendor/components/ImagesDetailsModal';
import WorkScheduleModal from '@features/vendor/components/WorkScheduleModal';
import DayOffModal from '@features/vendor/components/DayOffModal';
import BranchDishDetailsModal from '@features/vendor/components/BranchDishDetailsModal';
import BranchFeedbackModal from '@features/vendor/components/BranchFeedbackModal';
import OnboardingGuideModal from '@features/vendor/components/OnboardingGuideModal';
import BranchManagerModal from '@features/vendor/components/BranchManagerModal';
import { getBranchManagementTourSteps } from '@features/vendor/utils/branchManagementTourSteps';
// import BranchCampaignManagementModal from '@features/vendor/components/BranchCampaignManagementModal';

const StatusBadge = ({
  label,
  type,
}: {
  label: string;
  type: 'success' | 'error' | 'warning' | 'default';
}): JSX.Element => {
  const colors = {
    success: 'bg-green-100 text-green-700 border-green-200',
    error: 'bg-red-100 text-red-700 border-red-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    default: 'bg-slate-100 text-slate-700 border-slate-200',
  };
  return (
    <span
      className={`inline-flex min-w-25 items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-bold shadow-sm ${colors[type]}`}
    >
      {label}
    </span>
  );
};

function BranchPage(): JSX.Element {
  const myVendor = useAppSelector(selectMyVendor);
  const status = useAppSelector(selectVendorStatus);
  const { onGetMyVendor, onUpdateVendorName, onDeleteBranch, onGetUserById } =
    useVendor();
  const { onCreatePaymentLink } = usePayment();
  const location = useLocation();
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<BranchFormMode>({
    type: 'createVendor',
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [imagesBranch, setImagesBranch] = useState<Branch | null>(null);
  const [scheduleBranch, setScheduleBranch] = useState<Branch | null>(null);
  const [dayOffBranch, setDayOffBranch] = useState<Branch | null>(null);
  const [dishBranch, setDishBranch] = useState<Branch | null>(null);
  const [feedbackBranch, setFeedbackBranch] = useState<Branch | null>(null);
  const [managerBranch, setManagerBranch] = useState<Branch | null>(null);
  // const [campaignBranch, setCampaignBranch] = useState<Branch | null>(null);
  const [managerNameById, setManagerNameById] = useState<
    Record<number, string>
  >({});
  const [payingBranchId, setPayingBranchId] = useState<number | null>(null);
  const requestedManagerIdsRef = useRef<Set<number>>(new Set());
  const [showOnboardingGuide, setShowOnboardingGuide] = useState(() => {
    return (
      (location.state as { fromEditProfile?: boolean } | null)
        ?.fromEditProfile ?? false
    );
  });
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [tourInstanceKey, setTourInstanceKey] = useState(0);

  const handleStartEditName = (): void => {
    setEditedName(myVendor?.name ?? '');
    setIsEditingName(true);
    setTimeout(() => nameInputRef.current?.select(), 0);
  };

  const handleSaveName = (): void => {
    const trimmed = editedName.trim();
    if (trimmed && trimmed !== myVendor?.name) {
      void onUpdateVendorName({ name: trimmed });
    }
    setIsEditingName(false);
  };

  const handleCancelEditName = (): void => {
    setIsEditingName(false);
  };

  const handleDeleteBranch = (branch: Branch): void => {
    setDeletingBranch(branch);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (deletingBranch) {
      await onDeleteBranch(deletingBranch.branchId);
      setOpenDeleteDialog(false);
      setDeletingBranch(null);
    }
  };

  const handleCancelDelete = (): void => {
    setOpenDeleteDialog(false);
    setDeletingBranch(null);
  };

  useEffect(() => {
    void onGetMyVendor();
  }, [onGetMyVendor]);

  const branches: Branch[] = myVendor?.branches ?? [];
  const vendorId: number | undefined = myVendor?.vendorId;
  const verifiedBranches: Branch[] = branches.filter(
    (b) => b.licenseStatus === 'Accept'
  );

  const getValidManagerId = (managerId: unknown): number | null => {
    if (typeof managerId !== 'number') return null;
    if (!Number.isInteger(managerId) || managerId <= 0) return null;
    return managerId;
  };

  useEffect(() => {
    const managerIds = Array.from(
      new Set(
        branches
          .map((branch) => getValidManagerId(branch.managerId))
          .filter((managerId): managerId is number => managerId !== null)
      )
    ).filter((managerId) => !requestedManagerIdsRef.current.has(managerId));

    if (managerIds.length === 0) return;

    managerIds.forEach((managerId) => {
      requestedManagerIdsRef.current.add(managerId);
    });

    const fetchManagerNames = async (): Promise<void> => {
      const resolved = await Promise.all(
        managerIds.map(async (managerId) => {
          try {
            const user = await onGetUserById(managerId);
            const trimmedUserName = user.userName?.trim();
            const trimmedUsername = user.username?.trim();
            const fullName = [user.firstName, user.lastName]
              .filter(Boolean)
              .join(' ')
              .trim();

            const managerName =
              trimmedUserName && trimmedUserName.length > 0
                ? trimmedUserName
                : trimmedUsername && trimmedUsername.length > 0
                  ? trimmedUsername
                  : fullName.length > 0
                    ? fullName
                    : undefined;

            return [managerId, managerName ?? `ID ${managerId}`] as const;
          } catch {
            return [managerId, `ID ${managerId}`] as const;
          }
        })
      );

      setManagerNameById((prev) => {
        const next = { ...prev };
        resolved.forEach(([managerId, managerName]) => {
          next[managerId] = managerName;
        });
        return next;
      });
    };

    void fetchManagerNames();
  }, [branches, onGetUserById]);

  const hasAnySubscribedBranch = branches.some((b) => b.isSubscribed);

  const canRegisterPackage = (branch: Branch): boolean => {
    return (
      !branch.isSubscribed &&
      branch.isVerified &&
      branch.licenseStatus === 'Accept' &&
      hasAnySubscribedBranch
    );
  };

  const handleRegisterPackagePayment = async (
    branch: Branch
  ): Promise<void> => {
    setPayingBranchId(branch.branchId);
    try {
      const res = await onCreatePaymentLink({ branchId: branch.branchId });
      if (res.success && res.paymentUrl) {
        window.location.href = res.paymentUrl;
      }
    } finally {
      setPayingBranchId(null);
    }
  };

  const handleOpenCreateModal = (): void => {
    if (branches.length === 0) {
      setFormMode({ type: 'createVendor' });
    } else if (vendorId !== undefined) {
      setFormMode({ type: 'addBranch', vendorId });
    }
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (branch: Branch): void => {
    setFormMode({ type: 'editBranch', branch });
    setFormModalOpen(true);
  };

  const startBranchTour = (): void => {
    setShowOnboardingGuide(false);
    setTourInstanceKey((prev) => prev + 1);
    setIsTourRunning(true);
  };

  const handleJoyrideEvent = (data: EventData, controls: Controls): void => {
    if (data.type === EVENTS.TARGET_NOT_FOUND) {
      controls.next();
      return;
    }

    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
      setIsTourRunning(false);
    }
  };

  const tourSteps = useMemo(() => {
    return getBranchManagementTourSteps({
      hasBranchRows: verifiedBranches.length > 0,
    });
  }, [verifiedBranches.length]);

  const handleFormSuccess = (): void => {
    // Slice already handles branch update/create
  };

  const columns = [
    // {
    //   key: 'branchId',
    //   label: 'ID',
    //   style: { width: '80px' },
    // },
    {
      key: 'name',
      label: 'Tên chi nhánh',
      render: (value: unknown): React.ReactNode => (
        <Box className="text-table-text-primary font-semibold">
          {String(value)}
        </Box>
      ),
    },
    {
      key: 'addressDetail',
      label: 'Địa chỉ',
      render: (value: unknown): React.ReactNode => (
        <Box className="text-table-text-secondary block max-w-75 overflow-hidden text-ellipsis whitespace-nowrap">
          {typeof value === 'string' ? value : '-'}
        </Box>
      ),
    },
    {
      key: 'ward',
      label: 'Phường/Xã',
      style: { width: '140px' },
    },
    // {
    //   key: 'city',
    //   label: 'Thành phố',
    //   style: { width: '140px' },
    // },
    {
      key: 'managerId',
      label: 'Quản lý chi nhánh',
      style: { width: '180px' },
      render: (value: unknown): React.ReactNode => {
        const managerId = getValidManagerId(value);
        if (managerId === null) {
          return '-';
        }

        return (
          <Box className="text-table-text-primary font-medium">
            {managerNameById[managerId] ?? `ID ${managerId}`}
          </Box>
        );
      },
    },
    // {
    //   key: 'isVerified',
    //   label: 'Xác thực',
    //   style: { width: '120px' },
    //   render: (value: unknown): React.ReactNode => (
    //     <StatusBadge
    //       label={value ? 'Đã xác thực' : 'Chưa xác thực'}
    //       type={value ? 'success' : 'default'}
    //     />
    //   ),
    // },
    // {
    //   key: 'isActive',
    //   label: 'Tình trạng hoạt động',
    //   style: { width: '120px' },
    //   render: (value: unknown): React.ReactNode => (
    //     <StatusBadge
    //       label={value ? 'Đang hoạt động' : 'Không hoạt động'}
    //       type={value ? 'success' : 'error'}
    //     />
    //   ),
    // },
    {
      key: 'isSubscribed',
      label: 'Tình trạng đăng ký',
      style: { width: '120px' },
      render: (value: unknown, row: Branch): React.ReactNode => {
        const days = row.daysRemaining;
        const isExpiringSoon =
          value === true && days !== null && days !== undefined && days <= 7;
        return (
          <Box className="flex items-center gap-1">
            <StatusBadge
              label={value ? 'Đã thanh toán' : 'Chưa thanh toán'}
              type={value ? 'success' : 'error'}
            />
            {isExpiringSoon && (
              <MuiTooltip title={`Còn ${days} ngày hết hạn`} arrow>
                <Box className="flex items-center">
                  <WarningAmberIcon
                    fontSize="small"
                    sx={{ color: '#f59e0b' }}
                  />
                </Box>
              </MuiTooltip>
            )}
          </Box>
        );
      },
    },
  ];

  const actions = [
    {
      id: 'view',
      label: <VisibilityIcon fontSize="small" />,
      menuLabel: 'Xem chi tiết',
      onClick: (branch: Branch): void => {
        setSelectedBranch(branch);
      },
      color: 'primary' as const,
    },
    {
      id: 'edit',
      label: <EditIcon fontSize="small" />,
      menuLabel: 'Cập nhật chi nhánh',
      onClick: (branch: Branch): void => {
        handleOpenEditModal(branch);
      },
      color: 'primary' as const,
    },
    {
      id: 'delete',
      label: <DeleteIcon fontSize="small" />,
      menuLabel: 'Xóa chi nhánh',
      onClick: (branch: Branch): void => {
        handleDeleteBranch(branch);
      },
      color: 'error' as const,
    },
    {
      id: 'images',
      label: <ImageIcon fontSize="small" />,
      menuLabel: 'Cập nhật ảnh quán',
      onClick: (branch: Branch): void => {
        setImagesBranch(branch);
      },
      color: 'primary' as const,
    },
    {
      id: 'schedule',
      label: <ScheduleIcon fontSize="small" />,
      menuLabel: 'Quản lý thời gian hoạt động',
      onClick: (branch: Branch): void => {
        setScheduleBranch(branch);
      },
      color: 'primary' as const,
    },
    {
      id: 'dayoff',
      label: <ScheduleIcon fontSize="small" />,
      menuLabel: 'Quản lý ngày nghỉ',
      onClick: (branch: Branch): void => {
        setDayOffBranch(branch);
      },
      color: 'error' as const,
    },
    {
      id: 'dish',
      label: <RestaurantMenuIcon fontSize="small" />,
      menuLabel: 'Quản lý menu',
      onClick: (branch: Branch): void => {
        setDishBranch(branch);
      },
      color: 'primary' as const,
      show: (branch: Branch): boolean => branch.isSubscribed,
    },
    {
      id: 'manager',
      label: <ManageAccountsIcon fontSize="small" />,
      menuLabel: 'Cập nhật người quản lý',
      onClick: (branch: Branch): void => {
        setManagerBranch(branch);
      },
      color: 'info' as const,
    },
    // {
    //   label: <CampaignIcon fontSize="small" />,
    //   menuLabel: 'Quản lý chiến dịch',
    //   onClick: (branch: Branch): void => {
    //     setCampaignBranch(branch);
    //   },
    //   color: 'warning' as const,
    //   show: (branch: Branch): boolean => branch.isSubscribed,
    // },
    {
      label: <PaymentIcon fontSize="small" />,
      id: 'payment',
      menuLabel: 'Thanh toán đăng ký gói',
      onClick: (branch: Branch): void => {
        void handleRegisterPackagePayment(branch);
      },
      color: 'success' as const,
      show: (branch: Branch): boolean => canRegisterPackage(branch),
      disabled: (branch: Branch): boolean => payingBranchId === branch.branchId,
    },
    {
      id: 'feedback',
      label: <RateReviewIcon fontSize="small" />,
      menuLabel: 'Phản hồi về chi nhánh',
      onClick: (branch: Branch): void => {
        setFeedbackBranch(branch);
      },
      color: 'info' as const,
    },
  ];

  return (
    <div className="font-(--font-nunito)">
      <Joyride
        key={tourInstanceKey}
        run={isTourRunning}
        steps={tourSteps}
        continuous
        scrollToFirstStep
        onEvent={handleJoyrideEvent}
        options={{
          showProgress: true,
          scrollDuration: 350,
          scrollOffset: 80,
          spotlightPadding: 8,
          overlayColor: 'rgba(15, 23, 42, 0.5)',
          primaryColor: '#7ab82d',
          textColor: '#1f2937',
          zIndex: 1700,
          buttons: ['back', 'skip', 'primary'],
        }}
        locale={{
          back: 'Quay lại',
          close: 'Đóng',
          last: 'Hoàn tất',
          next: 'Tiếp theo',
          nextWithProgress: 'Tiếp theo ({current}/{total})',
          skip: 'Bỏ qua',
        }}
        styles={{
          tooltip: {
            borderRadius: 14,
          },
          buttonPrimary: {
            borderRadius: 10,
            fontWeight: 700,
          },
          buttonBack: {
            borderRadius: 10,
            fontWeight: 700,
          },
          buttonSkip: {
            borderRadius: 10,
            fontWeight: 700,
          },
        }}
      />

      {/* Header */}
      <div
        className="mb-6 flex items-center justify-between"
        data-tour="branch-page-header"
      >
        <div data-tour="vendor-store-name">
          <h1 className="text-table-text-primary mb-1 text-3xl font-bold">
            Quản lý chi nhánh
          </h1>
          <p className="text-table-text-secondary text-sm">
            Tên cửa hàng:{' '}
            {isEditingName ? (
              <span className="inline-flex items-center gap-1">
                <input
                  ref={nameInputRef}
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') handleCancelEditName();
                  }}
                  className="border-primary-400 focus:ring-primary-300 rounded border px-1.5 py-0.5 text-sm font-semibold outline-none focus:ring-2"
                  autoFocus
                />
                <IconButton
                  size="small"
                  onClick={handleSaveName}
                  color="success"
                  title="Lưu"
                >
                  <CheckIcon sx={{ fontSize: 16 }} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={handleCancelEditName}
                  color="error"
                  title="Hủy"
                >
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold">
                {myVendor?.name ?? 'Chưa có tên cửa hàng'}
                {myVendor?.name && (
                  <EditIcon
                    sx={{
                      fontSize: 15,
                      cursor: 'pointer',
                      '&:hover': { color: 'var(--color-primary-600)' },
                    }}
                    onClick={handleStartEditName}
                    titleAccess="Nhấn để chỉnh sửa tên cửa hàng"
                  />
                )}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={startBranchTour}
            className="border-primary-300 text-primary-700 hover:bg-primary-50 inline-flex items-center gap-2 rounded-lg border px-4 py-2 font-semibold transition-colors"
          >
            <HelpOutlineIcon fontSize="small" />
            Hướng dẫn
          </button>
          <button
            onClick={handleOpenCreateModal}
            data-tour="branch-create-button"
            className="bg-primary-600 hover:bg-primary-700 flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white transition-colors"
          >
            <AddIcon fontSize="small" />
            {branches.length === 0 ? 'Tạo cửa hàng mới' : 'Thêm chi nhánh'}
          </button>
        </div>
      </div>

      <div data-tour="branch-table-wrapper">
        <Table
          columns={columns}
          data={verifiedBranches}
          rowKey="branchId"
          loading={status === 'pending'}
          emptyMessage="Chưa có chi nhánh đã xác thực (Vui lòng đăng ký chi nhánh ở tab Lịch sử đăng ký)"
          actions={actions}
          maxHeight="calc(100vh - 240px)"
          tourId="vendor-branch"
        />
      </div>

      <BranchDetailsModal
        isOpen={selectedBranch !== null}
        onClose={() => setSelectedBranch(null)}
        branch={selectedBranch}
        managerName={
          selectedBranch
            ? getValidManagerId(selectedBranch.managerId) === null
              ? '-'
              : managerNameById[selectedBranch.managerId]
            : null
        }
        hasAnySubscribedBranch={hasAnySubscribedBranch}
        showPayment={true}
      />

      <BranchFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        mode={formMode}
        onSuccess={handleFormSuccess}
      />

      <ImagesDetailsModal
        isOpen={imagesBranch !== null}
        onClose={() => setImagesBranch(null)}
        branch={imagesBranch}
      />

      <WorkScheduleModal
        isOpen={scheduleBranch !== null}
        onClose={() => setScheduleBranch(null)}
        branch={scheduleBranch}
      />

      <DayOffModal
        isOpen={dayOffBranch !== null}
        onClose={() => setDayOffBranch(null)}
        branch={dayOffBranch}
      />

      <BranchDishDetailsModal
        isOpen={dishBranch !== null}
        onClose={() => setDishBranch(null)}
        branch={dishBranch}
        vendorId={myVendor?.vendorId}
      />

      <BranchFeedbackModal
        isOpen={feedbackBranch !== null}
        onClose={() => setFeedbackBranch(null)}
        branch={feedbackBranch}
      />

      <BranchManagerModal
        isOpen={managerBranch !== null}
        onClose={() => setManagerBranch(null)}
        branch={managerBranch}
        onAssigned={() => {
          void onGetMyVendor();
        }}
      />

      {/* <BranchCampaignManagementModal
        isOpen={campaignBranch !== null}
        onClose={() => setCampaignBranch(null)}
        branch={campaignBranch}
      /> */}

      <OnboardingGuideModal
        open={showOnboardingGuide}
        onClose={() => setShowOnboardingGuide(false)}
        onStartTour={startBranchTour}
      />

      <DeleteConfirmationDialog
        open={openDeleteDialog}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa chi nhánh"
        confirmationMessage={
          <>
            Bạn có chắc chắn muốn xóa chi nhánh &quot;{deletingBranch?.name}
            &quot;? Hành động này không thể hoàn tác.
          </>
        }
      />
    </div>
  );
}

export default BranchPage;
