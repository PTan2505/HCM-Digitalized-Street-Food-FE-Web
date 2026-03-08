import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { Box, Tooltip as MuiTooltip } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ImageIcon from '@mui/icons-material/Image';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Table from '@features/vendor/components/Table';
import type { Branch } from '@features/vendor/types/vendor';
import useVendor from '@features/vendor/hooks/useVendor';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectMyVendor, selectVendorStatus } from '@slices/vendor';
import BranchDetailsModal from '@features/vendor/components/BranchDetailsModal';

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

  useEffect(() => {
    void onGetMyVendor();
  }, [onGetMyVendor]);

  const branches: Branch[] = myVendor?.branches ?? [];

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
          label={value ? 'Đang hoạt động' : 'Ngưng hoạt động'}
          type={value ? 'success' : 'error'}
        />
      ),
    },
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
      onClick: (): void => {},
      color: 'primary' as const,
    },
    {
      label: <DeleteIcon fontSize="small" />,
      menuLabel: 'Xóa chi nhánh',
      onClick: (): void => {},
      color: 'error' as const,
    },
    {
      label: <RestaurantMenuIcon fontSize="small" />,
      menuLabel: 'Quản lý menu',
      onClick: (): void => {},
      color: 'primary' as const,
    },
    {
      label: <ImageIcon fontSize="small" />,
      menuLabel: 'Xem ảnh',
      onClick: (): void => {},
      color: 'primary' as const,
    },
    {
      label: <ScheduleIcon fontSize="small" />,
      menuLabel: 'Quản lý lịch làm việc',
      onClick: (): void => {},
      color: 'primary' as const,
    },
    {
      label: <ScheduleIcon fontSize="small" />,
      menuLabel: 'Quản lý ngày nghỉ',
      onClick: (): void => {},
      color: 'error' as const,
    },
  ];

  return (
    <div className="font-[var(--font-nunito)]">
      <div className="mb-6">
        <h1 className="mb-1 text-3xl font-bold text-[var(--color-table-text-primary)]">
          Lịch sử đăng ký
        </h1>
        <p className="text-sm text-[var(--color-table-text-secondary)]">
          Danh sách tất cả chi nhánh đã đăng ký
        </p>
      </div>

      <Table
        columns={columns}
        data={branches}
        rowKey="branchId"
        loading={status === 'pending'}
        emptyMessage="Chưa có chi nhánh nào"
        actions={actions}
      />

      <BranchDetailsModal
        isOpen={selectedBranch !== null}
        onClose={() => setSelectedBranch(null)}
        branch={selectedBranch}
      />
    </div>
  );
}

export default RegistrationHistoryPage;
