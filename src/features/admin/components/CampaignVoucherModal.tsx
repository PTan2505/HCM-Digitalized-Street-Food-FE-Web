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
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import Table from '@features/admin/components/Table';
import type { Campaign } from '@features/admin/types/campaign';
import type { Voucher, VoucherCreate } from '@features/admin/types/voucher';
import useVoucher from '@features/admin/hooks/useVoucher';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectVouchers, selectVoucherStatus } from '@slices/voucher';
import VoucherFormModal from './VoucherFormModal';

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

  const columns = [
    { key: 'voucherId', label: 'ID', style: { width: '60px' } },
    { key: 'name', label: 'Tên Voucher' },
    { key: 'voucherCode', label: 'Mã Code' },
    {
      key: 'type',
      label: 'Loại',
      render: (value: unknown): JSX.Element | string =>
        value === 'AMOUNT' ? 'Tiền mặt' : 'Phần trăm',
    },
    {
      key: 'discountValue',
      label: 'Giá trị',
      render: (value: unknown, row: Voucher): JSX.Element | string =>
        row.type === 'AMOUNT'
          ? `${(value as number).toLocaleString()} VNĐ`
          : `${value as number}%`,
    },
    { key: 'quantity', label: 'Số lượng' },
    {
      key: 'startDate',
      label: 'Thời gian',
      render: (_: unknown, row: Voucher): JSX.Element => (
        <div className="text-xs">
          <div>Từ: {formatVNDatetime(row.startDate)}</div>
          <div>Đến: {formatVNDatetime(row.endDate)}</div>
        </div>
      ),
    },
  ];

  const actions = [
    {
      label: <EditIcon fontSize="small" />,
      onClick: (row: Voucher): void => {
        handleOpenForm(row);
      },
      color: 'primary' as const,
      variant: 'outlined' as const,
    },
    {
      label: <DeleteIcon fontSize="small" />,
      onClick: (row: Voucher): void => {
        handleDelete(row);
      },
      color: 'error' as const,
      variant: 'outlined' as const,
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
              data={vouchers}
              rowKey="voucherId"
              actions={actions}
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
    </>
  );
}
