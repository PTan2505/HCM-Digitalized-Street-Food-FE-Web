import { useState, useEffect, useCallback } from 'react';
import type { JSX } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Box,
  Button,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import Table from '@features/admin/components/Table';
import type { Campaign } from '@features/admin/types/campaign';
import type { Voucher, VoucherCreate } from '@custom-types/voucher';
import useVoucher from '@features/admin/hooks/useVoucher';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectVouchers, selectVoucherStatus } from '@slices/voucher';
import VoucherFormModal from './VoucherFormModal';
import VoucherDetailsModal from './VoucherDetailsModal';

interface CampaignVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign | null;
}

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

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);

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

export default function CampaignVoucherModal({
  isOpen,
  onClose,
  campaign,
}: CampaignVoucherModalProps): JSX.Element | null {
  const vouchers = useAppSelector(selectVouchers);
  const status = useAppSelector(selectVoucherStatus);
  const {
    onGetVouchersByCampaignId,
    onCreateVoucher,
    onUpdateVoucher,
    onDeleteVoucher,
  } = useVoucher();

  const [openForm, setOpenForm] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletingVoucher, setDeletingVoucher] = useState<Voucher | null>(null);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [viewingVoucher, setViewingVoucher] = useState<Voucher | null>(null);

  const fetchVouchers = useCallback(async () => {
    if (campaign) {
      try {
        await onGetVouchersByCampaignId(campaign.campaignId);
      } catch (error) {
        console.error('Failed to fetch vouchers for campaign', error);
      }
    }
  }, [campaign, onGetVouchersByCampaignId]);

  useEffect(() => {
    if (isOpen && campaign) {
      void fetchVouchers();
    }
  }, [isOpen, campaign, fetchVouchers]);

  if (!isOpen || !campaign) return null;

  const handleOpenForm = (voucher?: Voucher): void => {
    setEditingVoucher(voucher ?? null);
    setOpenForm(true);
  };

  const handleCloseForm = (): void => {
    setOpenForm(false);
    setEditingVoucher(null);
  };

  const handleFormSubmit = async (data: VoucherCreate): Promise<void> => {
    try {
      if (editingVoucher) {
        await onUpdateVoucher(editingVoucher.voucherId, data);
      } else {
        await onCreateVoucher(data);
      }
      handleCloseForm();
      void fetchVouchers();
    } catch (error) {
      console.error('Failed to save voucher', error);
    }
  };

  const handleDelete = (voucher: Voucher): void => {
    setDeletingVoucher(voucher);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (deletingVoucher) {
      try {
        await onDeleteVoucher(deletingVoucher.voucherId);
        setOpenDeleteDialog(false);
        setDeletingVoucher(null);
        void fetchVouchers();
      } catch (error) {
        console.error('Failed to delete voucher', error);
      }
    }
  };

  const handleCancelDelete = (): void => {
    setOpenDeleteDialog(false);
    setDeletingVoucher(null);
  };

  const handleOpenDetails = (voucher: Voucher): void => {
    setViewingVoucher(voucher);
    setOpenDetailsModal(true);
  };

  const handleCloseDetails = (): void => {
    setOpenDetailsModal(false);
    setViewingVoucher(null);
  };

  const columns = [
    {
      key: 'name',
      label: 'Tên voucher',
      style: { width: '180px', maxWidth: '240px' },
      render: (_: unknown, row: Voucher): JSX.Element => (
        <Box className="w-[220px] min-w-0">
          <div
            className="truncate font-semibold text-[var(--color-table-text-primary)]"
            title={row.name}
          >
            {row.name}
          </div>
          <div
            className="truncate text-xs text-[var(--color-table-text-secondary)]"
            title={row.voucherCode}
          >
            {row.voucherCode}
          </div>
        </Box>
      ),
    },
    {
      key: 'type',
      label: 'Loại voucher',
      render: (value: unknown): JSX.Element => (
        <Chip
          label={value === 'PERCENT' ? 'Phần trăm' : 'Giá tiền'}
          size="small"
          color={value === 'PERCENT' ? 'info' : 'primary'}
          variant="outlined"
        />
      ),
    },
    {
      key: 'availableQuantity',
      label: 'Số lượng còn lại',
      render: (_: unknown, row: Voucher): JSX.Element => {
        const remainingQuantity = Math.max(
          row.quantity - (row.usedQuantity ?? 0),
          0
        );

        return (
          <span className="text-sm font-medium text-[var(--color-table-text-primary)]">
            {remainingQuantity}
          </span>
        );
      },
    },
    {
      key: 'quantity',
      label: 'Số lượng',
      render: (value: unknown): JSX.Element => (
        <span className="text-sm font-medium text-[var(--color-table-text-primary)]">
          {value as number}
        </span>
      ),
    },
    {
      key: 'startDate',
      label: 'Thời gian hiệu lực',
      render: (_: unknown, row: Voucher): JSX.Element => (
        <Box className="text-sm text-[var(--color-table-text-secondary)]">
          <div>Từ: {formatVNDatetime(row.startDate)}</div>
          <div>Đến: {formatVNDatetime(row.endDate)}</div>
        </Box>
      ),
    },
    {
      key: 'discountValue',
      label: 'Giá trị giảm',
      render: (value: unknown, row: Voucher): JSX.Element => (
        <span className="text-sm font-semibold text-[var(--color-table-text-primary)]">
          {row.type === 'PERCENT'
            ? `${value as number}%`
            : formatCurrency(value as number)}
        </span>
      ),
    },
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
      render: (_: unknown, row: Voucher): JSX.Element => (
        <Box className="flex items-center gap-2">
          <Button
            size="small"
            color="info"
            variant="outlined"
            onClick={(event) => {
              event.stopPropagation();
              handleOpenDetails(row);
            }}
          >
            <VisibilityIcon fontSize="small" />
          </Button>
          <Button
            size="small"
            color="primary"
            variant="outlined"
            onClick={(event) => {
              event.stopPropagation();
              handleOpenForm(row);
            }}
          >
            <EditIcon fontSize="small" />
          </Button>
          <Button
            size="small"
            color="error"
            variant="outlined"
            onClick={(event) => {
              event.stopPropagation();
              handleDelete(row);
            }}
          >
            <DeleteIcon fontSize="small" />
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2, fontWeight: 'bold', pr: 6 }}>
          Voucher của chiến dịch: {campaign.name}
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={(theme) => ({
              position: 'absolute',
              right: 8,
              top: 8,
              color: theme.palette.grey[500],
            })}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenForm()}
              color="primary"
            >
              Thêm Voucher
            </Button>
          </Box>
          <Box sx={{ minHeight: '400px' }}>
            <Table
              columns={columns}
              maxHeight="none"
              data={vouchers}
              rowKey="voucherId"
              loading={status === 'pending'}
              emptyMessage="Chiến dịch này chưa có voucher nào"
            />
          </Box>
        </DialogContent>
      </Dialog>

      <VoucherFormModal
        isOpen={openForm}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        voucher={editingVoucher}
        status={status}
        fixedCampaignId={campaign.campaignId}
        campaignStartDate={campaign.startDate}
        campaignEndDate={campaign.endDate}
        campaignName={campaign.name}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCancelDelete}
        aria-labelledby="delete-voucher-title"
        aria-describedby="delete-voucher-description"
      >
        <DialogTitle id="delete-voucher-title">
          Xác nhận xóa voucher
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-voucher-description">
            Bạn có chắc chắn muốn xóa voucher &quot;
            {deletingVoucher?.name}&quot;? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancelDelete}
            color="primary"
            className="font-[var(--font-nunito)]"
          >
            Hủy
          </Button>
          <Button
            onClick={() => void handleConfirmDelete()}
            color="error"
            variant="contained"
            className="font-[var(--font-nunito)]"
            autoFocus
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      <VoucherDetailsModal
        isOpen={openDetailsModal}
        onClose={handleCloseDetails}
        voucher={viewingVoucher}
      />
    </>
  );
}
