import { useState, useEffect, useCallback } from 'react';
import type { JSX } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import Table from '@features/admin/components/Table';
import VoucherFormModal from '@features/admin/components/VoucherFormModal';
import VoucherDetailsModal from '@features/admin/components/VoucherDetailsModal';
import type { Voucher, VoucherCreate } from '@features/admin/types/voucher';
import useVoucher from '@features/admin/hooks/useVoucher';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectVouchers, selectVoucherStatus } from '@slices/voucher';

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
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    value
  );

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

export default function VoucherPage(): JSX.Element {
  const vouchers = useAppSelector(selectVouchers);
  const status = useAppSelector(selectVoucherStatus);
  const { onGetVouchers, onCreateVoucher, onUpdateVoucher, onDeleteVoucher } =
    useVoucher();

  const [openModal, setOpenModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletingVoucher, setDeletingVoucher] = useState<Voucher | null>(null);

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [viewingVoucher, setViewingVoucher] = useState<Voucher | null>(null);

  const fetchVouchers = useCallback(async (): Promise<void> => {
    try {
      await onGetVouchers();
    } catch (err) {
      console.error('Failed to fetch vouchers', err);
    }
  }, [onGetVouchers]);

  useEffect(() => {
    void fetchVouchers();
  }, [fetchVouchers]);

  const handleOpenModal = (voucher?: Voucher): void => {
    setEditingVoucher(voucher ?? null);
    setOpenModal(true);
  };

  const handleCloseModal = (): void => {
    setOpenModal(false);
    setEditingVoucher(null);
  };

  const handleOpenDetailsModal = (voucher: Voucher): void => {
    setViewingVoucher(voucher);
    setDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = (): void => {
    setDetailsModalOpen(false);
    setViewingVoucher(null);
  };

  const handleSubmit = async (data: VoucherCreate): Promise<void> => {
    try {
      if (editingVoucher) {
        await onUpdateVoucher(editingVoucher.voucherId, data);
      } else {
        await onCreateVoucher(data);
      }
      handleCloseModal();
    } catch (err) {
      console.error('Failed to save voucher', err);
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
      } catch (err) {
        console.error('Failed to delete voucher', err);
      }
    }
  };

  const handleCancelDelete = (): void => {
    setOpenDeleteDialog(false);
    setDeletingVoucher(null);
  };

  const columns = [
    // {
    //   key: 'voucherId',
    //   label: 'ID',
    //   style: { width: '60px' },
    // },
    {
      key: 'name',
      label: 'Tên voucher',
      render: (_: unknown, row: Voucher): JSX.Element => (
        <Box>
          <div className="font-semibold text-[var(--color-table-text-primary)]">
            {row.name}
          </div>
          <div className="text-xs text-[var(--color-table-text-secondary)]">
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
    // {
    //   key: 'discountValue',
    //   label: 'Giá trị giảm',
    //   render: (_: unknown, row: Voucher): JSX.Element => (
    //     <Box className="text-sm text-[var(--color-table-text-primary)]">
    //       {row.type === 'PERCENT'
    //         ? `${row.discountValue}%`
    //         : formatCurrency(row.discountValue)}
    //       {row.maxDiscountValue !== null && row.type === 'PERCENT' && (
    //         <div className="text-xs text-[var(--color-table-text-secondary)]">
    //           Tối đa: {formatCurrency(row.maxDiscountValue)}
    //         </div>
    //       )}
    //     </Box>
    //   ),
    // },
    // {
    //   key: 'minAmountRequired',
    //   label: 'Đơn tối thiểu',
    //   render: (value: unknown): JSX.Element => (
    //     <span className="text-sm text-[var(--color-table-text-secondary)]">
    //       {formatCurrency(value as number)}
    //     </span>
    //   ),
    // },
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
      key: 'isActive',
      label: 'Hoạt động',
      render: (value: unknown): JSX.Element => (
        <StatusBadge
          label={value === true ? 'Đang hoạt động' : 'Tạm ngưng'}
          type={value === true ? 'success' : 'error'}
        />
      ),
    },
  ];

  const actions = [
    {
      label: <VisibilityIcon fontSize="small" />,
      onClick: (row: Voucher): void => handleOpenDetailsModal(row),
      color: 'info' as const,
      variant: 'outlined' as const,
    },
    {
      label: <EditIcon fontSize="small" />,
      onClick: (row: Voucher): void => handleOpenModal(row),
      color: 'primary' as const,
      variant: 'outlined' as const,
    },
    {
      label: <DeleteIcon fontSize="small" />,
      onClick: (row: Voucher): void => {
        void handleDelete(row);
      },
      color: 'error' as const,
      variant: 'outlined' as const,
    },
  ];

  return (
    <div className="flex h-full flex-col font-[var(--font-nunito)]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-bold text-[var(--color-table-text-primary)]">
            Quản lý Voucher
          </h1>
          <p className="text-sm text-[var(--color-table-text-secondary)]">
            Quản lý các voucher giảm giá trong hệ thống
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 rounded-lg bg-[var(--color-primary-600)] px-4 py-2 font-semibold text-white transition-colors hover:bg-[var(--color-primary-700)]"
        >
          <AddIcon fontSize="small" />
          Thêm voucher
        </button>
      </div>

      {/* Table */}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <Table
          columns={columns}
          data={vouchers}
          rowKey="voucherId"
          actions={actions}
          loading={status === 'pending'}
          emptyMessage="Chưa có voucher nào"
        />
      </Box>

      {/* Form Modal */}
      <VoucherFormModal
        isOpen={openModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        voucher={editingVoucher}
        status={status}
      />

      {/* Details Modal */}
      <VoucherDetailsModal
        isOpen={detailsModalOpen}
        onClose={handleCloseDetailsModal}
        voucher={viewingVoucher}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Xác nhận xóa voucher</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
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
    </div>
  );
}
