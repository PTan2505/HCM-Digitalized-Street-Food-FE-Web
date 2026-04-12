import { useEffect, useMemo, useState } from 'react';
import type { JSX } from 'react';
import { Box } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ImageIcon from '@mui/icons-material/Image';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
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
import { useAppSelector } from '@hooks/reduxHooks';
import { selectMyVendor, selectVendorStatus } from '@slices/vendor';
import BranchDetailsModal from '@features/vendor/components/BranchDetailsModal';
import BranchFormModal from '@features/vendor/components/BranchFormModal';
import type { BranchFormMode } from '@features/vendor/components/BranchFormModal';
import ImagesDetailsModal from '@features/vendor/components/ImagesDetailsModal';
import { getRegistrationHistoryTourSteps } from '@features/vendor/utils/registrationHistoryTourSteps';

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

function RegistrationHistoryPage(): JSX.Element {
  const myVendor = useAppSelector(selectMyVendor);
  const status = useAppSelector(selectVendorStatus);
  const { onGetMyVendor } = useVendor();
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<BranchFormMode>({
    type: 'createVendor',
  });
  const [imagesBranch, setImagesBranch] = useState<Branch | null>(null);
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [tourInstanceKey, setTourInstanceKey] = useState(0);

  useEffect(() => {
    void onGetMyVendor();
  }, [onGetMyVendor]);

  const branches: Branch[] = myVendor?.branches ?? [];

  const handleOpenEditModal = (branch: Branch): void => {
    setFormMode({ type: 'editBranch', branch });
    setFormModalOpen(true);
  };

  const handleFormSuccess = (): void => {
    // Slice already handles branch update/create
  };

  const startRegistrationHistoryTour = (): void => {
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
    return getRegistrationHistoryTourSteps({
      hasRows: branches.length > 0,
    });
  }, [branches.length]);

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
      key: 'isVerified',
      label: 'Xác thực',
      style: { width: '120px' },
      render: (value: unknown): React.ReactNode => (
        <StatusBadge
          label={value ? 'Đã xác thực' : 'Chưa xác thực'}
          type={value ? 'success' : 'default'}
        />
      ),
    },
    {
      key: 'isActive',
      label: 'Tình trạng hoạt động',
      style: { width: '120px' },
      render: (value: unknown): React.ReactNode => (
        <StatusBadge
          label={value ? 'Đang hoạt động' : 'Không hoạt động'}
          type={value ? 'success' : 'error'}
        />
      ),
    },
    {
      key: 'licenseStatus',
      label: 'Trạng thái kiểm duyệt',
      style: { width: '160px' },
      render: (value: unknown): React.ReactNode => {
        if (value === 'Accept')
          return <StatusBadge label="Chấp nhận" type="success" />;
        if (value === 'Reject')
          return <StatusBadge label="Từ chối" type="error" />;
        if (value === 'Pending' || value === null)
          return <StatusBadge label="Đang chờ" type="warning" />;
        return <StatusBadge label="Chưa nộp" type="default" />;
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
      menuLabel: 'Chỉnh sửa chi nhánh',
      onClick: (branch: Branch): void => {
        handleOpenEditModal(branch);
      },
      color: 'primary' as const,
      show: (branch: Branch): boolean =>
        branch.licenseStatus === 'Pending' || branch.licenseStatus === null,
    },
    {
      id: 'delete',
      label: <DeleteIcon fontSize="small" />,
      menuLabel: 'Xóa chi nhánh',
      onClick: (): void => {},
      color: 'error' as const,
      show: (): boolean => false,
    },
    {
      id: 'dish',
      label: <RestaurantMenuIcon fontSize="small" />,
      menuLabel: 'Quản lý menu',
      onClick: (): void => {},
      color: 'primary' as const,
      show: (): boolean => false,
    },
    {
      id: 'images',
      label: <ImageIcon fontSize="small" />,
      menuLabel: 'Cập nhật ảnh quán',
      onClick: (branch: Branch): void => {
        setImagesBranch(branch);
      },
      color: 'primary' as const,
      show: (branch: Branch): boolean =>
        branch.licenseStatus === 'Pending' || branch.licenseStatus === null,
    },
    {
      id: 'schedule',
      label: <ScheduleIcon fontSize="small" />,
      menuLabel: 'Quản lý thời gian hoạt động',
      onClick: (): void => {},
      color: 'primary' as const,
      show: (): boolean => false,
    },
    {
      id: 'dayoff',
      label: <ScheduleIcon fontSize="small" />,
      menuLabel: 'Quản lý ngày nghỉ',
      onClick: (): void => {},
      color: 'error' as const,
      show: (): boolean => false,
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
      />

      <div
        className="mb-6 flex items-center justify-between"
        data-tour="registration-history-header"
      >
        <div>
          <div className="mb-1 flex items-start gap-2">
            <h1 className="text-table-text-primary text-3xl font-bold">
              Lịch sử đăng ký
            </h1>
            <button
              type="button"
              onClick={startRegistrationHistoryTour}
              aria-label="Mở hướng dẫn lịch sử đăng ký"
              title="Hướng dẫn"
              className="text-primary-700 hover:text-primary-800 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
            >
              <HelpOutlineIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
          <p className="text-table-text-secondary text-sm">
            Danh sách tất cả chi nhánh đã đăng ký
          </p>
        </div>
      </div>

      <div data-tour="registration-history-table-wrapper">
        <Table
          columns={columns}
          data={branches}
          rowKey="branchId"
          loading={status === 'pending'}
          emptyMessage="Chưa có lịch sử đăng ký nào"
          actions={actions}
          maxHeight="calc(100vh - 240px)"
          tourId="vendor-registration-history"
        />
      </div>

      <BranchDetailsModal
        isOpen={selectedBranch !== null}
        onClose={() => setSelectedBranch(null)}
        branch={selectedBranch}
        showPayment={false}
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
    </div>
  );
}

export default RegistrationHistoryPage;
