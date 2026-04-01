import { zodResolver } from '@hookform/resolvers/zod';
import {
  transferSchema,
  type RequestTransferFormValues,
} from '@utils/transferSchema';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Button,
  CircularProgress,
} from '@mui/material';
import type { JSX } from 'react';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';

const bankOptions = [
  'Vietcombank: 9704 36',
  'BIDV: 9704 18',
  'Techcombank: 9704 07',
  'Dong A: 9704 06',
  'Maritime Bank: 9704 26',
  'Timo by BVBank: 9704 54',
  'MBBank: 9704 22',
  'TPBank: 9704 23',
  'BVBank: 9704 32',
  'Eximbank: 9704 31',
  'VIB: 9704 41',
] as const;

interface RequestTransferModalProps {
  isOpen: boolean;
  isSubmitting?: boolean;
  currentBalance?: number | null;
  onClose: () => void;
  onSubmit: (payload: RequestTransferFormValues) => Promise<void>;
}

const formatVnd = (value?: number | null): string => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '0 VND';
  }

  return `${value.toLocaleString('vi-VN')} VND`;
};

const formatNumberWithDots = (value: number | null | undefined): string => {
  if (value === null || value === undefined || value === 0) return '';
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const parseNumberInput = (value: string): number => {
  const normalized = value.replace(/\./g, '').replace(/[^0-9]/g, '');
  return normalized === '' ? 0 : Number(normalized);
};

const extractBin = (value: string): string => {
  const raw = value.split(':')[1] ?? '';
  return raw.replace(/\s/g, '').trim();
};

export default function RequestTransferModal({
  isOpen,
  isSubmitting = false,
  currentBalance,
  onClose,
  onSubmit,
}: RequestTransferModalProps): JSX.Element | null {
  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<RequestTransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      description: 'Rút tiền từ Lowca',
      toAccountNumber: '',
      toBin: '',
      amount: 1000,
    },
  });

  useEffect(() => {
    if (!isOpen) {
      reset({
        description: 'Rút tiền từ Lowca',
        toAccountNumber: '',
        toBin: '',
        amount: 1000,
      });
    }
  }, [isOpen, reset]);

  const submitHandler = async (
    values: RequestTransferFormValues
  ): Promise<void> => {
    await onSubmit(values);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Box
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 transition-opacity"
      onClick={isSubmitting ? undefined : onClose}
    >
      <Box
        className="mx-4 flex max-h-[95vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <Box className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-8 py-5">
          <Box className="flex items-center gap-3">
            {/* <Box className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <MoneyIcon />
            </Box> */}
            <Box>
              <Typography
                variant="h2"
                className="text-xl font-bold text-[var(--color-table-text-primary)] md:text-2xl"
              >
                Yêu cầu rút tiền
              </Typography>
              <Typography className="mt-0.5 text-sm font-medium text-[var(--color-table-text-secondary)]">
                Số dư hiện tại:{' '}
                <span className="font-bold text-gray-800">
                  {formatVnd(currentBalance)}
                </span>
              </Typography>
            </Box>
          </Box>

          {/* <IconButton
            size="small"
            onClick={onClose}
            disabled={isSubmitting}
            sx={{
              bgcolor: 'white',
              border: '1px solid #e5e7eb',
              '&:hover': { bgcolor: '#f3f4f6' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton> */}
        </Box>

        {/* Modal Content */}
        <Box className="flex-1 overflow-y-auto px-8 py-6">
          <Box className="flex flex-col gap-6">
            <Box className="hidden">
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Nội dung <span className="text-red-500">*</span>
              </label>
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <>
                    <textarea
                      {...field}
                      rows={3}
                      className={`w-full resize-none rounded-xl border px-4 py-2.5 transition-all outline-none focus:ring-[var(--color-primary-500)] ${
                        errors.description
                          ? 'border-red-500 bg-white focus:border-red-500 focus:ring-2'
                          : 'border-gray-200 hover:border-gray-300 focus:border-[var(--color-primary-500)]'
                      }`}
                      placeholder="Ví dụ: Rút doanh thu ngày hôm nay"
                    />
                    {errors.description && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.description.message}
                      </p>
                    )}
                  </>
                )}
              />
            </Box>

            <Box>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Số tài khoản nhận <span className="text-red-500">*</span>
              </label>
              <Controller
                control={control}
                name="toAccountNumber"
                render={({ field }) => (
                  <>
                    <input
                      {...field}
                      type="text"
                      className={`w-full rounded-xl border px-4 py-2.5 transition-all outline-none focus:ring-[var(--color-primary-500)] ${
                        errors.toAccountNumber
                          ? 'border-red-500 bg-white focus:border-red-500 focus:ring-2'
                          : 'border-gray-200 hover:border-gray-300 focus:border-[var(--color-primary-500)]'
                      }`}
                      placeholder="Ví dụ: 987654321"
                    />
                    {errors.toAccountNumber && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.toAccountNumber.message}
                      </p>
                    )}
                  </>
                )}
              />
            </Box>

            <Box>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Ngân hàng <span className="text-red-500">*</span>
              </label>
              <Controller
                control={control}
                name="toBin"
                render={({ field }) => (
                  <>
                    <Select
                      {...field}
                      displayEmpty
                      fullWidth
                      className="rounded-xl bg-white"
                      error={!!errors.toBin}
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: errors.toBin ? '#ef4444' : '#e5e7eb',
                          borderRadius: '0.75rem',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: errors.toBin ? '#ef4444' : '#d1d5db',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: errors.toBin
                            ? '#ef4444'
                            : 'var(--color-primary-500)',
                          borderWidth: '1px',
                        },
                      }}
                    >
                      <MenuItem value="" disabled>
                        <span className="text-gray-400">Chọn ngân hàng</span>
                      </MenuItem>
                      {bankOptions.map((bank) => (
                        <MenuItem key={bank} value={extractBin(bank)}>
                          {bank.split(':')[0]}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.toBin && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.toBin.message}
                      </p>
                    )}
                  </>
                )}
              />
            </Box>

            <Box>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Số tiền rút (VNĐ) <span className="text-red-500">*</span>
              </label>
              <Controller
                control={control}
                name="amount"
                render={({ field }) => (
                  <>
                    <input
                      {...field}
                      type="text"
                      inputMode="numeric"
                      onChange={(e) =>
                        field.onChange(parseNumberInput(e.target.value))
                      }
                      value={formatNumberWithDots(field.value)}
                      className={`w-full rounded-xl border px-4 py-2.5 transition-all outline-none focus:ring-[var(--color-primary-500)] ${
                        errors.amount
                          ? 'border-red-500 bg-white focus:border-red-500 focus:ring-2'
                          : 'border-gray-200 hover:border-gray-300 focus:border-[var(--color-primary-500)]'
                      }`}
                      placeholder="Tối thiểu: 1.000"
                    />
                    {errors.amount && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.amount.message}
                      </p>
                    )}
                  </>
                )}
              />
            </Box>
          </Box>
        </Box>

        {/* Modal Actions */}
        <Box className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/80 px-8 py-5">
          <Button
            onClick={onClose}
            disabled={isSubmitting}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: 'text.secondary',
              paddingX: 3,
              bgcolor: 'white',
              border: '1px solid #e5e7eb',
              '&:hover': { bgcolor: '#f9fafb', borderColor: '#d1d5db' },
            }}
          >
            Hủy bỏ
          </Button>

          <Button
            onClick={() => void handleSubmit(submitHandler)()}
            disabled={isSubmitting}
            variant="contained"
            color="primary"
            startIcon={
              isSubmitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              paddingX: 4,
              boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)',
              '&:hover': {
                boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
              },
            }}
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
