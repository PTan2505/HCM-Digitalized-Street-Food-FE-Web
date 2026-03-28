import { useState, useEffect, useCallback } from 'react';
import type { JSX, MouseEvent } from 'react';
import { Box, Button } from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  ConfirmationNumber as VoucherIcon,
} from '@mui/icons-material';
import Table from '@features/vendor/components/Table';
import Pagination from '@features/vendor/components/Pagination';
import VendorCampaignFormModal from '@features/vendor/components/VendorCampaignFormModal';
import VendorCampaignVoucherModal from '@features/vendor/components/VendorCampaignVoucherModal';
import type { VendorCampaign } from '@features/vendor/types/campaign';
import useVendorCampaign from '@features/vendor/hooks/useVendorCampaign';
import useVendor from '@features/vendor/hooks/useVendor';
import { useAppSelector } from '@hooks/reduxHooks';
import {
  selectVendorCampaigns,
  selectCampaignStatus,
  selectVendorCampaignTotalCount,
} from '@slices/campaign';
import { selectMyVendor } from '@slices/vendor';
import type { VendorCampaignFormData } from '@features/vendor/utils/campaignSchema';
import type { Branch } from '@features/vendor/types/vendor';

const PAGE_SIZE = 10;

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

export default function VendorCampaignPage(): JSX.Element {
  const campaigns = useAppSelector(selectVendorCampaigns);
  const myVendor = useAppSelector(selectMyVendor);
  const status = useAppSelector(selectCampaignStatus);
  const totalCount = useAppSelector(selectVendorCampaignTotalCount);
  const {
    onGetVendorCampaigns,
    onCreateVendorCampaign,
    onCreateBranchCampaign,
    onUpdateVendorCampaign,
    onPostCampaignImage,
  } = useVendorCampaign();
  const { onGetBranchesByVendor } = useVendor();

  const [page, setPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [openVoucherModal, setOpenVoucherModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<VendorCampaign | null>(
    null
  );
  const [selectedCampaign, setSelectedCampaign] =
    useState<VendorCampaign | null>(null);
  const [branchOptions, setBranchOptions] = useState<Branch[]>([]);

  const fetchCampaigns = useCallback(async (): Promise<void> => {
    try {
      await onGetVendorCampaigns(page, PAGE_SIZE);
    } catch (err) {
      console.error('Failed to fetch vendor campaigns', err);
    }
  }, [onGetVendorCampaigns, page]);

  useEffect(() => {
    void fetchCampaigns();
  }, [fetchCampaigns]);

  const fetchBranchOptions = useCallback(async (): Promise<void> => {
    if (!myVendor?.vendorId) {
      setBranchOptions([]);
      return;
    }

    try {
      const branches = await onGetBranchesByVendor(myVendor.vendorId);
      setBranchOptions(branches);
    } catch (err) {
      console.error('Failed to fetch vendor branches', err);
      setBranchOptions([]);
    }
  }, [myVendor?.vendorId, onGetBranchesByVendor]);

  useEffect(() => {
    void fetchBranchOptions();
  }, [fetchBranchOptions]);

  const handleOpenModal = (campaign?: VendorCampaign): void => {
    setEditingCampaign(campaign ?? null);
    setOpenModal(true);
  };

  const handleCloseModal = (): void => {
    setOpenModal(false);
    setEditingCampaign(null);
  };

  const storeCampaigns = campaigns.filter(
    (campaign) => !campaign.isSystemCampaign
  );

  const createImageFormData = (file: File): FormData => {
    const formData = new FormData();
    formData.append('image', file);
    return formData;
  };

  const handleSubmit = async (
    data: VendorCampaignFormData,
    imageFile: File | null
  ): Promise<void> => {
    try {
      const payload = {
        name: data.name,
        description: data.description ?? null,
        targetSegment: data.targetSegment ?? null,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: data.isActive,
      };

      if (editingCampaign) {
        const updatedCampaign = await onUpdateVendorCampaign(
          editingCampaign.campaignId,
          payload
        );
        if (imageFile) {
          await onPostCampaignImage(
            updatedCampaign.campaignId,
            createImageFormData(imageFile)
          );
        }
      } else {
        if (data.applyScope === 'VENDOR') {
          const createdCampaign = await onCreateVendorCampaign(payload);
          if (imageFile) {
            await onPostCampaignImage(
              createdCampaign.campaignId,
              createImageFormData(imageFile)
            );
          }
        } else {
          const createdCampaigns = await Promise.all(
            data.branchIds.map((branchId) =>
              onCreateBranchCampaign(branchId, payload)
            )
          );
          if (imageFile) {
            await Promise.all(
              createdCampaigns.map((campaign) =>
                onPostCampaignImage(
                  campaign.campaignId,
                  createImageFormData(imageFile)
                )
              )
            );
          }
          await fetchCampaigns();
        }
      }
      handleCloseModal();
    } catch (err) {
      console.error('Failed to save vendor campaign', err);
    }
  };

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
        if (!row.createdByBranchId && !row.createdByVendorId) {
          return (
            <span className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700 shadow-sm">
              Từ hệ thống
            </span>
          );
        }
        if (row.createdByBranchId) {
          return (
            <span className="inline-flex items-center justify-center rounded-full border border-teal-200 bg-teal-100 px-2.5 py-0.5 text-xs font-bold text-teal-700 shadow-sm">
              Từ chi nhánh
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
    //     <Chip
    //       label={typeof value === 'string' && value ? value : 'Tất cả'}
    //       size="small"
    //       variant="outlined"
    //     />
    //   ),
    // },
    {
      key: 'isActive',
      label: 'Hoạt động',
      render: (value: unknown): JSX.Element => (
        <StatusBadge
          label={value === true ? 'Đang hoạt động' : 'Tạm ngưng'}
          type={value === true ? 'success' : 'error'}
        />
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (_: unknown, row: VendorCampaign): JSX.Element => {
        if (row.isSystemCampaign) {
          return <span className="text-xs text-gray-400">-</span>;
        }

        return (
          <Box className="flex items-center gap-2">
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
          </Box>
        );
      },
    },
  ];

  return (
    <div className="flex h-full flex-col font-[var(--font-nunito)]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-bold text-[var(--color-table-text-primary)]">
            Quản lý chiến dịch
          </h1>
          <p className="text-sm text-[var(--color-table-text-secondary)]">
            Quản lý các chương trình khuyến mãi và chiến dịch của quán
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 rounded-lg bg-[var(--color-primary-600)] px-4 py-2 font-semibold text-white transition-colors hover:bg-[var(--color-primary-700)]"
          >
            <AddIcon fontSize="small" />
            Thêm chiến dịch
          </button>
        </div>
      </div>

      {/* Table Content */}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <Table
          columns={columns}
          maxHeight="none"
          data={storeCampaigns}
          rowKey="campaignId"
          loading={status === 'pending'}
          emptyMessage="Chưa có chiến dịch cửa hàng nào"
        />
      </Box>

      {/* Pagination */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <Pagination
          currentPage={page}
          totalPages={Math.ceil((totalCount ?? 0) / PAGE_SIZE)}
          totalCount={totalCount ?? 0}
          pageSize={PAGE_SIZE}
          hasPrevious={page > 1}
          hasNext={page < Math.ceil((totalCount ?? 0) / PAGE_SIZE)}
          onPageChange={setPage}
        />
      </Box>

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
    </div>
  );
}
