import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { JSX } from 'react';
import {
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Button,
  Typography,
  type SelectChangeEvent,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import Table from '@features/vendor/components/Table';
import Pagination from '@features/vendor/components/Pagination';
import useOrder from '@features/vendor/hooks/useOrder';
import useVendor from '@features/vendor/hooks/useVendor';
import type { VendorOrder } from '@features/vendor/types/order';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { loadUserFromStorage, selectUser } from '@slices/auth';
import {
  selectOrderStatus,
  selectVendorOrders,
  selectVendorOrdersPagination,
} from '@slices/order';
import { selectMyVendor } from '@slices/vendor';
import type { User } from '@custom-types/user';

const StatusBadge = ({
  label,
  type,
}: {
  label: string;
  type: 'success' | 'error' | 'warning' | 'default' | 'info';
}): JSX.Element => {
  const colors = {
    success: 'bg-green-100 text-green-700 border-green-200',
    error: 'bg-red-100 text-red-700 border-red-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200',
  };
  return (
    <span
      className={`inline-flex min-w-27.5 items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-bold shadow-sm ${colors[type]}`}
    >
      {label}
    </span>
  );
};

const getOrderStatusMeta = (
  status: number
): {
  label: string;
  type: 'success' | 'error' | 'warning' | 'default' | 'info';
} => {
  if (status === 0) return { label: 'Chờ thanh toán', type: 'warning' };
  if (status === 1) return { label: 'Đã thanh toán', type: 'info' };
  if (status === 2) return { label: 'Đã chấp nhận', type: 'success' };
  if (status === 3) return { label: 'Hoàn tất', type: 'success' };
  if (status === 4) return { label: 'Đã từ chối', type: 'error' };
  return { label: 'Không xác định', type: 'default' };
};

const canDecideOrder = (status: number): boolean => status === 1;

const getBranchDisplayName = (branch: {
  branchName?: string | null;
  name?: string | null;
  branchId: number;
}): string =>
  branch.branchName ?? branch.name ?? `Chi nhánh #${branch.branchId}`;

const formatDateTime = (value: string | null | undefined): string => {
  if (!value) return '-';
  return new Date(value).toLocaleString('vi-VN');
};

const formatCurrency = (value: number | null | undefined): string => {
  if (typeof value !== 'number') return '-';
  return `${value.toLocaleString('vi-VN')}đ`;
};

const getOrderItemAmount = (
  item: VendorOrder['items'][number]
): number | null => {
  const itemAmountCandidates = [
    item.lineAmount,
    item.finalAmount,
    item.totalAmount,
    item.amount,
    item.subtotal,
  ];

  const amountFromCandidates = itemAmountCandidates.find(
    (amount) => typeof amount === 'number'
  );

  if (typeof amountFromCandidates === 'number') {
    return amountFromCandidates;
  }

  if (typeof item.unitPrice === 'number') {
    return item.unitPrice * item.quantity;
  }

  if (typeof item.price === 'number') {
    return item.price * item.quantity;
  }

  return null;
};

const getDisplayOrderItemAmount = (
  item: VendorOrder['items'][number],
  order: VendorOrder | null
): number | null => {
  const directItemAmount = getOrderItemAmount(item);
  if (typeof directItemAmount === 'number') {
    return directItemAmount;
  }

  if (!order) return null;

  if (order.items.length === 1 && typeof order.totalAmount === 'number') {
    return order.totalAmount;
  }

  return null;
};

type SelectedBranch = number | 'all';

export default function OrderPage(): JSX.Element {
  const dispatch = useAppDispatch();
  const { onGetMyVendor } = useVendor();
  const {
    onGetVendorBranchOrders,
    onDecideVendorOrder,
    onCompleteVendorOrder,
  } = useOrder();

  const myVendor = useAppSelector(selectMyVendor);
  const currentUser = useAppSelector(selectUser);
  const orders = useAppSelector(selectVendorOrders);
  const pagination = useAppSelector(selectVendorOrdersPagination);
  const status = useAppSelector(selectOrderStatus);

  const [selectedBranchId, setSelectedBranchId] =
    useState<SelectedBranch>('all');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [detailOrder, setDetailOrder] = useState<VendorOrder | null>(null);
  const [allBranchOrders, setAllBranchOrders] = useState<VendorOrder[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [isCompletingByCode, setIsCompletingByCode] = useState(false);
  const [completeMessage, setCompleteMessage] = useState('');
  const [detailProfile, setDetailProfile] = useState<User | null>(null);

  const branches = useMemo(
    () => (myVendor?.branches ?? []).filter((branch) => branch.isActive),
    [myVendor?.branches]
  );

  useEffect(() => {
    void onGetMyVendor();
  }, [onGetMyVendor]);

  useEffect(() => {
    if (branches.length === 0) return;

    setSelectedBranchId((prev) => {
      if (prev === 'all') {
        return prev;
      }

      if (branches.some((b) => b.branchId === prev)) {
        return prev;
      }

      return 'all';
    });
  }, [branches]);

  useEffect(() => {
    if (branches.length === 0) return;

    if (selectedBranchId === 'all') {
      const fetchAllBranchesOrders = async (): Promise<void> => {
        const responses = await Promise.all(
          branches.map((branch) =>
            onGetVendorBranchOrders({
              branchId: branch.branchId,
              params: {
                pageNumber: 1,
                pageSize: 200,
              },
            })
          )
        );

        const mergedOrders = responses
          .flatMap((response) => response.items)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

        setAllBranchOrders(mergedOrders);
      };

      void fetchAllBranchesOrders();
      return;
    }

    void onGetVendorBranchOrders({
      branchId: selectedBranchId,
      params: {
        pageNumber,
        pageSize,
      },
    });
  }, [
    selectedBranchId,
    pageNumber,
    pageSize,
    branches,
    onGetVendorBranchOrders,
  ]);

  const handleBranchChange = (event: SelectChangeEvent<string>): void => {
    const nextValue = event.target.value;
    setSelectedBranchId(nextValue === 'all' ? 'all' : Number(nextValue));
    setPageNumber(1);
  };

  const handlePageChange = (page: number): void => {
    setPageNumber(page);
  };

  const handlePageSizeChange = (size: number): void => {
    setPageSize(size);
    setPageNumber(1);
  };

  const handleDecision = async (
    orderId: number,
    approve: boolean
  ): Promise<void> => {
    await onDecideVendorOrder({ orderId, approve });

    if (selectedBranchId === 'all') {
      setAllBranchOrders((prev) =>
        prev.map((order) => {
          if (order.orderId !== orderId) return order;

          return {
            ...order,
            status: approve ? 2 : 4,
            updatedAt: new Date().toISOString(),
          };
        })
      );
      return;
    }

    await onGetVendorBranchOrders({
      branchId: selectedBranchId,
      params: {
        pageNumber,
        pageSize,
      },
    });
  };

  const handleVerificationCodeChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    const sanitizedCode = event.target.value.replace(/\D/g, '').slice(0, 6);
    if (completeMessage !== '') {
      setCompleteMessage('');
    }
    setVerificationCode(sanitizedCode);
  };

  const handleCompleteOrderByCode = async (): Promise<void> => {
    if (verificationCode.length !== 6 || isCompletingByCode) {
      return;
    }

    setIsCompletingByCode(true);
    setCompleteMessage('');

    const candidateOrders = (
      selectedBranchId === 'all' ? allBranchOrders : orders
    ).filter((order) => order.status === 2);

    if (candidateOrders.length === 0) {
      setCompleteMessage('Không có đơn đã chấp nhận để hoàn tất.');
      setIsCompletingByCode(false);
      return;
    }

    try {
      let matchedOrder: VendorOrder | null = null;

      for (const order of candidateOrders) {
        try {
          await onCompleteVendorOrder({
            orderId: order.orderId,
            verificationCode,
          });
          matchedOrder = order;
          break;
        } catch {
          // Try next accepted order until one matches the verification code.
        }
      }

      if (!matchedOrder) {
        setCompleteMessage('Không tìm thấy đơn hàng khớp với mã xác minh.');
        return;
      }

      const completedOrder: VendorOrder = {
        ...matchedOrder,
        status: 3,
        updatedAt: new Date().toISOString(),
      };

      if (selectedBranchId === 'all') {
        setAllBranchOrders((prev) =>
          prev.map((order) =>
            order.orderId === completedOrder.orderId ? completedOrder : order
          )
        );
      }

      setDetailOrder(completedOrder);
      setVerificationCode('');
      setCompleteMessage('Hoàn tất đơn hàng thành công.');
    } finally {
      setIsCompletingByCode(false);
    }
  };

  const handleOpenDetail = async (order: VendorOrder): Promise<void> => {
    setDetailOrder(order);

    try {
      const profile = await dispatch(loadUserFromStorage()).unwrap();
      setDetailProfile(profile);
    } catch {
      setDetailProfile(currentUser);
    }
  };

  const handleCloseDetail = (): void => {
    setDetailOrder(null);
    setDetailProfile(null);
  };

  const columns = useMemo(
    () => [
      {
        key: 'orderId',
        label: 'Mã đơn',
        style: { width: '90px' },
      },
      {
        key: 'branchName',
        label: 'Chi nhánh',
        style: { width: '180px' },
        render: (value: unknown, row: VendorOrder): React.ReactNode => {
          if (typeof value === 'string' && value.trim() !== '') {
            return value;
          }
          return `Chi nhánh #${row.branchId}`;
        },
      },
      {
        key: 'items',
        label: 'Món ăn',
        render: (value: unknown): React.ReactNode => {
          const items = Array.isArray(value)
            ? (value as VendorOrder['items'])
            : [];

          return (
            <Box className="flex max-w-[320px] flex-wrap gap-1">
              {items.length > 0
                ? items.map((item) => (
                    <Chip
                      key={`${item.dishId}-${item.dishName}`}
                      label={`${item.dishName} x${item.quantity}`}
                      size="small"
                      variant="outlined"
                    />
                  ))
                : '-'}
            </Box>
          );
        },
      },
      {
        key: 'finalAmount',
        label: 'Thành tiền',
        style: { width: '150px' },
        render: (value: unknown): React.ReactNode =>
          typeof value === 'number' ? `${value.toLocaleString('vi-VN')}đ` : '-',
      },
      {
        key: 'isTakeAway',
        label: 'Hình thức',
        style: { width: '130px' },
        render: (value: unknown): React.ReactNode =>
          value ? 'Mang đi' : 'Tại bàn',
      },
      {
        key: 'status',
        label: 'Trạng thái',
        style: { width: '130px' },
        render: (value: unknown): React.ReactNode => {
          const orderStatus =
            typeof value === 'number' ? getOrderStatusMeta(value) : null;
          return (
            <StatusBadge
              label={orderStatus?.label ?? 'Không xác định'}
              type={orderStatus?.type ?? 'default'}
            />
          );
        },
      },
      {
        key: 'createdAt',
        label: 'Thời gian tạo',
        style: { width: '180px' },
        render: (value: unknown): React.ReactNode =>
          typeof value === 'string'
            ? new Date(value).toLocaleString('vi-VN')
            : '-',
      },
    ],
    []
  );

  const actions = [
    {
      label: (
        <VisibilityOutlinedIcon fontSize="small" className="text-blue-700" />
      ),
      menuLabel: (
        <span className="font-semibold text-blue-700">Xem chi tiết</span>
      ),
      onClick: (row: VendorOrder): void => {
        void handleOpenDetail(row);
      },
    },
    {
      label: (
        <CheckCircleOutlineIcon fontSize="small" className="text-primary-700" />
      ),
      menuLabel: <span className="text-primary-700 font-bold">Chấp nhận</span>,
      onClick: (row: VendorOrder): void => {
        void handleDecision(row.orderId, true);
      },
      show: (row: VendorOrder): boolean => canDecideOrder(row.status),
    },
    {
      label: <CancelOutlinedIcon fontSize="small" className="text-red-600" />,
      menuLabel: <span className="font-bold text-red-600">Từ chối</span>,
      onClick: (row: VendorOrder): void => {
        void handleDecision(row.orderId, false);
      },
      show: (row: VendorOrder): boolean => canDecideOrder(row.status),
    },
  ];

  const allBranchPagination = useMemo(() => {
    const totalCount = allBranchOrders.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const currentPage = Math.min(pageNumber, totalPages);

    return {
      currentPage,
      pageSize,
      totalPages,
      totalCount,
      hasPrevious: currentPage > 1,
      hasNext: currentPage < totalPages,
    };
  }, [allBranchOrders.length, pageNumber, pageSize]);

  const displayedOrders = useMemo(() => {
    if (selectedBranchId !== 'all') {
      return orders;
    }

    const start = (allBranchPagination.currentPage - 1) * pageSize;
    const end = start + pageSize;
    return allBranchOrders.slice(start, end);
  }, [
    selectedBranchId,
    orders,
    allBranchOrders,
    allBranchPagination.currentPage,
    pageSize,
  ]);

  const displayedPagination =
    selectedBranchId === 'all' ? allBranchPagination : pagination;

  return (
    <div className="font-(--font-nunito)">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-table-text-primary mb-1 text-3xl font-bold">
            Quản lý đơn hàng
          </h1>
          <p className="text-table-text-secondary text-sm">
            Theo dõi và xử lý đơn hàng theo từng chi nhánh
          </p>
        </div>

        <FormControl size="small" className="min-w-65">
          <InputLabel
            id="vendor-order-branch-label"
            sx={{
              color: 'var(--color-primary-700)',
              '&.Mui-focused': {
                color: 'var(--color-primary-700)',
              },
            }}
          >
            Chi nhánh
          </InputLabel>
          <Select
            labelId="vendor-order-branch-label"
            value={String(selectedBranchId)}
            label="Chi nhánh"
            onChange={handleBranchChange}
            disabled={branches.length === 0}
            sx={{
              color: 'var(--color-primary-700)',
              fontWeight: 700,
              '& .MuiSelect-icon': {
                color: 'var(--color-primary-700)',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--color-primary-600)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--color-primary-600)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--color-primary-600)',
                borderWidth: '1px',
              },
              '&.Mui-focused': {
                color: 'var(--color-primary-700)',
                boxShadow: 'none',
                outline: 'none',
              },
            }}
          >
            <MenuItem value="all">Tất cả chi nhánh</MenuItem>
            {branches.map((branch) => (
              <MenuItem key={branch.branchId} value={branch.branchId}>
                {getBranchDisplayName(branch)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <Box className="mb-4 flex flex-wrap items-start gap-3 rounded-xl border border-gray-100 bg-slate-50/60 p-4">
        <TextField
          label="Mã xác minh"
          placeholder="Nhập 6 số"
          value={verificationCode}
          onChange={handleVerificationCodeChange}
          size="small"
          className="w-full max-w-70"
          inputProps={{
            maxLength: 6,
            inputMode: 'numeric',
            pattern: '[0-9]*',
          }}
          sx={{
            '& .MuiInputLabel-root': {
              color: 'var(--color-primary-700)',
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: 'var(--color-primary-700)',
            },
            '& .MuiOutlinedInput-root': {
              color: 'var(--color-primary-700)',
              fontWeight: 700,
              backgroundColor: 'transparent',
              borderRadius: 1,
              padding: 0,
              height: 'auto',
              '&.Mui-focused': {
                color: 'var(--color-primary-700)',
              },
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--color-primary-600)',
            },
            '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--color-primary-600)',
            },
            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline':
              {
                borderColor: 'var(--color-primary-600)',
              },
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => void handleCompleteOrderByCode()}
          disabled={verificationCode.length !== 6 || isCompletingByCode}
          startIcon={<VerifiedUserOutlinedIcon />}
          className="bg-primary-600 hover:bg-primary-700 h-10 font-bold whitespace-nowrap text-white"
        >
          Hoàn tất đơn
        </Button>
        <Typography className="text-table-text-secondary pt-2 text-sm">
          Nhập 6 số, hệ thống tự tìm đơn đã chấp nhận có mã trùng và hoàn tất.
        </Typography>
        {completeMessage !== '' ? (
          <Typography
            className={`w-full text-sm ${completeMessage.includes('thành công') ? 'text-green-700' : 'text-red-600'}`}
          >
            {completeMessage}
          </Typography>
        ) : null}
      </Box>

      <Table
        columns={columns}
        data={displayedOrders}
        rowKey="orderId"
        actions={actions}
        loading={status === 'pending'}
        emptyMessage={
          branches.length === 0
            ? 'Chưa có chi nhánh để xem đơn hàng'
            : 'Chưa có đơn hàng nào'
        }
      />

      <Pagination
        currentPage={displayedPagination.currentPage}
        totalPages={displayedPagination.totalPages}
        totalCount={displayedPagination.totalCount}
        pageSize={displayedPagination.pageSize}
        hasPrevious={displayedPagination.hasPrevious}
        hasNext={displayedPagination.hasNext}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      <Dialog
        open={detailOrder !== null}
        onClose={handleCloseDetail}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className:
            'overflow-hidden rounded-2xl border border-gray-100 shadow-2xl',
        }}
      >
        <DialogTitle className="border-b border-gray-100 bg-gray-50/70 px-6 py-4">
          <Box className="flex items-start justify-between gap-4">
            <Box>
              <Typography className="text-table-text-primary text-xl font-bold">
                Chi tiết đơn hàng
              </Typography>
              <Typography className="text-table-text-secondary mt-1 text-sm">
                {detailOrder ? `#${detailOrder.orderId}` : '-'}
              </Typography>
            </Box>
            {detailOrder ? (
              <StatusBadge
                label={getOrderStatusMeta(detailOrder.status).label}
                type={getOrderStatusMeta(detailOrder.status).type}
              />
            ) : null}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box className="space-y-5 px-1 py-1">
            <Box className="rounded-xl border border-gray-100 bg-slate-50/60 p-4 shadow-sm">
              <Typography className="mb-4 text-xs font-bold tracking-wider text-gray-700 uppercase">
                Thông tin chung
              </Typography>
              <Box className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Box className="rounded-lg border border-gray-200/60 bg-white p-3">
                  <Typography className="text-xs font-bold tracking-wide text-gray-500 uppercase">
                    Chi nhánh
                  </Typography>
                  <Typography className="text-table-text-primary mt-1 text-sm font-semibold">
                    {detailOrder
                      ? ((): string => {
                          const branchName = detailOrder.branchName.trim();
                          return branchName.length > 0
                            ? branchName
                            : `Chi nhánh #${detailOrder.branchId}`;
                        })()
                      : '-'}
                  </Typography>
                </Box>
                <Box className="rounded-lg border border-gray-200/60 bg-white p-3">
                  <Typography className="text-xs font-bold tracking-wide text-gray-500 uppercase">
                    Hình thức nhận món
                  </Typography>
                  <Typography className="text-table-text-primary mt-1 text-sm font-semibold">
                    {detailOrder?.isTakeAway ? 'Mang đi' : 'Tại bàn'}
                  </Typography>
                </Box>
                <Box className="rounded-lg border border-gray-200/60 bg-white p-3">
                  <Typography className="text-xs font-bold tracking-wide text-gray-500 uppercase">
                    Bàn
                  </Typography>
                  <Typography className="text-table-text-primary mt-1 text-sm font-semibold">
                    {((): string => {
                      const tableName = detailOrder?.table?.trim();
                      return tableName && tableName.length > 0
                        ? tableName
                        : '-';
                    })()}
                  </Typography>
                </Box>
                <Box className="rounded-lg border border-gray-200/60 bg-white p-3">
                  <Typography className="text-xs font-bold tracking-wide text-gray-500 uppercase">
                    Thời gian tạo
                  </Typography>
                  <Typography className="text-table-text-primary mt-1 text-sm font-semibold">
                    {formatDateTime(detailOrder?.createdAt)}
                  </Typography>
                </Box>
                <Box className="rounded-lg border border-gray-200/60 bg-white p-3 sm:col-span-2">
                  <Typography className="text-xs font-bold tracking-wide text-gray-500 uppercase">
                    Người đặt đơn
                  </Typography>
                  <Typography className="text-table-text-primary mt-1 text-sm font-semibold">
                    {detailProfile?.username ??
                      `User #${detailOrder?.userId ?? '-'}`}
                  </Typography>
                </Box>
                <Box className="rounded-lg border border-gray-200/60 bg-white p-3 sm:col-span-2">
                  <Typography className="text-xs font-bold tracking-wide text-gray-500 uppercase">
                    Số điện thoại
                  </Typography>
                  <Typography className="text-table-text-primary mt-1 text-sm font-semibold">
                    {detailProfile?.phoneNumber ?? '-'}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box className="rounded-xl border border-gray-100 bg-slate-50/60 p-4 shadow-sm">
              <Typography className="mb-3 text-xs font-bold tracking-wider text-gray-700 uppercase">
                Danh sách món
              </Typography>
              <Box className="max-h-56 overflow-y-auto pr-1">
                <Box className="grid grid-cols-[minmax(0,1fr)_88px_120px] gap-2 rounded-lg border border-gray-200/80 bg-gray-100/80 px-3 py-2">
                  <Typography className="text-xs font-bold tracking-wide text-gray-600 uppercase">
                    Món
                  </Typography>
                  <Typography className="text-right text-xs font-bold tracking-wide text-gray-600 uppercase">
                    Số lượng
                  </Typography>
                  <Typography className="text-right text-xs font-bold tracking-wide text-gray-600 uppercase">
                    Tiền món
                  </Typography>
                </Box>
                <Box className="mt-2 space-y-2">
                  {(detailOrder?.items ?? []).map((item) => (
                    <Box
                      key={`${item.dishId}-${item.dishName}`}
                      className="grid grid-cols-[minmax(0,1fr)_88px_120px] items-center gap-2 rounded-lg border border-gray-200/70 bg-white px-3 py-2"
                    >
                      <Box className="min-w-0">
                        <Typography className="text-table-text-primary truncate text-sm font-semibold">
                          {item.dishName}
                        </Typography>
                        <Typography className="text-table-text-secondary text-xs">
                          Mã món: #{item.dishId}
                        </Typography>
                      </Box>
                      <Typography className="text-right text-sm font-semibold text-gray-700">
                        x{item.quantity}
                      </Typography>
                      <Typography className="text-right text-sm font-bold text-emerald-700">
                        {formatCurrency(
                          getDisplayOrderItemAmount(item, detailOrder)
                        )}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                {(detailOrder?.items?.length ?? 0) === 0 ? (
                  <Typography className="text-table-text-secondary text-sm">
                    Không có món trong đơn hàng.
                  </Typography>
                ) : null}
              </Box>
            </Box>

            <Box className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 shadow-sm">
              <Typography className="mb-3 text-xs font-bold tracking-wider text-emerald-800 uppercase">
                Thanh toán
              </Typography>
              <Box className="space-y-2">
                <Box className="flex items-center justify-between">
                  <Typography className="text-sm text-emerald-900">
                    Tổng tiền món
                  </Typography>
                  <Typography className="text-sm font-semibold text-emerald-800">
                    {formatCurrency(detailOrder?.totalAmount)}
                  </Typography>
                </Box>
                <Box className="flex items-center justify-between">
                  <Typography className="text-sm text-emerald-900">
                    Giảm giá
                  </Typography>
                  <Typography className="text-sm font-semibold text-emerald-800">
                    {formatCurrency(detailOrder?.discountAmount)}
                  </Typography>
                </Box>
                <Box className="flex items-center justify-between border-t border-emerald-200 pt-2">
                  <Typography className="text-sm font-bold text-emerald-900">
                    Thanh toán cuối cùng
                  </Typography>
                  <Typography className="text-lg font-extrabold text-emerald-700">
                    {formatCurrency(detailOrder?.finalAmount)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions className="border-t border-gray-100 bg-gray-50/50 px-6 py-3">
          <Button
            onClick={handleCloseDetail}
            variant="contained"
            className="font-(--font-nunito)"
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
