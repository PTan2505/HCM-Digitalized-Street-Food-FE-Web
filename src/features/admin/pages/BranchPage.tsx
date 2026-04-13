import { useState, useEffect } from 'react';
import type { JSX } from 'react';
import { Box, Chip } from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import Table from '@features/admin/components/Table';
import Pagination from '@features/admin/components/Pagination';
import BranchDetailModal from '@features/admin/components/BranchDetailModal';
import type { BranchAdmin } from '@features/admin/types/branch';
import useBranch from '@features/admin/hooks/useBranch';
import { useAppSelector } from '@hooks/reduxHooks';
import {
  selectAdminBranches,
  selectAdminBranchesPagination,
} from '@slices/branch';

export default function BranchPage(): JSX.Element {
  const branches = useAppSelector(selectAdminBranches);
  const pagination = useAppSelector(selectAdminBranchesPagination);
  const { onGetAdminBranches } = useBranch();

  const [status, setStatus] = useState<'idle' | 'pending'>('idle');

  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<BranchAdmin | null>(
    null
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    const fetchBranches = async (): Promise<void> => {
      setStatus('pending');
      try {
        await onGetAdminBranches({ pageNumber: currentPage, pageSize });
      } finally {
        setStatus('idle');
      }
    };
    void fetchBranches();
  }, [onGetAdminBranches, currentPage, pageSize]);

  const handleViewDetail = (branch: BranchAdmin): void => {
    setSelectedBranch(branch);
    setOpenDetailModal(true);
  };

  const handleCloseDetailModal = (): void => {
    setOpenDetailModal(false);
    setSelectedBranch(null);
  };

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number): void => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const columns = [
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
      render: (value: unknown, row: unknown): React.ReactNode => {
        const b = row as BranchAdmin;
        return (
          <Box className="text-table-text-secondary">
            {b.addressDetail}, {b.ward}
          </Box>
        );
      },
    },
    {
      key: 'isVerified',
      label: 'Xác minh',
      style: { width: '120px' },
      render: (value: unknown): React.ReactNode => {
        const isVerified = Boolean(value);
        return (
          <Chip
            label={isVerified ? 'Đã xác minh' : 'Chưa xác minh'}
            size="small"
            className={
              isVerified
                ? 'bg-blue-100 font-semibold text-blue-800'
                : 'bg-gray-100 font-semibold text-gray-800'
            }
          />
        );
      },
    },
    {
      key: 'isActive',
      label: 'Trạng thái',
      style: { width: '140px' },
      render: (value: unknown): React.ReactNode => {
        const isActive = Boolean(value);
        return (
          <Chip
            label={isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
            size="small"
            className={
              isActive
                ? 'bg-green-100 font-semibold text-green-800'
                : 'bg-red-100 font-semibold text-red-800'
            }
          />
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Ngày tạo',
      style: { width: '120px' },
      render: (value: unknown): React.ReactNode => {
        const date = new Date(String(value));
        return (
          <Box className="text-table-text-secondary text-sm">
            {date.toLocaleDateString('vi-VN')}
          </Box>
        );
      },
    },
  ];

  const actions = [
    {
      id: 'view',
      label: <VisibilityIcon fontSize="small" />,
      onClick: (row: BranchAdmin): void => {
        handleViewDetail(row);
      },
      tooltip: 'Xem chi tiết chi nhánh',
      color: 'primary' as const,
      variant: 'outlined' as const,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-table-text-primary mb-1 text-3xl font-bold">
            Quản lý chi nhánh
          </h1>
          <p className="text-table-text-secondary text-sm">
            Quản lý danh sách các chi nhánh trong hệ thống
          </p>
        </div>
      </div>

      {/* Table */}
      <div>
        <Table
          columns={columns}
          data={branches}
          rowKey="branchId"
          actions={actions}
          loading={status === 'pending'}
          emptyMessage="Chưa có chi nhánh nào"
          maxHeight="none"
        />
      </div>

      {/* Pagination */}
      <div className="mt-4">
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalCount}
          pageSize={pagination.pageSize}
          hasPrevious={pagination.hasPrevious}
          hasNext={pagination.hasNext}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      {/* Branch Detail Modal */}
      <BranchDetailModal
        open={openDetailModal}
        onClose={handleCloseDetailModal}
        branchDetail={selectedBranch}
      />
    </div>
  );
}
