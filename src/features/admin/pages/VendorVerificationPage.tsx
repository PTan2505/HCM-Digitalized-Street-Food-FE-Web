import BranchImagesDetails from '@features/moderator/components/BranchImagesDetailsModal';
import BranchLocationModal from '@features/moderator/components/BranchLocationModal';
import Pagination from '@features/moderator/components/Pagination';
import PendingTypeFilterSection from '@features/moderator/components/PendingTypeFilterSection';
import RejectModal from '@features/moderator/components/RejectModal';
import Table from '@features/moderator/components/Table';
import VendorLicenseDetails from '@features/moderator/components/VendorLicenseDetailsModal';
import LicenseModal from '@features/vendor/components/LicenseModal';
import VendorRegistrationDetails from '@features/moderator/components/VendorRegistrationDetailsModal';
import useBranch from '@features/moderator/hooks/useBranch';
import type {
  BranchRegisterRequest,
  PendingRegistrationType,
} from '@features/moderator/types/branch';
import { useAppSelector, useAppDispatch } from '@hooks/reduxHooks';
import { selectUser } from '@slices/auth';
import { axiosApi } from '@lib/api/apiInstance';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ImageIcon from '@mui/icons-material/Image';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import {
  selectBranchStatus,
  selectPendingRegistrations,
  selectPendingRegistrationsPagination,
  updatePendingRegistrationLicense,
} from '@slices/branch';
import React, { useCallback, useEffect, useState } from 'react';
import {
  type Controls,
  EVENTS,
  Joyride,
  STATUS,
  type EventData,
} from 'react-joyride';
import { HelpOutline as HelpOutlineIcon } from '@mui/icons-material';
import { getVendorVerificationTourSteps } from '@features/admin/utils/vendorVerificationTourSteps';

const HIDDEN_COLUMN_KEYS_BY_PENDING_TYPE: Record<
  PendingRegistrationType,
  string[]
> = {
  0: ['branch.vendorId', 'branch.vendorOwnerName', 'branch.phoneNumber'],
  1: [],
  2: ['branch.vendorId', 'branch.vendorOwnerName', 'branch.phoneNumber'],
};

const DETAILS_MODAL_TITLE_BY_PENDING_TYPE: Record<
  PendingRegistrationType,
  string
> = {
  0: 'Chi tiết quán reviewer chia sẻ',
  1: 'Chi tiết đơn đăng ký quán ăn',
  2: 'Chi tiết yêu cầu sở hữu quán',
};

export default function VendorVerificationPage(): React.JSX.Element {
  const dispatch = useAppDispatch();
  const pendingRegistrations = useAppSelector(selectPendingRegistrations);
  const pagination = useAppSelector(selectPendingRegistrationsPagination);
  const status = useAppSelector(selectBranchStatus);
  const currentUser = useAppSelector(selectUser);
  const {
    onGetPendingRegistrations,
    onVerifyBranchRegistration,
    onRejectBranchRegistration,
  } = useBranch();

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [pendingType, setPendingType] = useState<PendingRegistrationType>(1);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [licenseModalOpen, setLicenseModalOpen] = useState(false);
  const [imagesModalOpen, setImagesModalOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [uploadLicenseModalOpen, setUploadLicenseModalOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] =
    useState<BranchRegisterRequest | null>(null);
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [tourInstanceKey, setTourInstanceKey] = useState(0);
  // Map branchId -> verifiedBy (from claim API response)
  const [claimedRows, setClaimedRows] = useState<Record<number, number>>({});
  // Tracks which rows are currently loading the claim API
  const [claimingRows, setClaimingRows] = useState<Record<number, boolean>>({});
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

  const verifyRegistration = async (
    registration: BranchRegisterRequest
  ): Promise<boolean> => {
    try {
      if (registration.branchId === null) return false;
      await onVerifyBranchRegistration({
        branchId: registration.branchId,
        data: { branchId: registration.branchId },
      });
      return true;
    } catch (error) {
      console.error('Failed to verify:', error);
      return false;
    }
  };

  const handleVerify = async (row: Record<string, unknown>): Promise<void> => {
    const registration = row as unknown as BranchRegisterRequest;
    await verifyRegistration(registration);
  };

  const handleVerifyFromModal = async (
    registration: BranchRegisterRequest
  ): Promise<void> => {
    const isVerified = await verifyRegistration(registration);
    if (isVerified) {
      handleCloseDetailsModal();
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
 
  const handleOpenLocationModal = (row: Record<string, unknown>): void => {
    setSelectedRegistration(row as unknown as BranchRegisterRequest);
    setLocationModalOpen(true);
  };
 
  const handleCloseLocationModal = (): void => {
    setLocationModalOpen(false);
    setSelectedRegistration(null);
  };

  const handleOpenRejectModal = (row: Record<string, unknown>): void => {
    setSelectedRegistration(row as unknown as BranchRegisterRequest);
    setRejectModalOpen(true);
  };

  const handleRejectFromModal = (registration: BranchRegisterRequest): void => {
    setSelectedRegistration(registration);
    setDetailsModalOpen(false);
    setRejectModalOpen(true);
  };

  const handleCloseRejectModal = (): void => {
    setRejectModalOpen(false);
    setSelectedRegistration(null);
  };

  const handleConfirmReject = async (reason: string): Promise<void> => {
    if (!selectedRegistration) return;
    if (selectedRegistration.branchId === null) return;
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

  const handleClaim = async (
    registration: BranchRegisterRequest
  ): Promise<void> => {
    const branchId = registration.branchId;
    if (branchId === null || branchId === undefined) return;
    setClaimingRows((prev) => ({ ...prev, [branchId]: true }));
    try {
      const result = await axiosApi.branchApi.claimBranchRegistration(branchId);
      setClaimedRows((prev) => ({ ...prev, [branchId]: result.verifiedBy }));
      handleCloseLocationModal();
    } catch (error) {
      console.error('Failed to claim branch registration:', error);
    } finally {
      setClaimingRows((prev) => ({ ...prev, [branchId]: false }));
    }
  };

  const handleOpenUploadLicenseModal = (row: Record<string, unknown>): void => {
    setSelectedRegistration(row as unknown as BranchRegisterRequest);
    setUploadLicenseModalOpen(true);
  };

  const handleCloseUploadLicenseModal = (): void => {
    setUploadLicenseModalOpen(false);
    setSelectedRegistration(null);
  };

  const handleUploadLicenseSuccess = (licenseUrls: string[]): void => {
    if (selectedRegistration?.branchId) {
      dispatch(
        updatePendingRegistrationLicense({
          branchId: selectedRegistration.branchId,
          licenseUrls,
        })
      );
    }
    handleCloseUploadLicenseModal();
  };

  const hiddenColumnKeys = HIDDEN_COLUMN_KEYS_BY_PENDING_TYPE[pendingType];

  const columns = [
    {
      key: 'branch.name',
      label: pendingType === 0 ? 'Tên quán' : 'Tên chi nhánh',
      className: 'font-medium',
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
      key: 'branch.addressDetail',
      label: 'Địa chỉ',
      render: (_: unknown, row: Record<string, unknown>): string => {
        const branch = row.branch as { addressDetail: string } | undefined;
        return branch?.addressDetail ?? '-';
      },
    },
    {
      key: 'branch.ward',
      label: 'Phường/Xã',
      render: (_: unknown, row: Record<string, unknown>): string => {
        const branch = row.branch as { ward: string } | undefined;
        return branch?.ward ?? '-';
      },
    },
    {
      key: 'branch.vendorOwnerName',
      label: 'Tên người bán',
      render: (_: unknown, row: Record<string, unknown>): string => {
        const branch = row.branch as { vendorId: number } | undefined;
        if (!branch) return '-';
        return vendorDetails[branch.vendorId]?.vendorOwnerName ?? '...';
      },
    },
    {
      key: 'branch.phoneNumber',
      label: 'Số điện thoại',
    },
    ...(pendingType === 0
      ? [
          {
            key: 'branch.userShareName',
            label: 'Tên người chia sẻ',
            render: (_: unknown, row: Record<string, unknown>): string => {
              const registration = row as unknown as BranchRegisterRequest;
              return (
                registration.branch.userShareName ??
                registration.userShareName ??
                '-'
              );
            },
          },
          {
            key: 'branch.userSharePhone',
            label: 'SĐT người chia sẻ',
            render: (_: unknown, row: Record<string, unknown>): string => {
              const registration = row as unknown as BranchRegisterRequest;
              return (
                registration.branch.userSharePhone ??
                registration.userSharePhone ??
                '-'
              );
            },
          },
        ]
      : []),
    ...(pendingType === 2
      ? [
          {
            key: 'branch.vendorUserName',
            label: 'Tên người yêu cầu sở hữu',
            render: (_: unknown, row: Record<string, unknown>): string => {
              const registration = row as unknown as BranchRegisterRequest;
              return (
                registration.branch.vendorUserName ??
                registration.vendorUserName ??
                '-'
              );
            },
          },
          {
            key: 'branch.vendorUserPhone',
            label: 'SĐT người yêu cầu',
            render: (_: unknown, row: Record<string, unknown>): string => {
              const registration = row as unknown as BranchRegisterRequest;
              return (
                registration.branch.vendorUserPhone ??
                registration.vendorUserPhone ??
                '-'
              );
            },
          },
        ]
      : []),
    {
      key: 'createdAt',
      label: 'Ngày tạo',
      render: (value: unknown): string =>
        new Date(value as string).toLocaleString('vi-VN'),
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ].filter((column) => !hiddenColumnKeys.includes(column.key)) as any[];

  // Append the dynamic action column at the end
  columns.push({
    key: '__actions__',
    label: 'Thao tác',
    render: (
      _value: unknown,
      row: Record<string, unknown>
    ): React.ReactNode => {
      const registration = row as unknown as BranchRegisterRequest;
      const branchId = registration.branchId;
      if (branchId === null || branchId === undefined) return null;

      const apiVerifiedBy =
        registration.verifiedBy ?? registration.branch?.verifiedBy;
      const verifiedBy = claimedRows[branchId] ?? apiVerifiedBy;
      const isClaiming = claimingRows[branchId] ?? false;

      // Not yet claimed – show only "Nhận đơn" button
      if (verifiedBy === undefined || verifiedBy === null) {
        return (
          <span style={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Nhận đơn">
              <span>
                <IconButton
                  size="small"
                  color="warning"
                  disabled={isClaiming}
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleClaim(registration);
                  }}
                >
                  {isClaiming ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <AssignmentIndIcon fontSize="small" />
                  )}
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Xem trên bản đồ">
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenLocationModal(row);
                }}
              >
                <LocationOnIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </span>
        );
      }

      // Get current user ID (API might return userId instead of id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const currentUserId = (currentUser as any)?.userId ?? currentUser?.id;

      // Claimed by someone else
      if (String(verifiedBy) !== String(currentUserId)) {
        return (
          <Chip
            label="Đơn đã được nhận bởi người khác"
            color="default"
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.7rem' }}
          />
        );
      }

      // Claimed by current user – show all original action buttons
      const hasLicense = ((): boolean => {
        const licenseUrl = row.licenseUrl;
        if (!licenseUrl) return false;
        if (typeof licenseUrl === 'string') return licenseUrl.length > 0;
        if (Array.isArray(licenseUrl)) return licenseUrl.length > 0;
        return false;
      })();

      const hasImages = ((): boolean => {
        const branchImages = row?.branch as Record<string, unknown> | undefined;
        return (
          Array.isArray(branchImages?.branchImages) &&
          branchImages.branchImages.length > 0
        );
      })();

      return (
        <span style={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Xem chi tiết">
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDetailsModal(row);
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {hasLicense && (
            <Tooltip title="Xem giấy phép">
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenLicenseModal(row);
                }}
              >
                <AssignmentIndIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {!hasLicense && (pendingType === 1 || pendingType === 2) && (
            <Tooltip title="Cập nhật giấy phép">
              <IconButton
                size="small"
                color="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenUploadLicenseModal(row);
                }}
              >
                <UploadFileIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {hasImages && (
            <Tooltip title="Xem hình ảnh">
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenImagesModal(row);
                }}
              >
                <ImageIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Duyệt">
            <IconButton
              size="small"
              color="success"
              onClick={(e) => {
                e.stopPropagation();
                void handleVerify(row);
              }}
            >
              <CheckCircleIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Từ chối">
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenRejectModal(row);
              }}
            >
              <CancelIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </span>
      );
    },
  });

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

  return (
    <div className="font-(--font-nunito)">
      <Joyride
        key={tourInstanceKey}
        run={isTourRunning}
        steps={getVendorVerificationTourSteps({
          hasRows: pendingRegistrations.length > 0,
        })}
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
        data-tour="admin-vendor-verification-page-header"
      >
        <div>
          <div className="mb-1 flex items-start gap-2">
            <h1 className="text-table-text-primary text-3xl font-bold">
              Xác minh
            </h1>
            <button
              type="button"
              onClick={startTour}
              aria-label="Mở hướng dẫn xác minh người bán"
              title="Hướng dẫn"
              className="text-primary-700 hover:text-primary-800 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
            >
              <HelpOutlineIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
          <p className="text-table-text-secondary text-sm">
            Quản lý và xử lý các yêu cầu đăng ký chi nhánh
          </p>
        </div>
      </div>

      {/* Table */}
      <div data-tour="admin-vendor-verification-filter">
        <PendingTypeFilterSection
          value={pendingType}
          onFilterChange={handlePendingTypeChange}
        />
      </div>

      {/* Table */}
      <div data-tour="admin-vendor-verification-table">
        <Table
          columns={columns}
          data={pendingRegistrations as unknown as Record<string, unknown>[]}
          loading={status === 'pending'}
          rowKey="branchRequestId"
          emptyMessage="Chưa có yêu cầu xác minh nào"
          loadingMessage="Đang tải danh sách..."
        />
      </div>

      {/* Pagination */}
      <div data-tour="admin-vendor-verification-pagination">
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

      {/* Details Modal */}
      <VendorRegistrationDetails
        isOpen={detailsModalOpen}
        onClose={handleCloseDetailsModal}
        registration={selectedRegistration}
        title={DETAILS_MODAL_TITLE_BY_PENDING_TYPE[pendingType]}
        onVerify={handleVerifyFromModal}
        onReject={handleRejectFromModal}
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
 
      {/* Location Modal */}
      <BranchLocationModal
        isOpen={locationModalOpen}
        onClose={handleCloseLocationModal}
        registration={selectedRegistration}
        onClaim={handleClaim}
        isClaiming={
          selectedRegistration?.branchId
            ? claimingRows[selectedRegistration.branchId]
            : false
        }
      />

      {/* Reject Modal */}
      <RejectModal
        isOpen={rejectModalOpen}
        onClose={handleCloseRejectModal}
        onConfirm={handleConfirmReject}
      />

      {/* Upload License Modal */}
      <LicenseModal
        isOpen={uploadLicenseModalOpen}
        onClose={handleCloseUploadLicenseModal}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        branch={selectedRegistration?.branch as any}
        mode="update"
        onUploadSuccess={handleUploadLicenseSuccess}
      />
    </div>
  );
}
