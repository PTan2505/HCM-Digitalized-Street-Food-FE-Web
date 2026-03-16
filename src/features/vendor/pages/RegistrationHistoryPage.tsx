import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { Box } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ImageIcon from '@mui/icons-material/Image';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Add as AddIcon } from '@mui/icons-material';
import Table from '@features/vendor/components/Table';
import type { Branch } from '@features/vendor/types/vendor';
import useVendor from '@features/vendor/hooks/useVendor';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectMyVendor, selectVendorStatus } from '@slices/vendor';
import BranchDetailsModal from '@features/vendor/components/BranchDetailsModal';
import BranchFormModal from '@features/vendor/components/BranchFormModal';
import type { BranchFormMode } from '@features/vendor/components/BranchFormModal';
import ImagesDetailsModal from '@features/vendor/components/ImagesDetailsModal';

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
      className={`inline-flex min-w-[100px] items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-bold shadow-sm ${colors[type]}`}
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

  useEffect(() => {
    void onGetMyVendor();
  }, [onGetMyVendor]);

  const branches: Branch[] = myVendor?.branches ?? [];
  const vendorId: number | undefined = myVendor?.vendorId;

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

  const handleFormSuccess = (): void => {
    // Slice already handles branch update/create
  };

  const columns = [
    {
      key: 'branchId',
      label: 'ID',
      style: { width: '80px' },
    },
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
        <Box className="text-table-text-secondary block max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap">
          {typeof value === 'string' ? value : '-'}
        </Box>
      ),
    },
    {
      key: 'ward',
      label: 'Phường/Xã',
      style: { width: '140px' },
    },
    {
      key: 'city',
      label: 'Thành phố',
      style: { width: '140px' },
    },
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
      label: <VisibilityIcon fontSize="small" />,
      menuLabel: 'Xem chi tiết',
      onClick: (branch: Branch): void => {
        setSelectedBranch(branch);
      },
      color: 'primary' as const,
    },
    {
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
      label: <DeleteIcon fontSize="small" />,
      menuLabel: 'Xóa chi nhánh',
      onClick: (): void => {},
      color: 'error' as const,
      show: (): boolean => false,
    },
    {
      label: <RestaurantMenuIcon fontSize="small" />,
      menuLabel: 'Quản lý menu',
      onClick: (): void => {},
      color: 'primary' as const,
      show: (): boolean => false,
    },
    {
      label: <ImageIcon fontSize="small" />,
      menuLabel: 'Xem ảnh',
      onClick: (branch: Branch): void => {
        setImagesBranch(branch);
      },
      color: 'primary' as const,
      show: (branch: Branch): boolean =>
        branch.licenseStatus === 'Pending' || branch.licenseStatus === null,
    },
    {
      label: <ScheduleIcon fontSize="small" />,
      menuLabel: 'Quản lý thời gian hoạt động',
      onClick: (): void => {},
      color: 'primary' as const,
      show: (): boolean => false,
    },
    {
      label: <ScheduleIcon fontSize="small" />,
      menuLabel: 'Quản lý ngày nghỉ',
      onClick: (): void => {},
      color: 'error' as const,
      show: (): boolean => false,
    },
  ];

  return (
    <div className="font-[var(--font-nunito)]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-bold text-[var(--color-table-text-primary)]">
            Lịch sử đăng ký
          </h1>
          <p className="text-sm text-[var(--color-table-text-secondary)]">
            Danh sách tất cả chi nhánh đã đăng ký
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 rounded-lg bg-[var(--color-primary-600)] px-4 py-2 font-semibold text-white transition-colors hover:bg-[var(--color-primary-700)]"
        >
          <AddIcon fontSize="small" />
          {branches.length === 0 ? 'Tạo cửa hàng mới' : 'Thêm chi nhánh'}
        </button>
      </div>

      <Table
        columns={columns}
        data={branches}
        rowKey="branchId"
        loading={status === 'pending'}
        emptyMessage="Chưa có lịch sử đăng ký nào"
        actions={actions}
      />

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
