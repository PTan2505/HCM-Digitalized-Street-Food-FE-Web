import { useEffect } from 'react';
import type { JSX } from 'react';
import { Box, Chip } from '@mui/material';
import Table from '@features/vendor/components/Table';
import type { Branch } from '@features/vendor/types/vendor';
import useVendor from '@features/vendor/hooks/useVendor';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectMyVendor, selectVendorStatus } from '@slices/vendor';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import PaymentIcon from '@mui/icons-material/Payment';

function BranchPage(): JSX.Element {
  const myVendor = useAppSelector(selectMyVendor);
  const status = useAppSelector(selectVendorStatus);
  const { onGetMyVendor } = useVendor();

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
      key: 'branchName',
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
        <Chip
          label={value ? 'Đã xác thực' : 'Chưa xác thực'}
          size="small"
          color={value ? 'success' : 'default'}
        />
      ),
    },
    {
      key: 'isActive',
      label: 'Trạng thái',
      style: { width: '120px' },
      render: (value: unknown): React.ReactNode => (
        <Chip
          label={value ? 'Hoạt động' : 'Ngưng hoạt động'}
          size="small"
          color={value ? 'success' : 'error'}
        />
      ),
    },
  ];

  const actions = [
    {
      label: (
        <Tooltip title="Thanh toán">
          <IconButton size="small" color="primary">
            <PaymentIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
      onClick: (branch: Branch): void => {
        console.log('branch', branch);
      },
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
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={branches}
        rowKey="branchId"
        loading={status === 'pending'}
        emptyMessage="Chưa có chi nhánh nào"
        actions={actions}
      />
    </div>
  );
}

export default BranchPage;
