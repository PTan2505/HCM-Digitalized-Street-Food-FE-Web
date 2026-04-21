import { useState, useEffect, useCallback, useMemo } from 'react';
import type { JSX } from 'react';
import { Box, Chip } from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  HelpOutline as HelpOutlineIcon,
} from '@mui/icons-material';
import {
  type Controls,
  EVENTS,
  Joyride,
  STATUS,
  type EventData,
} from 'react-joyride';
import Table from '@features/admin/components/Table';
import VoucherFormModal from '@features/admin/components/VoucherFormModal';
import VoucherDetailsModal from '@features/admin/components/VoucherDetailsModal';
import DeleteConfirmationDialog from '@components/ui/DeleteConfirmationDialog';
import type { Voucher, VoucherCreate } from '@custom-types/voucher';
import useVoucher from '@features/admin/hooks/useVoucher';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectVouchers, selectVoucherStatus } from '@slices/voucher';
import { getVoucherManagementTourSteps } from '@features/admin/utils/voucherManagementTourSteps';

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

// const formatCurrency = (value: number): string =>
//   new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
//     value
//   );

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
      className={`inline-flex min-w-25 items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-bold shadow-sm ${colors[type]}`}
    >
      {label}
    </span>
  );
};

const isMarketplaceVoucher = (voucher: Voucher): boolean =>
  (voucher.redeemPoint ?? 0) > 0;

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
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [tourInstanceKey, setTourInstanceKey] = useState(0);

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

  const handleSubmit = async (
    data: VoucherCreate | VoucherCreate[]
  ): Promise<void> => {
    try {
      if (editingVoucher) {
        const single = Array.isArray(data) ? data[0] : data;
        await onUpdateVoucher(editingVoucher.voucherId, single);
      } else {
        const items = Array.isArray(data) ? data : [data];
        await onCreateVoucher(items);
      }
      handleCloseModal();
    } catch (err) {
      console.error('Failed to save voucher', err);
    }
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

  const startVoucherTour = (): void => {
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
    return getVoucherManagementTourSteps({
      hasRows: vouchers.length > 0,
    });
  }, [vouchers.length]);

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
          <div className="text-table-text-primary font-semibold">
            {row.name}
          </div>
          <div className="text-table-text-secondary text-xs">
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
      key: 'redeemPoint',
      label: 'Phạm vi',
      render: (_: unknown, row: Voucher): JSX.Element => (
        <StatusBadge
          label={
            isMarketplaceVoucher(row) ? 'MarketPlace' : 'Voucher chiến dịch'
          }
          type={isMarketplaceVoucher(row) ? 'default' : 'warning'}
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
          <span className="text-table-text-primary text-sm font-medium">
            {remainingQuantity}
          </span>
        );
      },
    },
    {
      key: 'quantity',
      label: 'Số lượng',
      render: (value: unknown): JSX.Element => (
        <span className="text-table-text-primary text-sm font-medium">
          {value as number}
        </span>
      ),
    },
    {
      key: 'startDate',
      label: 'Thời gian hiệu lực',
      render: (_: unknown, row: Voucher): JSX.Element => (
        <Box className="text-table-text-secondary text-sm">
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
      id: 'view',
      label: <VisibilityIcon fontSize="small" />,
      onClick: (row: Voucher): void => handleOpenDetailsModal(row),
      tooltip: 'Xem chi tiết voucher',
      color: 'info' as const,
      variant: 'outlined' as const,
    },
    {
      id: 'edit',
      label: <EditIcon fontSize="small" />,
      onClick: (row: Voucher): void => handleOpenModal(row),
      show: (row: Voucher): boolean => isMarketplaceVoucher(row),
      tooltip: 'Chỉnh sửa voucher',
      color: 'primary' as const,
      variant: 'outlined' as const,
    },
    // {
    //   id: 'delete',
    //   label: <DeleteIcon fontSize="small" />,
    //   onClick: (row: Voucher): void => {
    //     void handleDelete(row);
    //   },
    //   tooltip: 'Xóa voucher',
    //   color: 'error' as const,
    //   variant: 'outlined' as const,
    // },
  ];

  return (
    <div className="flex h-full flex-col font-(--font-nunito)">
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
        data-tour="voucher-page-header"
      >
        <div>
          <div className="mb-1 flex items-start gap-2">
            <h1 className="text-table-text-primary text-3xl font-bold">
              Quản lý Voucher
            </h1>
            <button
              type="button"
              onClick={startVoucherTour}
              aria-label="Mở hướng dẫn quản lý voucher"
              title="Hướng dẫn"
              className="text-primary-700 hover:text-primary-800 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
            >
              <HelpOutlineIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
          <p className="text-table-text-secondary text-sm">
            Quản lý các voucher giảm giá trong hệ thống
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          data-tour="voucher-create-button"
          className="bg-primary-600 hover:bg-primary-700 flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white transition-colors"
        >
          <AddIcon fontSize="small" />
          Thêm voucher
        </button>
      </div>

      {/* Table */}
      <Box sx={{ flex: 1, minHeight: 0 }} data-tour="voucher-table-wrapper">
        <Table
          columns={columns}
          data={vouchers}
          rowKey="voucherId"
          actions={actions}
          loading={status === 'pending'}
          emptyMessage="Chưa có voucher nào"
          tourId="admin-voucher"
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

      <DeleteConfirmationDialog
        open={openDeleteDialog}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa voucher"
        confirmationMessage={
          <>
            Bạn có chắc chắn muốn xóa voucher &quot;{deletingVoucher?.name}
            &quot;? Hành động này không thể hoàn tác.
          </>
        }
      />
    </div>
  );
}
