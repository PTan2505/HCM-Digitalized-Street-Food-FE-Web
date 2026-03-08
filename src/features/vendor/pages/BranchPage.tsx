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
import TabsContainer from '@features/vendor/components/Tab';
import { Add as AddIcon } from '@mui/icons-material';

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

function BranchPage(): JSX.Element {
  const myVendor = useAppSelector(selectMyVendor);
  const status = useAppSelector(selectVendorStatus);
  const { onGetMyVendor } = useVendor();
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  useEffect(() => {
    void onGetMyVendor();
  }, [onGetMyVendor]);

  const branches: Branch[] = myVendor?.branches ?? [];
  const verifiedBranches: Branch[] = branches.filter(
    (b) => b.licenseStatus === 'Accept'
  );
  const vendorId: number | undefined = myVendor?.vendorId;

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
      onClick: (): void => {
        // Handle editing the selected branch
        // API PUT BRANCH DÙNG CHUNG MODAL VỚI API POST BRANCH, CHỈ KHÁC Ở 2 CHỖ:
        // 1. API POST CÓ THÊM 1 SECTION ĐỂ SUBMIT LICENSE VÀ 1 SECTION ĐỂ UPLOAD HÌNH ẢNH CỦA QUÁN
        // 2. API PUT CHỈ CÓ 1 SECTION ĐỂ CHỈNH SỬA THÔNG TIN CHI NHÁNH, KHÔNG CÓ 2 SECTION LICENSE VÀ UPLOAD HÌNH ẢNH NHƯ API POST VÀ SẼ CÓ THÊM FIELD isActive
      },
      color: 'primary' as const,
    },
    {
      label: <DeleteIcon fontSize="small" />,
      menuLabel: 'Xóa chi nhánh',
      onClick: (): void => {
        // Handle deleting the selected branch
        // PHẢI HỎI XÁC NHẬN TRƯỚC KHI XÓA
      },
      color: 'error' as const,
    },
    {
      label: <RestaurantMenuIcon fontSize="small" />,
      menuLabel: 'Quản lý menu',
      onClick: (): void => {
        // Handle menu management for the selected branch
        // KHI BẤM VÀO SẼ MỞ MODAL ĐỂ CRUD MENU
      },
      color: 'primary' as const,
    },
    {
      label: <ImageIcon fontSize="small" />,
      menuLabel: 'Xem ảnh',
      onClick: (): void => {
        // Handle image management for the selected branch
        // KHI BẤM VÀO SẼ MỞ MODAL ĐỂ POST, GET, DELETE ẢNH CỦA CHI NHÁNH
      },
      color: 'primary' as const,
    },
    {
      label: <ScheduleIcon fontSize="small" />,
      menuLabel: 'Quản lý lịch làm việc',
      onClick: (): void => {
        // Handle schedule management for the selected branch
        // KHI BẤM VÀO SẼ MỞ MODAL ĐỂ CRUD LỊCH LÀM VIỆC CỦA CHI NHÁNH
      },
      color: 'primary' as const,
    },
    {
      label: <ScheduleIcon fontSize="small" />,
      menuLabel: 'Quản lý ngày nghỉ',
      onClick: (): void => {
        // Handle schedule management for the selected branch
        // KHI BẤM VÀO SẼ MỞ MODAL ĐỂ POST, GET, DELETE NGÀY NGHỈ CỦA CHI NHÁNH
      },
      color: 'error' as const,
    },
  ];

  return (
    <div className="font-[var(--font-nunito)]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-bold text-[var(--color-table-text-primary)]">
            Quản lý chi nhánh
          </h1>
          <p className="text-sm text-[var(--color-table-text-secondary)]">
            Danh sách các chi nhánh của cửa hàng
          </p>
        </div>
        <button
          // onClick={() => handleOpenDialog()}
          className="flex items-center gap-2 rounded-lg bg-[var(--color-primary-600)] px-4 py-2 font-semibold text-white transition-colors hover:bg-[var(--color-primary-700)]"
        >
          <AddIcon fontSize="small" />
          Thêm chi nhánh
        </button>
      </div>

      {/* Tabs */}
      <TabsContainer
        tabs={[
          {
            label: 'Lịch sử đăng ký',
            content: (
              <Table
                columns={columns}
                data={branches}
                rowKey="branchId"
                loading={status === 'pending'}
                emptyMessage="Chưa có chi nhánh nào"
                actions={actions}
              />
            ),
          },
          {
            label: 'Chi nhánh đã xác thực',
            content: (
              <Table
                columns={columns}
                data={verifiedBranches}
                rowKey="branchId"
                loading={status === 'pending'}
                emptyMessage="Chưa có chi nhánh đã xác thực"
                actions={actions}
              />
            ),
          },
        ]}
      />

      {/* Branch Details Modal */}
      <BranchDetailsModal
        isOpen={selectedBranch !== null}
        onClose={() => setSelectedBranch(null)}
        branch={selectedBranch}
      />
    </div>
  );
}

export default BranchPage;
