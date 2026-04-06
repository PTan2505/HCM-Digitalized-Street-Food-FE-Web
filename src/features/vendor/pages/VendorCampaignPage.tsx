import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { JSX, MouseEvent } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  ConfirmationNumber as VoucherIcon,
  Storefront as StorefrontIcon,
  GroupAdd as GroupAddIcon,
  CheckCircle as CheckCircleIcon,
  HelpOutline as HelpOutlineIcon,
} from '@mui/icons-material';
import {
  type Controls,
  EVENTS,
  Joyride,
  STATUS,
  type EventData,
} from 'react-joyride';
import Table from '@features/vendor/components/Table';
import Pagination from '@features/vendor/components/Pagination';
import VendorCampaignFormModal from '@features/vendor/components/VendorCampaignFormModal';
import VendorCampaignVoucherModal from '@features/vendor/components/VendorCampaignVoucherModal';
import VendorCampaignBranchModal from '@features/vendor/components/VendorCampaignBranchModal';
import JoinableSystemCampaignModal from '@features/vendor/components/JoinableSystemCampaignModal';
import VoucherFormModal from '@features/vendor/components/VoucherFormModal';
import type { VendorCampaign } from '@features/vendor/types/campaign';
import useVendorCampaign from '@features/vendor/hooks/useVendorCampaign';
import useVendor from '@features/vendor/hooks/useVendor';
import { useAppSelector } from '@hooks/reduxHooks';
import {
  selectVendorCampaigns,
  selectCampaignStatus,
  selectVendorCampaignTotalCount,
} from '@slices/campaign';
import { selectVoucherStatus } from '@slices/voucher';
import { selectMyVendor } from '@slices/vendor';
import type { VendorCampaignFormData } from '@features/vendor/utils/campaignSchema';
import type { Branch } from '@features/vendor/types/vendor';
import type { VoucherCreate } from '@custom-types/voucher';
import useVoucher from '@features/vendor/hooks/useVoucher';
import { getCampaignManagementTourSteps } from '@features/vendor/utils/campaignManagementTourSteps';

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

/**
 * "Post-create" flow states:
 *  idle      → no post-create flow running
 *  prompt    → asking "Tạo voucher ngay?" dialog
 *  creating  → VoucherFormModal open
 *  done_one  → voucher(s) created, asking "Tạo thêm / Thôi"
 */
type PostCreateStep = 'idle' | 'prompt' | 'creating' | 'done_one';

export default function VendorCampaignPage(): JSX.Element {
  const campaigns = useAppSelector(selectVendorCampaigns);
  const myVendor = useAppSelector(selectMyVendor);
  const status = useAppSelector(selectCampaignStatus);
  const voucherStatus = useAppSelector(selectVoucherStatus);
  const totalCount = useAppSelector(selectVendorCampaignTotalCount);
  const {
    onGetVendorCampaigns,
    onCreateVendorCampaign,
    onUpdateVendorCampaign,
    onPostCampaignImage,
    onDeleteCampaignImage,
  } = useVendorCampaign();
  const { onGetBranchesByVendor } = useVendor();
  const { onCreateVoucher } = useVoucher();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [openModal, setOpenModal] = useState(false);
  const [openVoucherModal, setOpenVoucherModal] = useState(false);
  const [openBranchModal, setOpenBranchModal] = useState(false);
  const [isJoinableModalOpen, setIsJoinableModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<VendorCampaign | null>(
    null
  );
  const [selectedCampaign, setSelectedCampaign] =
    useState<VendorCampaign | null>(null);
  const [branchOptions, setBranchOptions] = useState<Branch[]>([]);

  // Post-create flow
  const [postCreateStep, setPostCreateStep] = useState<PostCreateStep>('idle');
  const newCampaignRef = useRef<VendorCampaign | null>(null);
  const voucherCreatedCountRef = useRef(0);
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [tourInstanceKey, setTourInstanceKey] = useState(0);

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
    imageFile: File | null,
    isImageRemoved?: boolean
  ): Promise<void> => {
    try {
      const payload = {
        name: data.name,
        description: data.description ?? null,
        targetSegment: data.targetSegment ?? null,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: data.isActive,
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
        // Close campaign form, start post-create prompt
        handleCloseModal();
        newCampaignRef.current = createdCampaign;
        voucherCreatedCountRef.current = 0;
        setPostCreateStep('prompt');
        return;
      }
      handleCloseModal();
    } catch (err) {
      console.error('Failed to save vendor campaign', err);
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

  // ── Post-create: create another batch ──
  const handleCreateAnother = (): void => {
    setPostCreateStep('prompt');
    window.setTimeout(() => setPostCreateStep('creating'), 0);
  };

  // ── Post-create: done ──
  const handleDoneVoucher = (): void => {
    newCampaignRef.current = null;
    voucherCreatedCountRef.current = 0;
    setPostCreateStep('idle');
  };

  const newCampaign = newCampaignRef.current;

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

        if (new Date(row.endDate) < new Date()) {
          return (
            <span className="text-xs text-gray-400 italic">Đã kết thúc</span>
          );
        }

        return (
          <Box className="flex items-center gap-2">
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
        onClose={() => setIsJoinableModalOpen(false)}
        mode="detail"
        vendorBranchIds={branchOptions.map((branch) => branch.branchId)}
        vendorBranches={branchOptions}
      />

      {/* ══════════════════════════════════════════════════════
          POST-CREATE FLOW — Step 1: Prompt
         ══════════════════════════════════════════════════════ */}
      <Dialog
        open={postCreateStep === 'prompt'}
        onClose={handleSkipVoucher}
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
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={handleSkipVoucher}
            color="inherit"
            variant="outlined"
          >
            Tạo voucher sau
          </Button>
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
