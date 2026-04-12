import { useState, useEffect, useCallback, useRef } from 'react';
import type { JSX } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  ConfirmationNumber as VoucherIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  Storefront as StorefrontIcon,
} from '@mui/icons-material';
import Table from '@features/admin/components/Table';
import Pagination from '@features/admin/components/Pagination';
import CamPaignFormModal from '@features/admin/components/CamPaignFormModal';
import CampaignVoucherModal from '@features/admin/components/CampaignVoucherModal';
import CampaignDetailModal from '@features/admin/components/CampaignDetailModal';
import VoucherFormModal from '@features/admin/components/VoucherFormModal';
import CampaignBranchModal from '@features/admin/components/CampaignBranchModal';
import type { Campaign } from '@features/admin/types/campaign';
import useCampaign from '@features/admin/hooks/useCampaign';
import useVoucher from '@features/admin/hooks/useVoucher';
import { useAppSelector } from '@hooks/reduxHooks';
import {
  selectCampaigns,
  selectCampaignStatus,
  selectCampaignTotalCount,
} from '@slices/campaign';
import { selectVoucherStatus } from '@slices/voucher';
import type { CampaignFormData } from '@features/admin/utils/campaignSchema';
import type { VoucherCreate } from '@custom-types/voucher';

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

const hasRegistrationStarted = (
  registrationStartDate: string | null
): boolean => {
  if (!registrationStartDate) return false;
  const startTime = new Date(registrationStartDate).getTime();
  if (Number.isNaN(startTime)) return false;
  return startTime <= Date.now();
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

/**
 * "Post-create" flow states:
 *  idle          → no post-create flow running
 *  prompt        → asking "Tạo voucher ngay?" dialog
 *  creating      → VoucherFormModal open
 *  done_one      → voucher created, asking "Tạo thêm / Thôi"
 */
type PostCreateStep = 'idle' | 'prompt' | 'creating' | 'done_one';

type CampaignStatusInfo = {
  label: string;
  type: 'success' | 'error' | 'warning' | 'default' | 'info';
};

const getCampaignStatus = (row: Campaign): CampaignStatusInfo => {
  const now = Date.now();
  const regStart = row.registrationStartDate
    ? new Date(row.registrationStartDate).getTime()
    : null;
  const regEnd = row.registrationEndDate
    ? new Date(row.registrationEndDate).getTime()
    : null;
  const start = new Date(row.startDate).getTime();
  const end = new Date(row.endDate).getTime();

  if (row.isActive && !row.isRegisterable) {
    // Đang trong thời gian chiến dịch hoạt động
    return { label: 'Đang hoạt động', type: 'success' };
  }
  if (row.isRegisterable && !row.isActive) {
    // Đang trong thời gian mở đăng ký
    return { label: 'Đang mở đăng ký', type: 'info' };
  }
  if (!row.isActive && !row.isRegisterable) {
    if (now > end) {
      return { label: 'Đã kết thúc', type: 'error' };
    }
    if (regEnd !== null && now > regEnd && now < start) {
      // Đã qua đăng ký nhưng chưa bắt đầu
      return { label: 'Chưa bắt đầu', type: 'warning' };
    }
    if (regStart !== null && now < regStart) {
      // Chưa tới thời gian đăng ký
      return { label: 'Chưa đến lúc đăng ký', type: 'default' };
    }
    // Fallback: chưa bắt đầu
    return { label: 'Chưa bắt đầu', type: 'warning' };
  }
  return { label: 'Không xác định', type: 'default' };
};

export default function CampaignPage(): JSX.Element {
  const campaigns = useAppSelector(selectCampaigns);
  const status = useAppSelector(selectCampaignStatus);
  const voucherStatus = useAppSelector(selectVoucherStatus);
  const totalCount = useAppSelector(selectCampaignTotalCount);
  const {
    onGetCampaigns,
    onCreateCampaign,
    onGetCampaignDetail,
    onUpdateCampaign,
    onPostCampaignImage,
    onDeleteCampaignImage,
  } = useCampaign();
  const { onCreateVoucher } = useVoucher();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [openModal, setOpenModal] = useState(false);
  const [openVoucherModal, setOpenVoucherModal] = useState(false);
  const [openBranchModal, setOpenBranchModal] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [detailCampaign, setDetailCampaign] = useState<Campaign | null>(null);

  // Post-create flow
  const [postCreateStep, setPostCreateStep] = useState<PostCreateStep>('idle');
  const newCampaignRef = useRef<Campaign | null>(null);
  const voucherCreatedCountRef = useRef(0);

  const fetchCampaigns = useCallback(async (): Promise<void> => {
    try {
      await onGetCampaigns(page, pageSize);
    } catch (err) {
      console.error('Failed to fetch campaigns', err);
    }
  }, [onGetCampaigns, page, pageSize]);

  useEffect(() => {
    void fetchCampaigns();
  }, [fetchCampaigns]);

  const handleOpenModal = (campaign?: Campaign): void => {
    if (campaign && hasRegistrationStarted(campaign.registrationStartDate)) {
      return;
    }

    if (campaign) {
      setEditingCampaign(campaign);
    } else {
      setEditingCampaign(null);
    }
    setOpenModal(true);
  };

  const handleCloseModal = (): void => {
    setOpenModal(false);
    setEditingCampaign(null);
  };

  const handleSubmit = async (
    data: CampaignFormData,
    imageFile: File | null,
    isImageRemoved?: boolean
  ): Promise<void> => {
    try {
      if (editingCampaign) {
        if (hasRegistrationStarted(editingCampaign.registrationStartDate)) {
          return;
        }

        // ── Edit flow (unchanged) ──
        await onUpdateCampaign(editingCampaign.campaignId, data);

        if (isImageRemoved && !imageFile) {
          await onDeleteCampaignImage(editingCampaign.campaignId);
        }

        if (imageFile) {
          const formData = new FormData();
          formData.append('image', imageFile);
          await onPostCampaignImage(editingCampaign.campaignId, formData);
        }

        handleCloseModal();
      } else {
        // ── Create flow → trigger post-create ──
        const createdCampaign = await onCreateCampaign(data);

        if (imageFile) {
          const formData = new FormData();
          formData.append('image', imageFile);
          await onPostCampaignImage(createdCampaign.campaignId, formData);
        }

        // Close campaign form, start post-create prompt
        handleCloseModal();
        newCampaignRef.current = createdCampaign;
        voucherCreatedCountRef.current = 0;
        setPostCreateStep('prompt');
      }
    } catch (err) {
      console.error('Failed to save campaign', err);
    }
  };

  const handleOpenDetailModal = async (row: Campaign): Promise<void> => {
    setOpenDetailModal(true);
    setDetailCampaign(row);
    setIsDetailLoading(true);

    try {
      const campaignDetail = await onGetCampaignDetail(row.campaignId);
      setDetailCampaign(campaignDetail);
    } catch (err) {
      console.error('Failed to fetch campaign detail', err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  // ── Post-create: user chooses to create a voucher ──
  const handleStartVoucherCreation = (): void => {
    setPostCreateStep('creating');
  };

  // ── Post-create: user skips voucher creation ──
  const handleSkipVoucher = (): void => {
    newCampaignRef.current = null;
    voucherCreatedCountRef.current = 0;
    setPostCreateStep('idle');
  };

  // ── Post-create: VoucherFormModal submit ──
  const handleVoucherSubmit = async (
    data: VoucherCreate | VoucherCreate[]
  ): Promise<void> => {
    const items = Array.isArray(data) ? data : [data];
    await onCreateVoucher(items);
    voucherCreatedCountRef.current += items.length;
    setPostCreateStep('done_one');
  };

  // ── Post-create: create another voucher → reset form by toggling step ──
  const handleCreateAnother = (): void => {
    // Go back to 'prompt' for a frame so VoucherFormModal unmounts+remounts (fresh form)
    setPostCreateStep('prompt');
    // Immediately go to 'creating' after paint
    window.setTimeout(() => setPostCreateStep('creating'), 0);
  };

  // ── Post-create: done ──
  const handleDoneVoucher = (): void => {
    newCampaignRef.current = null;
    voucherCreatedCountRef.current = 0;
    setPostCreateStep('idle');
  };

  const columns = [
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
      key: 'startDate',
      label: 'Thời gian diễn ra',
      render: (_: unknown, row: Campaign): JSX.Element => (
        <Box className="text-sm text-[var(--color-table-text-secondary)]">
          <div>Từ: {formatVNDatetime(row.startDate)}</div>
          <div>Đến: {formatVNDatetime(row.endDate)}</div>
        </Box>
      ),
    },
    {
      key: 'registrationStartDate',
      label: 'Thời gian đăng ký',
      render: (_: unknown, row: Campaign): JSX.Element => (
        <Box className="text-sm text-[var(--color-table-text-secondary)]">
          <div>Từ: {formatVNDatetime(row.registrationStartDate)}</div>
          <div>Đến: {formatVNDatetime(row.registrationEndDate)}</div>
        </Box>
      ),
    },
    {
      key: 'targetSegment',
      label: 'Phân khúc',
      render: (value: unknown): JSX.Element => (
        <Box className="text-table-text-primary">
          {typeof value === 'string' && value.trim().length > 0 ? value : '-'}
        </Box>
      ),
    },
    {
      key: 'status',
      label: 'Hoạt động',
      render: (_: unknown, row: Campaign): JSX.Element => {
        const { label, type } = getCampaignStatus(row);
        const colorMap: Record<string, string> = {
          success: 'bg-green-100 text-green-700 border-green-200',
          error: 'bg-red-100 text-red-700 border-red-200',
          warning: 'bg-amber-100 text-amber-700 border-amber-200',
          default: 'bg-slate-100 text-slate-700 border-slate-200',
          info: 'bg-blue-100 text-blue-700 border-blue-200',
        };
        return (
          <span
            className={`inline-flex min-w-[130px] items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-bold shadow-sm ${colorMap[type]}`}
          >
            {label}
          </span>
        );
      },
    },
  ];

  const actions = [
    {
      label: <VisibilityIcon fontSize="small" />,
      onClick: (row: Campaign): void => {
        void handleOpenDetailModal(row);
      },
      tooltip: 'Xem chi tiết chiến dịch',
      color: 'info' as const,
      variant: 'outlined' as const,
      show: (): boolean => true,
    },
    {
      label: <StorefrontIcon fontSize="small" />,
      onClick: (row: Campaign): void => {
        setSelectedCampaign(row);
        setOpenBranchModal(true);
      },
      tooltip: 'Xem chi nhánh tham gia',
      color: 'info' as const,
      variant: 'outlined' as const,
      show: (): boolean => true,
    },
    {
      label: <VoucherIcon fontSize="small" />,
      onClick: (row: Campaign): void => {
        setSelectedCampaign(row);
        setOpenVoucherModal(true);
      },
      tooltip: 'Quản lý voucher chiến dịch',
      color: 'warning' as const,
      variant: 'outlined' as const,
      show: (row: Campaign): boolean => row.isUpdateable,
    },
    {
      label: <EditIcon fontSize="small" />,
      onClick: (row: Campaign): void => handleOpenModal(row),
      tooltip: 'Chỉnh sửa chiến dịch',
      color: 'primary' as const,
      variant: 'outlined' as const,
      show: (row: Campaign): boolean => row.isUpdateable,
    },
  ];

  const newCampaign = newCampaignRef.current;
  const isUrgentVoucherCreation =
    newCampaign?.registrationStartDate != null &&
    new Date(newCampaign.registrationStartDate).toDateString() ===
      new Date().toDateString();

  return (
    <div className="flex h-full flex-col font-[var(--font-nunito)]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-bold text-[var(--color-table-text-primary)]">
            Quản lý chiến dịch
          </h1>
          <p className="text-sm text-[var(--color-table-text-secondary)]">
            Quản lý các chương trình khuyến mãi và chiến dịch hệ thống
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 rounded-lg bg-[var(--color-primary-600)] px-4 py-2 font-semibold text-white transition-colors hover:bg-[var(--color-primary-700)]"
        >
          <AddIcon fontSize="small" />
          Thêm chiến dịch
        </button>
      </div>

      {/* Table Content */}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <Table
          columns={columns}
          data={campaigns}
          rowKey="campaignId"
          actions={actions}
          loading={status === 'pending'}
          emptyMessage="Chưa có chiến dịch nào"
          noActionsMessage="Đã kết thúc"
        />
      </Box>

      {/* Pagination */}
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

      {/* Form Modal (create / edit) */}
      <CamPaignFormModal
        isOpen={openModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        campaign={editingCampaign}
        status={status}
      />

      {/* Campaign Voucher Modal (from table row action) */}
      <CampaignVoucherModal
        isOpen={openVoucherModal}
        onClose={() => setOpenVoucherModal(false)}
        campaign={selectedCampaign}
      />

      <CampaignDetailModal
        isOpen={openDetailModal}
        onClose={() => setOpenDetailModal(false)}
        campaign={detailCampaign}
        isLoading={isDetailLoading}
      />

      <CampaignBranchModal
        isOpen={openBranchModal}
        onClose={() => setOpenBranchModal(false)}
        campaign={selectedCampaign}
      />

      {/* ══════════════════════════════════════════════════════
          POST-CREATE FLOW — Step 1: Prompt
          "Bạn muốn tạo voucher cho chiến dịch vừa tạo không?"
         ══════════════════════════════════════════════════════ */}
      <Dialog
        open={postCreateStep === 'prompt'}
        onClose={(event, reason) => {
          if (
            isUrgentVoucherCreation &&
            (reason === 'backdropClick' || reason === 'escapeKeyDown')
          ) {
            return;
          }
          handleSkipVoucher();
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px', overflow: 'hidden' } }}
      >
        {/* Green accent header */}
        <div
          className="flex items-center gap-3 px-6 py-4"
          style={{
            background: 'linear-gradient(135deg, #8bcf3f 0%, #6aaa28 100%)',
          }}
        >
          <CheckCircleIcon sx={{ color: 'white', fontSize: 28 }} />
          <div>
            <p className="text-xs font-semibold text-white/70">
              Chiến dịch đã được tạo thành công!
            </p>
            <p className="text-base font-bold text-white">
              {newCampaign?.name ?? ''}
            </p>
          </div>
        </div>

        <DialogContent sx={{ pt: 3 }}>
          <p className="text-sm text-gray-600">
            Bạn có muốn tạo{' '}
            <span className="font-semibold text-gray-800">voucher</span> cho
            chiến dịch này ngay bây giờ không?
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Bạn cũng có thể thực hiện sau từ danh sách chiến dịch.
          </p>
          {newCampaign?.registrationStartDate && (
            <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
              <span className="font-semibold">Lưu ý:</span> Bạn sẽ không thể tạo
              thêm voucher cho chiến dịch{' '}
              <span className="font-semibold">{newCampaign.name}</span> khi
              chiến dịch đã bắt đầu mở đăng ký (
              {formatVNDatetime(newCampaign.registrationStartDate)}).
            </div>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          {!isUrgentVoucherCreation && (
            <Button
              onClick={handleSkipVoucher}
              color="inherit"
              variant="outlined"
            >
              Tạo voucher sau
            </Button>
          )}
          <Button
            onClick={handleStartVoucherCreation}
            variant="contained"
            color="primary"
          >
            Tạo voucher ngay
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══════════════════════════════════════════════════════
          POST-CREATE FLOW — Step 2: VoucherFormModal
         ══════════════════════════════════════════════════════ */}
      {postCreateStep === 'creating' && newCampaign !== null && (
        <VoucherFormModal
          isOpen
          onClose={handleSkipVoucher}
          onSubmit={handleVoucherSubmit}
          voucher={null}
          status={voucherStatus}
          fixedCampaignId={newCampaign.campaignId}
          campaignStartDate={newCampaign.startDate}
          campaignEndDate={newCampaign.endDate}
          campaignName={newCampaign.name}
          disableCancel={isUrgentVoucherCreation}
        />
      )}

      {/* ══════════════════════════════════════════════════════
          POST-CREATE FLOW — Step 3: "Tạo thêm / Thôi"
         ══════════════════════════════════════════════════════ */}
      <Dialog
        open={postCreateStep === 'done_one'}
        onClose={handleDoneVoucher}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px', overflow: 'hidden' } }}
      >
        <div
          className="flex items-center gap-3 px-6 py-4"
          style={{
            background: 'linear-gradient(135deg, #8bcf3f 0%, #6aaa28 100%)',
          }}
        >
          <CheckCircleIcon sx={{ color: 'white', fontSize: 28 }} />
          <div>
            <p className="text-xs font-semibold text-white/70">
              Voucher đã được tạo!
            </p>
            <p className="text-base font-bold text-white">
              {newCampaign?.name ?? ''}
            </p>
          </div>
        </div>

        <DialogContent sx={{ pt: 3 }}>
          <p className="text-sm text-gray-600">
            Đã tạo{' '}
            <span className="font-semibold text-gray-800">
              {voucherCreatedCountRef.current}
            </span>{' '}
            voucher. Bạn muốn tiếp tục tạo thêm voucher cho chiến dịch này
            không?
          </p>
          {newCampaign?.registrationStartDate && (
            <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
              <span className="font-semibold">Lưu ý:</span> Bạn sẽ không thể tạo
              thêm voucher cho chiến dịch{' '}
              <span className="font-semibold">{newCampaign.name}</span> khi
              chiến dịch đã bắt đầu mở đăng ký (
              {formatVNDatetime(newCampaign.registrationStartDate)}).
            </div>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={handleDoneVoucher}
            color="inherit"
            variant="outlined"
          >
            Thôi, xong rồi
          </Button>
          <Button
            onClick={handleCreateAnother}
            variant="contained"
            color="primary"
          >
            Tiếp tục tạo voucher
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
