import { useState, useEffect, useMemo } from 'react';
import type { JSX } from 'react';
import { Box, Chip } from '@mui/material';
import {
  Visibility as VisibilityIcon,
  HelpOutline as HelpOutlineIcon,
} from '@mui/icons-material';
import {
  type Controls,
  EVENTS,
  Joyride,
  STATUS,
  type EventData,
} from 'react-joyride';
import Table from '@features/admin/components/Table';
import Pagination from '@features/admin/components/Pagination';
import BranchDetailModal from '@features/admin/components/BranchDetailModal';
import type { BranchAdmin } from '@features/admin/types/branch';
import useBranch from '@features/admin/hooks/useBranch';
import { getAdminBranchManagementTourSteps } from '@features/admin/utils/adminBranchManagementTourSteps';
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
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [tourInstanceKey, setTourInstanceKey] = useState(0);

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

  const startTour = (): void => {
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
    return getAdminBranchManagementTourSteps({
      hasRows: branches.length > 0,
    });
  }, [branches.length]);

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

      {/* Header */}
      <div
        className="mb-6 flex items-center justify-between"
        data-tour="admin-branch-page-header"
      >
        <div>
          <div className="mb-1 flex items-start gap-2">
            <h1 className="text-table-text-primary text-3xl font-bold">
              Quản lý chi nhánh
            </h1>
            <button
              type="button"
              onClick={startTour}
              aria-label="Mở hướng dẫn quản lý chi nhánh"
              title="Hướng dẫn"
              className="text-primary-700 hover:text-primary-800 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
            >
              <HelpOutlineIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
          <p className="text-table-text-secondary text-sm">
            Quản lý danh sách các chi nhánh trong hệ thống
          </p>
        </div>
      </div>

      {/* Table */}
      <div data-tour="admin-branch-table-wrapper">
        <Table
          columns={columns}
          data={branches}
          rowKey="branchId"
          actions={actions}
          loading={status === 'pending'}
          emptyMessage="Chưa có chi nhánh nào"
          maxHeight="none"
          tourId="admin-branch"
        />
      </div>

      {/* Pagination */}
      <div className="mt-4" data-tour="admin-branch-pagination">
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
