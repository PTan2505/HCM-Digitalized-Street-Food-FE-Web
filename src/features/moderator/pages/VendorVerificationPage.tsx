import BranchImagesDetails from '@features/moderator/components/BranchImagesDetails';
import Pagination from '@features/moderator/components/Pagination';
import PendingTypeFilterSection from '@features/moderator/components/PendingTypeFilterSection';
import RejectModal from '@features/moderator/components/RejectModal';
import Table from '@features/moderator/components/Table';
import VendorLicenseDetails from '@features/moderator/components/VendorLicenseDetails';
import VendorRegistrationDetails from '@features/moderator/components/VendorRegistrationDetails';
import useBranch from '@features/moderator/hooks/useBranch';
import type {
  BranchRegisterRequest,
  PendingRegistrationType,
} from '@features/moderator/types/branch';
import { useAppSelector } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ImageIcon from '@mui/icons-material/Image';
import VisibilityIcon from '@mui/icons-material/Visibility';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import {
  selectBranchStatus,
  selectPendingRegistrations,
  selectPendingRegistrationsPagination,
} from '@slices/branch';
import React, { useCallback, useEffect, useState } from 'react';

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
  const [pendingType, setPendingType] = useState<PendingRegistrationType>(1);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [licenseModalOpen, setLicenseModalOpen] = useState(false);
  const [imagesModalOpen, setImagesModalOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] =
    useState<BranchRegisterRequest | null>(null);
  const [vendorDetails, setVendorDetails] = useState<
    Record<
      number,
      {
        name: string;
        vendorOwnerName?: string;
        vendorOwner: {
          firstName: string;
          lastName: string;
          email: string;
          phoneNumber: string;
          avatarUrl: string | null;
        };
      }
    >
  >({});

  useEffect(() => {
    void onGetPendingRegistrations({ pageNumber, pageSize, type: pendingType });
  }, [onGetPendingRegistrations, pageNumber, pageSize, pendingType]);

  useEffect(() => {
    const uniqueVendorIds = [
      ...new Set(pendingRegistrations.map((r) => r.branch.vendorId)),
    ];
    const missing = uniqueVendorIds.filter((id) => !(id in vendorDetails));
    if (missing.length === 0) return;

    void Promise.all(
      missing.map(async (id) => {
        try {
          const vendor = await axiosApi.vendorAdminApi.getVendorDetail(id);
          return {
            id,
            name: vendor.name,
            vendorOwner: vendor.vendorOwner,
            vendorOwnerName: vendor.vendorOwnerName,
          };
        } catch {
          return {
            id,
            name: '-',
            vendorOwnerName: '-',
            vendorOwner: {
              firstName: '-',
              lastName: '',
              email: '-',
              phoneNumber: '-',
              avatarUrl: null,
            },
          };
        }
      })
    ).then((results) => {
      setVendorDetails((prev) => {
        const next = { ...prev };
        results.forEach(({ id, name, vendorOwner, vendorOwnerName }) => {
          next[id] = { name, vendorOwner, vendorOwnerName };
        });
        return next;
      });
    });
  }, [pendingRegistrations]);

  const handlePageChange = useCallback((page: number): void => {
    setPageNumber(page);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number): void => {
    setPageSize(newPageSize);
    setPageNumber(1);
  }, []);

  const handlePendingTypeChange = useCallback(
    (type: PendingRegistrationType): void => {
      setPendingType(type);
      setPageNumber(1);
    },
    []
  );

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

  const handleOpenImagesModal = (row: Record<string, unknown>): void => {
    setSelectedRegistration(row as unknown as BranchRegisterRequest);
    setImagesModalOpen(true);
  };

  const handleCloseImagesModal = (): void => {
    setImagesModalOpen(false);
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

  const columns = [
    {
      key: 'branchRequestId',
      label: 'STT',
      render: (
        _: unknown,
        _row: Record<string, unknown>,
        index?: number
      ): number => (index ?? 0) + 1,
    },
    {
      key: 'branch.vendorId',
      label: 'Tên cửa hàng',
      render: (_: unknown, row: Record<string, unknown>): string => {
        const branch = row.branch as { vendorId: number } | undefined;
        if (!branch) return '-';
        return vendorDetails[branch.vendorId]?.name ?? '...';
      },
    },
    {
      key: 'branch.vendorOwnerName',
      label: 'Tên người bán',
      render: (_: unknown, row: Record<string, unknown>): string => {
        const branch = row.branch as { vendorId: number } | undefined;
        if (!branch) return '-';
        // const owner = vendorDetails[branch.vendorId]?.vendorOwner;
        // if (!owner) return '...';
        // return `${owner.firstName} ${owner.lastName}`.trim();
        return vendorDetails[branch.vendorId]?.vendorOwnerName ?? '...';
      },
    },
    {
      key: 'branch.name',
      label: 'Tên chi nhánh',
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
    // {
    //   key: 'updatedAt',
    //   label: 'Ngày cập nhật',
    //   render: (value: unknown): string =>
    //     new Date(value as string).toLocaleString('vi-VN'),
    // },
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
      show: (row: Record<string, unknown>): boolean => {
        const licenseUrl = row.licenseUrl;
        if (!licenseUrl) return false;
        if (typeof licenseUrl === 'string') return licenseUrl.length > 0;
        if (Array.isArray(licenseUrl)) return licenseUrl.length > 0;
        return false;
      },
    },
    {
      label: (
        <Tooltip title="Xem hình ảnh">
          <IconButton size="small" color="primary">
            <ImageIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
      onClick: (row: Record<string, unknown>): void => {
        handleOpenImagesModal(row);
      },
      show: (row: Record<string, unknown>): boolean => {
        const branchImages = row?.branch as Record<string, unknown> | undefined;
        return (
          Array.isArray(branchImages?.branchImages) &&
          branchImages.branchImages.length > 0
        );
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
      <PendingTypeFilterSection
        value={pendingType}
        onFilterChange={handlePendingTypeChange}
      />

      {/* Table */}
      <Table
        columns={columns}
        data={pendingRegistrations as unknown as Record<string, unknown>[]}
        loading={status === 'pending'}
        rowKey="branchRequestId"
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
        vendorDetail={
          selectedRegistration
            ? (vendorDetails[selectedRegistration.branch.vendorId] ?? null)
            : null
        }
      />

      {/* License Modal */}
      <VendorLicenseDetails
        isOpen={licenseModalOpen}
        onClose={handleCloseLicenseModal}
        registration={selectedRegistration}
      />

      {/* Images Modal */}
      <BranchImagesDetails
        isOpen={imagesModalOpen}
        onClose={handleCloseImagesModal}
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
