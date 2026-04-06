import { zodResolver } from '@hookform/resolvers/zod';
import {
  transferSchema,
  type RequestTransferFormValues,
} from '@utils/transferSchema';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Autocomplete,
  TextField,
} from '@mui/material';
import { BANK_OPTIONS } from '@constants/bank';
import type { JSX } from 'react';
import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';

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

  const bankList = useMemo(
    () =>
      Object.entries(BANK_OPTIONS)
        .map(([bankCode, bank]) => ({ bankCode, ...bank }))
        .filter((b) => b.isDisburse),
    []
  );

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
        <Box className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-8 py-5 shrink-0">
          <Box className="flex items-center gap-3">
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
        </Box>

        {/* Modal Content */}
        <Box className="flex-1 overflow-y-auto px-8 py-6">
          <Box className="flex flex-col gap-6">
            {/* Hidden description field */}
            <Box className="hidden">
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={3}
                    className="w-full resize-none rounded-xl border px-4 py-2.5 outline-none"
                    placeholder="Ví dụ: Rút doanh thu ngày hôm nay"
                  />
                )}
              />
            </Box>

            {/* Account number */}
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
                      className={`w-full rounded-xl border px-4 py-3 transition-all outline-none focus:ring-[var(--color-primary-500)] ${
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

            {/* Bank picker using MUI Autocomplete */}
            <Box>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Ngân hàng <span className="text-red-500">*</span>
              </label>
              <Controller
                control={control}
                name="toBin"
                render={({ field }) => {
                  const selectedOption =
                    bankList.find((b) => b.bin === field.value) ?? null;

                  return (
                    <Box>
                      <Autocomplete
                        {...field}
                        options={bankList}
                        value={selectedOption}
                        onChange={(_, newValue) => field.onChange(newValue?.bin ?? '')}
                        getOptionLabel={(option) => option.shortName}
                        filterOptions={(options, state) => {
                          const inputValue = state.inputValue.toLowerCase();
                          return options.filter(
                            (option) =>
                              option.shortName.toLowerCase().includes(inputValue) ||
                              option.name.toLowerCase().includes(inputValue) ||
                              option.bankCode.toLowerCase().includes(inputValue)
                          );
                        }}
                        isOptionEqualToValue={(option, value) =>
                          option.bin === value.bin
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Tìm kiếm ngân hàng..."
                            error={!!errors.toBin}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '0.75rem',
                                backgroundColor: 'white',
                                paddingRight: '9px !important',
                                '& fieldset': {
                                  borderColor: errors.toBin ? '#ef4444' : '#e5e7eb',
                                  transition: 'all 0.2s',
                                },
                                '&:hover fieldset': {
                                  borderColor: errors.toBin ? '#ef4444' : '#d1d5db',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: errors.toBin ? '#ef4444' : 'var(--color-primary-500)',
                                  borderWidth: '1px',
                                },
                                '& .MuiOutlinedInput-input': {
                                  padding: '4px 8px !important', 
                                  lineHeight: '1.5',
                                },
                              },
                            }}
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: selectedOption ? (
                                <img
                                  src={selectedOption.bankLogoUrl}
                                  alt={selectedOption.shortName}
                                  className="h-6 w-6 ml-1 object-contain rounded-sm"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <svg
                                    className="h-5 w-5 ml-1 text-gray-400 shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={1.5}
                                      d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11m16-11v11M8 10v11m8-11v11"
                                    />
                                  </svg>
                              ),
                            }}
                          />
                        )}
                        renderOption={(props, option, { selected }) => (
                          <li {...props} key={option.bin} className={`${props.className} hover:bg-gray-50 flex items-center gap-3 px-4 py-3`}>
                            <img
                              src={option.bankLogoUrl}
                              alt={option.shortName}
                              className="h-8 w-8 shrink-0 rounded object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                            <Box className="min-w-0 flex-1">
                              <Typography className={`truncate text-sm ${selected ? 'font-semibold text-[var(--color-primary-600)]' : 'font-medium text-gray-800'}`}>
                                {option.shortName}{' '}
                                <span className={selected ? 'font-normal text-[var(--color-primary-500)]/80' : 'font-normal text-gray-500'}>
                                  ({option.bankCode})
                                </span>
                              </Typography>
                            </Box>
                            {selected && (
                              <svg
                                className="h-4 w-4 shrink-0 text-[var(--color-primary-500)]"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </li>
                        )}
                        noOptionsText="Không tìm thấy ngân hàng"
                      />
                      {errors.toBin && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.toBin.message}
                        </p>
                      )}
                    </Box>
                  );
                }}
              />
            </Box>

            {/* Amount */}
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
                      className={`w-full rounded-xl border px-4 py-3 transition-all outline-none focus:ring-[var(--color-primary-500)] ${
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
        <Box className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/80 px-8 py-5 shrink-0">
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
