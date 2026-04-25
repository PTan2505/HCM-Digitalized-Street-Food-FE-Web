import type { VoucherCreate } from '@custom-types/voucher';
import JoinableSystemCampaignModal from '@features/vendor/components/JoinableSystemCampaignModal';
import Pagination from '@features/vendor/components/Pagination';
import Table from '@features/vendor/components/Table';
import VendorCampaignBranchModal from '@features/vendor/components/VendorCampaignBranchModal';
import VendorCampaignDetailModal from '@features/vendor/components/VendorCampaignDetailModal';
import VendorCampaignFormModal from '@features/vendor/components/VendorCampaignFormModal';
import VendorCampaignVoucherModal from '@features/vendor/components/VendorCampaignVoucherModal';
import useVendorCampaign from '@features/vendor/hooks/useVendorCampaign';
import useVoucher from '@features/vendor/hooks/useVoucher';
import type { VendorCampaign } from '@features/vendor/types/campaign';
import type { Branch } from '@features/vendor/types/vendor';
import { getCampaignManagementTourSteps } from '@features/vendor/utils/campaignManagementTourSteps';
import type { VendorCampaignFormData } from '@features/vendor/utils/campaignSchema';
import { useAppSelector } from '@hooks/reduxHooks';
import {
  Add as AddIcon,
  Edit as EditIcon,
  GroupAdd as GroupAddIcon,
  HelpOutline as HelpOutlineIcon,
  Storefront as StorefrontIcon,
  Visibility as VisibilityIcon,
  ConfirmationNumber as VoucherIcon,
} from '@mui/icons-material';
import { Box, Button, Tooltip } from '@mui/material';
import {
  selectCampaignStatus,
  selectVendorCampaigns,
  selectVendorCampaignTotalCount,
} from '@slices/campaign';
import { selectMyVendor } from '@slices/vendor';
import type { JSX, MouseEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  EVENTS,
  Joyride,
  STATUS,
  type Controls,
  type EventData,
} from 'react-joyride';

const formatVNDatetime = (isoStr: string | null): string => {
  if (!isoStr) return '-';
  const date = new Date(isoStr);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function VendorCampaignPage(): JSX.Element {
  const campaigns = useAppSelector(selectVendorCampaigns);
  const myVendor = useAppSelector(selectMyVendor);
  const status = useAppSelector(selectCampaignStatus);
  const totalCount = useAppSelector(selectVendorCampaignTotalCount);
  const {
    onGetVendorCampaigns,
    onCreateVendorCampaign,
    onGetCampaignDetail,
    onUpdateVendorCampaign,
    onPostCampaignImage,
    onDeleteCampaignImage,
  } = useVendorCampaign();
  const { onCreateVoucher } = useVoucher();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [openModal, setOpenModal] = useState(false);
  const [openVoucherModal, setOpenVoucherModal] = useState(false);
  const [openBranchModal, setOpenBranchModal] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isJoinableModalOpen, setIsJoinableModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<VendorCampaign | null>(
    null
  );
  const [selectedCampaign, setSelectedCampaign] =
    useState<VendorCampaign | null>(null);
  const [detailCampaign, setDetailCampaign] = useState<VendorCampaign | null>(
    null
  );
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [tourInstanceKey, setTourInstanceKey] = useState(0);

  const branchOptions = useMemo<Branch[]>(() => {
    return myVendor?.branches ?? [];
  }, [myVendor?.branches]);

  const fetchCampaigns = useCallback(async (): Promise<void> => {
    try {
      await onGetVendorCampaigns(page, pageSize);
    } catch (err) {
      console.error('Failed to fetch vendor campaigns', err);
    }
  }, [onGetVendorCampaigns, page, pageSize]);

  useEffect(() => {
    void fetchCampaigns();
  }, [fetchCampaigns]);

  const handleOpenModal = (campaign?: VendorCampaign): void => {
    // if (campaign?.isActive) {
    //   return;
    // }

    setEditingCampaign(campaign ?? null);
    setOpenModal(true);
  };

  const handleCloseModal = (): void => {
    setOpenModal(false);
    setEditingCampaign(null);
  };

  const handleOpenDetailModal = async (
    campaign: VendorCampaign
  ): Promise<void> => {
    setOpenDetailModal(true);
    setDetailCampaign(campaign);
    setIsDetailLoading(true);

    try {
      const campaignDetail = await onGetCampaignDetail(campaign.campaignId);
      setDetailCampaign(campaignDetail);
    } catch (err) {
      console.error('Failed to fetch campaign detail', err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  // const storeCampaigns = campaigns.filter(
  //   (campaign) => !campaign.isSystemCampaign
  // );

  const storeCampaigns = campaigns;

  const createImageFormData = (file: File): FormData => {
    const formData = new FormData();
    formData.append('image', file);
    return formData;
  };

  const handleSubmit = async (
    data: VendorCampaignFormData,
    imageFile: File | null,
    isImageRemoved?: boolean,
    vouchers?: VoucherCreate[]
  ): Promise<void> => {
    try {
      // if (editingCampaign?.isActive) {
      //   return;
      // }

      const payload = {
        name: data.name,
        description: data.description ?? null,
        targetSegment: data.targetSegment ?? null,
        startDate: data.startDate,
        endDate: data.endDate,
        branchIds: data.branchIds,
      };

      if (editingCampaign) {
        const updatedCampaign = await onUpdateVendorCampaign(
          editingCampaign.campaignId,
          payload
        );
        if (isImageRemoved && !imageFile) {
          await onDeleteCampaignImage(updatedCampaign.campaignId);
        }
        if (imageFile) {
          await onPostCampaignImage(
            updatedCampaign.campaignId,
            createImageFormData(imageFile)
          );
        }
      } else {
        const createdCampaign = await onCreateVendorCampaign(payload);
        if (imageFile) {
          await onPostCampaignImage(
            createdCampaign.campaignId,
            createImageFormData(imageFile)
          );
        }

        if (vouchers && vouchers.length > 0) {
          const voucherPayloads = vouchers.map((voucher) => ({
            ...voucher,
            campaignId: createdCampaign.campaignId,
          }));
          await onCreateVoucher(voucherPayloads);
        }
      }
      handleCloseModal();
    } catch (err) {
      console.error('Failed to save vendor campaign', err);
    }
  };

  const startCampaignTour = (): void => {
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
    return getCampaignManagementTourSteps({
      hasRows: storeCampaigns.length > 0,
    });
  }, [storeCampaigns.length]);

  const columns = [
    // {
    //   key: 'campaignId',
    //   label: 'ID',
    //   style: { width: '60px' },
    // },
    {
      key: 'name',
      label: 'Tên chiến dịch',
      render: (value: unknown): JSX.Element => (
        <Box className="font-semibold text-[var(--color-table-text-primary)]">
          {typeof value === 'string' ? value : String(value)}
        </Box>
      ),
    },
    {
      key: 'creator',
      label: 'Nguồn tạo',
      render: (_: unknown, row: VendorCampaign): JSX.Element => {
        if (!row.createdByVendorId) {
          return (
            <span className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700 shadow-sm">
              Từ hệ thống
            </span>
          );
        }

        return (
          <span className="inline-flex items-center justify-center rounded-full border border-purple-200 bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-700 shadow-sm">
            Từ vendor
          </span>
        );
      },
    },
    {
      key: 'startDate',
      label: 'Thời gian diễn ra',
      render: (_: unknown, row: VendorCampaign): JSX.Element => (
        <Box className="text-sm text-[var(--color-table-text-secondary)]">
          <div>Từ: {formatVNDatetime(row.startDate)}</div>
          <div>Đến: {formatVNDatetime(row.endDate)}</div>
        </Box>
      ),
    },
    // {
    //   key: 'targetSegment',
    //   label: 'Phân khúc',
    //   render: (value: unknown): JSX.Element => (
    //     <Box className="text-table-text-primary">
    //       {typeof value === 'string' && value.trim().length > 0 ? value : '-'}
    //     </Box>
    //   ),
    // },
    // {
    //   key: 'isActive',
    //   label: 'Hoạt động',
    //   render: (value: unknown): JSX.Element => (
    //     <StatusBadge
    //       label={value === true ? 'Đang hoạt động' : 'Tạm ngưng'}
    //       type={value === true ? 'success' : 'error'}
    //     />
    //   ),
    // },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (_: unknown, row: VendorCampaign): JSX.Element => {
        if (row.isSystemCampaign) {
          // return <span className="text-xs text-gray-400">-</span>;
          return (
            <Box className="flex items-center gap-2">
              <Tooltip title="Xem chi tiết" arrow>
                <Button
                  size="small"
                  color="info"
                  variant="outlined"
                  onClick={(event: MouseEvent<HTMLButtonElement>) => {
                    event.stopPropagation();
                    void handleOpenDetailModal(row);
                  }}
                >
                  <VisibilityIcon fontSize="small" />
                </Button>
              </Tooltip>
              <Tooltip title="Xem chi nhánh đã tham gia" arrow>
                <Button
                  size="small"
                  color="info"
                  variant="outlined"
                  onClick={(event: MouseEvent<HTMLButtonElement>) => {
                    event.stopPropagation();
                    setSelectedCampaign(row);
                    setOpenBranchModal(true);
                  }}
                >
                  <StorefrontIcon fontSize="small" />
                </Button>
              </Tooltip>
            </Box>
          );
        }

        // const isLocked = isEnded;

        return (
          <Box className="flex items-center gap-2">
            <Tooltip title="Xem chi tiết" arrow>
              <Button
                size="small"
                color="info"
                variant="outlined"
                onClick={(event: MouseEvent<HTMLButtonElement>) => {
                  event.stopPropagation();
                  void handleOpenDetailModal(row);
                }}
              >
                <VisibilityIcon fontSize="small" />
              </Button>
            </Tooltip>
            <Tooltip title="Quản lý chi nhánh" arrow>
              <Button
                size="small"
                color="info"
                variant="outlined"
                onClick={(event: MouseEvent<HTMLButtonElement>) => {
                  event.stopPropagation();
                  setSelectedCampaign(row);
                  setOpenBranchModal(true);
                }}
              >
                <StorefrontIcon fontSize="small" />
              </Button>
            </Tooltip>
            <Tooltip title="Quản lý voucher" arrow>
              <Button
                size="small"
                color="warning"
                variant="outlined"
                onClick={(event: MouseEvent<HTMLButtonElement>) => {
                  event.stopPropagation();
                  setSelectedCampaign(row);
                  setOpenVoucherModal(true);
                }}
              >
                <VoucherIcon fontSize="small" />
              </Button>
            </Tooltip>
            <Tooltip title="Chỉnh sửa chiến dịch" arrow>
              <Button
                size="small"
                color="primary"
                variant="outlined"
                onClick={(event: MouseEvent<HTMLButtonElement>) => {
                  event.stopPropagation();
                  handleOpenModal(row);
                }}
              >
                <EditIcon fontSize="small" />
              </Button>
            </Tooltip>

            {/* {!isLocked ? (
              <>
                <Tooltip title="Quản lý chi nhánh" arrow>
                  <Button
                    size="small"
                    color="info"
                    variant="outlined"
                    onClick={(event: MouseEvent<HTMLButtonElement>) => {
                      event.stopPropagation();
                      setSelectedCampaign(row);
                      setOpenBranchModal(true);
                    }}
                  >
                    <StorefrontIcon fontSize="small" />
                  </Button>
                </Tooltip>
                <Tooltip title="Quản lý voucher" arrow>
                  <Button
                    size="small"
                    color="warning"
                    variant="outlined"
                    onClick={(event: MouseEvent<HTMLButtonElement>) => {
                      event.stopPropagation();
                      setSelectedCampaign(row);
                      setOpenVoucherModal(true);
                    }}
                  >
                    <VoucherIcon fontSize="small" />
                  </Button>
                </Tooltip>
                <Tooltip title="Chỉnh sửa chiến dịch" arrow>
                  <Button
                    size="small"
                    color="primary"
                    variant="outlined"
                    onClick={(event: MouseEvent<HTMLButtonElement>) => {
                      event.stopPropagation();
                      handleOpenModal(row);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </Button>
                </Tooltip>
              </>
            ) : (
              <span className="text-xs text-gray-400 italic">
                {row.isActive ? 'Đang hoạt động' : 'Đã kết thúc'}
              </span>
            )} */}
          </Box>
        );
      },
    },
  ];

  return (
    <div className="flex h-full flex-col font-[var(--font-nunito)]">
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
        data-tour="campaign-page-header"
      >
        <div>
          <div className="mb-1 flex items-start gap-2">
            <h1 className="text-table-text-primary text-3xl font-bold">
              Quản lý chiến dịch
            </h1>
            <button
              type="button"
              onClick={startCampaignTour}
              aria-label="Mở hướng dẫn quản lý chiến dịch"
              title="Hướng dẫn"
              className="text-primary-700 hover:text-primary-800 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
            >
              <HelpOutlineIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
          <p className="text-sm text-[var(--color-table-text-secondary)]">
            Quản lý các chương trình khuyến mãi và chiến dịch của quán
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenModal()}
            data-tour="campaign-create-button"
            className="flex items-center gap-2 rounded-lg bg-[var(--color-primary-600)] px-4 py-2 font-semibold text-white transition-colors hover:bg-[var(--color-primary-700)]"
          >
            <AddIcon fontSize="small" />
            Thêm chiến dịch
          </button>
          <button
            onClick={() => {
              setIsJoinableModalOpen(true);
            }}
            data-tour="campaign-join-button"
            className="flex items-center gap-2 rounded-lg border border-[var(--color-primary-600)] bg-white px-4 py-2 font-semibold text-[var(--color-primary-700)] transition-colors hover:bg-[var(--color-primary-50)]"
          >
            <GroupAddIcon fontSize="small" />
            Tham gia chiến dịch hệ thống
          </button>
        </div>
      </div>

      {/* Table Content */}
      <Box sx={{ flex: 1, minHeight: 0 }} data-tour="campaign-table-wrapper">
        <Table
          columns={columns}
          maxHeight="none"
          data={storeCampaigns}
          rowKey="campaignId"
          loading={status === 'pending'}
          emptyMessage="Chưa có chiến dịch cửa hàng nào"
          tourId="vendor-campaign"
        />
      </Box>

      {/* Pagination */}
      <div data-tour="campaign-pagination">
        <Pagination
          currentPage={page}
          totalPages={Math.ceil((totalCount ?? 0) / pageSize)}
          totalCount={totalCount ?? 0}
          pageSize={pageSize}
          hasPrevious={page > 1}
          hasNext={page < Math.ceil((totalCount ?? 0) / pageSize)}
          onPageChange={setPage}
          onPageSizeChange={(newPageSize) => {
            setPageSize(newPageSize);
            setPage(1);
          }}
        />
      </div>

      {/* Form Modal */}
      <VendorCampaignFormModal
        isOpen={openModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        campaign={editingCampaign}
        branches={branchOptions}
        status={status}
      />

      <VendorCampaignVoucherModal
        isOpen={openVoucherModal}
        onClose={() => {
          setOpenVoucherModal(false);
          setSelectedCampaign(null);
        }}
        campaign={selectedCampaign}
      />

      <VendorCampaignBranchModal
        isOpen={openBranchModal}
        onClose={() => {
          setOpenBranchModal(false);
          setSelectedCampaign(null);
        }}
        campaign={selectedCampaign}
        branches={branchOptions}
      />

      <JoinableSystemCampaignModal
        isOpen={isJoinableModalOpen}
        onClose={() => {
          setIsJoinableModalOpen(false);
          void fetchCampaigns();
        }}
        mode="detail"
        vendorBranchIds={branchOptions.map((branch) => branch.branchId)}
        vendorBranches={branchOptions}
      />

      <VendorCampaignDetailModal
        isOpen={openDetailModal}
        onClose={() => setOpenDetailModal(false)}
        campaign={detailCampaign}
        isLoading={isDetailLoading}
      />
    </div>
  );
}
