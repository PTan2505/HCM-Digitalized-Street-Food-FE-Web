import { useState, useEffect, useCallback } from 'react';
import React from 'react';
import Table from '@features/moderator/components/Table';
import Pagination from '@features/moderator/components/Pagination';
import RejectModal from '@features/moderator/components/RejectModal';
import VendorRegistrationDetails from '@features/moderator/components/VendorRegistrationDetails';
import VendorLicenseDetails from '@features/moderator/components/VendorLicenseDetails';
import useBranch from '@features/moderator/hooks/useBranch';
import { useAppSelector } from '@hooks/reduxHooks';
import {
  selectPendingRegistrations,
  selectPendingRegistrationsPagination,
  selectBranchStatus,
} from '@slices/branch';
import type { BranchRegisterRequest } from '@features/moderator/types/branch';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

export default function VendorVerificationPage(): React.JSX.Element {
  const pendingRegistrations = useAppSelector(selectPendingRegistrations);
  const pagination = useAppSelector(selectPendingRegistrationsPagination);
  const status = useAppSelector(selectBranchStatus);
  const {
    onGetPendingRegistrations,
    onVerifyBranchRegistration,
    onRejectBranchRegistration,
  } = useBranch();

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [licenseModalOpen, setLicenseModalOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] =
    useState<BranchRegisterRequest | null>(null);

  useEffect(() => {
    void onGetPendingRegistrations({ pageNumber, pageSize });
  }, [onGetPendingRegistrations, pageNumber, pageSize]);

  const handlePageChange = useCallback((page: number): void => {
    setPageNumber(page);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number): void => {
    setPageSize(newPageSize);
    setPageNumber(1);
  }, []);

  const handleVerify = async (row: Record<string, unknown>): Promise<void> => {
    try {
      const registration = row as unknown as BranchRegisterRequest;
      await onVerifyBranchRegistration({
        branchId: registration.branchId,
        data: { branchId: registration.branchId },
      });
    } catch (error) {
      console.error('Failed to verify:', error);
    }
  };

  const handleOpenDetailsModal = (row: Record<string, unknown>): void => {
    setSelectedRegistration(row as unknown as BranchRegisterRequest);
    setDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = (): void => {
    setDetailsModalOpen(false);
    setSelectedRegistration(null);
  };

  const handleOpenLicenseModal = (row: Record<string, unknown>): void => {
    setSelectedRegistration(row as unknown as BranchRegisterRequest);
    setLicenseModalOpen(true);
  };

  const handleCloseLicenseModal = (): void => {
    setLicenseModalOpen(false);
    setSelectedRegistration(null);
  };

  const handleOpenRejectModal = (row: Record<string, unknown>): void => {
    setSelectedRegistration(row as unknown as BranchRegisterRequest);
    setRejectModalOpen(true);
  };

  const handleCloseRejectModal = (): void => {
    setRejectModalOpen(false);
    setSelectedRegistration(null);
  };

  const handleConfirmReject = async (reason: string): Promise<void> => {
    if (!selectedRegistration) return;
    try {
      await onRejectBranchRegistration({
        branchId: selectedRegistration.branchId,
        data: { branchId: selectedRegistration.branchId, reason },
      });
      handleCloseRejectModal();
    } catch (error) {
      console.error('Failed to reject:', error);
    }
  };

  const getStatusBadge = (statusValue: number): React.JSX.Element => {
    const statusConfig: Record<
      number,
      { bg: string; text: string; label: string }
    > = {
      0: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Chờ duyệt',
      },
      1: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Đã xác minh',
      },
      2: { bg: 'bg-red-100', text: 'text-red-800', label: 'Từ chối' },
    };

    const config = statusConfig[statusValue] ?? {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      label: String(statusValue),
    };

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const columns = [
    {
      key: 'branchRegisterRequestId',
      label: 'STT',
      render: (
        _: unknown,
        _row: Record<string, unknown>,
        index?: number
      ): number => (index ?? 0) + 1,
    },
    {
      key: 'branch.name',
      label: 'Tên chủ cửa hàng',
      className: 'font-medium',
    },
    {
      key: 'branch.email',
      label: 'Email',
    },
    {
      key: 'branch.phoneNumber',
      label: 'Số điện thoại',
    },
    // {
    //   key: 'status',
    //   label: 'Trạng thái',
    //   render: (value: unknown): React.JSX.Element =>
    //     getStatusBadge(value as number),
    // },
    // {
    //   key: 'licenseUrl',
    //   label: 'Giấy phép',
    //   render: (value: unknown): React.JSX.Element => {
    //     const apiBase = import.meta.env.VITE_API_URL as string;
    //     const origin = apiBase.replace(/\/api$/, '');

    //     const toFullUrl = (url: string): string =>
    //       url.startsWith('http://') || url.startsWith('https://')
    //         ? url
    //         : `${origin}${url}`;

    //     const urls: string[] = (() => {
    //       if (Array.isArray(value)) return value as string[];
    //       if (typeof value === 'string') {
    //         try {
    //           const parsed: unknown = JSON.parse(value);
    //           if (Array.isArray(parsed)) return parsed as string[];
    //         } catch {
    //           // plain string url
    //         }
    //         return [value];
    //       }
    //       return [];
    //     })();

    //     if (urls.length === 0) return <span className="text-gray-400">-</span>;

    //     return (
    //       <div className="flex flex-col gap-1">
    //         {urls.map((url, i) => (
    //           <a
    //             key={i}
    //             href={toFullUrl(url)}
    //             target="_blank"
    //             rel="noopener noreferrer"
    //             className="text-blue-600 hover:text-blue-800 hover:underline"
    //           >
    //             Xem file {urls.length > 1 ? i + 1 : ''}
    //           </a>
    //         ))}
    //       </div>
    //     );
    //   },
    // },
    {
      key: 'createdAt',
      label: 'Ngày tạo',
      render: (value: unknown): string =>
        new Date(value as string).toLocaleString('vi-VN'),
    },
    {
      key: 'updatedAt',
      label: 'Ngày cập nhật',
      render: (value: unknown): string =>
        new Date(value as string).toLocaleString('vi-VN'),
    },
  ];

  const actions = [
    {
      label: (
        <Tooltip title="Xem chi tiết">
          <IconButton size="small" color="primary">
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
      onClick: (row: Record<string, unknown>): void => {
        handleOpenDetailsModal(row);
      },
    },
    {
      label: (
        <Tooltip title="Xem giấy phép">
          <IconButton size="small" color="primary">
            <AssignmentIndIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
      onClick: (row: Record<string, unknown>): void => {
        handleOpenLicenseModal(row);
      },
    },
    {
      label: (
        <Tooltip title="Duyệt">
          <IconButton size="small" color="success">
            <CheckCircleIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
      onClick: (row: Record<string, unknown>): void => {
        void handleVerify(row);
      },
    },
    {
      label: (
        <Tooltip title="Từ chối">
          <IconButton size="small" color="error">
            <CancelIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
      onClick: (row: Record<string, unknown>): void => {
        handleOpenRejectModal(row);
      },
    },
  ];

  return (
    <div className="font-[var(--font-nunito)]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-bold text-[var(--color-table-text-primary)]">
            Xác minh người bán
          </h1>
          <p className="text-sm text-[var(--color-table-text-secondary)]">
            Quản lý và xử lý các yêu cầu đăng ký chi nhánh
          </p>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={pendingRegistrations as unknown as Record<string, unknown>[]}
        loading={status === 'pending'}
        rowKey="branchRegisterRequestId"
        actions={actions}
        emptyMessage="Chưa có yêu cầu xác minh nào"
        loadingMessage="Đang tải danh sách..."
      />

      {/* Pagination */}
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

      {/* Details Modal */}
      <VendorRegistrationDetails
        isOpen={detailsModalOpen}
        onClose={handleCloseDetailsModal}
        registration={selectedRegistration}
      />

      {/* License Modal */}
      <VendorLicenseDetails
        isOpen={licenseModalOpen}
        onClose={handleCloseLicenseModal}
        registration={selectedRegistration}
      />

      {/* Reject Modal */}
      <RejectModal
        isOpen={rejectModalOpen}
        onClose={handleCloseRejectModal}
        onConfirm={handleConfirmReject}
      />
    </div>
  );
}
