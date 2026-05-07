import BranchImagesDetails from '@features/moderator/components/BranchImagesDetailsModal';
import BranchLocationModal from '@features/moderator/components/BranchLocationModal';
import Pagination from '@features/moderator/components/Pagination';
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

type VendorVerificationPageProps = {
  pendingType: PendingRegistrationType;
  pageTitle?: string;
  hiddenColumnKeys?: string[];
};

const TITLE_BY_PENDING_TYPE: Record<PendingRegistrationType, string> = {
  0: 'Xác minh - Quán reviewer chia sẻ',
  1: 'Xác minh - Quán ăn chờ duyệt',
  2: 'Xác minh - Yêu cầu sở hữu quán',
};

const DETAILS_MODAL_TITLE_BY_PENDING_TYPE: Record<
  PendingRegistrationType,
  string
> = {
  0: 'Chi tiết quán reviewer chia sẻ',
  1: 'Chi tiết đơn đăng ký quán ăn',
  2: 'Chi tiết yêu cầu sở hữu quán',
};

const toDisplayText = (value: unknown): string => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    return trimmedValue === '' ? '-' : trimmedValue;
  }
  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return `${value}`;
  }
  return '-';
};

const formatDisplayDateTime = (value: unknown): string => {
  if (typeof value !== 'string' || value.trim() === '') return '-';
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return '-';
  return parsedDate.toLocaleString('vi-VN');
};

export default function VendorVerificationPage({
  pendingType,
  pageTitle,
  hiddenColumnKeys = [],
}: VendorVerificationPageProps): React.JSX.Element {
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
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [licenseModalOpen, setLicenseModalOpen] = useState(false);
  const [imagesModalOpen, setImagesModalOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [uploadLicenseModalOpen, setUploadLicenseModalOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] =
    useState<BranchRegisterRequest | null>(null);
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

  const columns = [
    {
      key: 'branch.name',
      label: pendingType === 0 ? 'Tên quán' : 'Tên chi nhánh',
      className: 'font-medium',
      render: (value: unknown): string => toDisplayText(value),
    },
    {
      key: 'branch.vendorId',
      label: 'Tên cửa hàng',
      render: (_: unknown, row: Record<string, unknown>): string => {
        const branch = row.branch as { vendorId: number } | undefined;
        if (!branch) return '-';
        return toDisplayText(vendorDetails[branch.vendorId]?.name);
      },
    },
    {
      key: 'branch.addressDetail',
      label: 'Địa chỉ',
      render: (_: unknown, row: Record<string, unknown>): string => {
        const branch = row.branch as { addressDetail: string } | undefined;
        return toDisplayText(branch?.addressDetail);
      },
    },
    {
      key: 'branch.ward',
      label: 'Phường/Xã',
      render: (_: unknown, row: Record<string, unknown>): string => {
        const branch = row.branch as { ward: string } | undefined;
        return toDisplayText(branch?.ward);
      },
    },
    {
      key: 'branch.vendorOwnerName',
      label: 'Tên người bán',
      render: (_: unknown, row: Record<string, unknown>): string => {
        const branch = row.branch as { vendorId: number } | undefined;
        if (!branch) return '-';
        return toDisplayText(vendorDetails[branch.vendorId]?.vendorOwnerName);
      },
    },
    {
      key: 'branch.phoneNumber',
      label: 'Số điện thoại',
      render: (value: unknown): string => toDisplayText(value),
    },
    ...(pendingType === 0
      ? [
          {
            key: 'branch.userShareName',
            label: 'Tên người chia sẻ',
            render: (_: unknown, row: Record<string, unknown>): string => {
              const registration = row as unknown as BranchRegisterRequest;
              return toDisplayText(
                registration.branch.userShareName ?? registration.userShareName
              );
            },
          },
          {
            key: 'branch.userSharePhone',
            label: 'SĐT người chia sẻ',
            render: (_: unknown, row: Record<string, unknown>): string => {
              const registration = row as unknown as BranchRegisterRequest;
              return toDisplayText(
                registration.branch.userSharePhone ??
                  registration.userSharePhone
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
              return toDisplayText(
                registration.branch.vendorUserName ??
                  registration.vendorUserName
              );
            },
          },
          {
            key: 'branch.vendorUserPhone',
            label: 'SĐT người yêu cầu',
            render: (_: unknown, row: Record<string, unknown>): string => {
              const registration = row as unknown as BranchRegisterRequest;
              return toDisplayText(
                registration.branch.vendorUserPhone ??
                  registration.vendorUserPhone
              );
            },
          },
        ]
      : []),
    {
      key: 'createdAt',
      label: 'Ngày tạo',
      render: (value: unknown): string => formatDisplayDateTime(value),
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ].filter((column) => !hiddenColumnKeys.includes(column.key)) as any[];

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

  return (
    <div className="font-(--font-nunito)">
      <h1 className="text-table-text-primary mb-6 text-2xl font-bold">
        {pageTitle ?? TITLE_BY_PENDING_TYPE[pendingType]}
      </h1>

      {/* Table */}
      <Table
        columns={columns}
        data={pendingRegistrations as unknown as Record<string, unknown>[]}
        loading={status === 'pending'}
        rowKey="branchRequestId"
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
