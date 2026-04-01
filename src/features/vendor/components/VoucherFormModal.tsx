import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  CircularProgress,
} from '@mui/material';
import type { Voucher, VoucherCreate } from '@custom-types/voucher';
import { VoucherSchema } from '@features/vendor/utils/voucherSchema';
import type { VoucherFormData } from '@features/vendor/utils/voucherSchema';

interface VoucherFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VoucherCreate) => Promise<void>;
  voucher: Voucher | null;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  fixedCampaignId?: number | null;
}

const toLocalDatetimeValue = (isoStr: string | null): string => {
  if (!isoStr) return '';
  const date = new Date(isoStr);
  if (isNaN(date.getTime())) return '';
  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const find = (type: string): string | undefined =>
    parts.find((p) => p.type === type)?.value;
  return `${find('year')}-${find('month')}-${find('day')}T${find('hour')}:${find('minute')}`;
};

const toIsoZulu = (localStr: string | null): string | null => {
  if (!localStr) return null;
  const date = new Date(localStr);
  if (isNaN(date.getTime())) return null;
  return date.toISOString();
};

const formatNumberWithDots = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '';
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const parseNumberInput = (value: string): number => {
  const normalized = value.replace(/\./g, '').replace(/[^0-9]/g, '');
  return normalized === '' ? 0 : Number(normalized);
};

export default function VoucherFormModal({
  isOpen,
  onClose,
  onSubmit,
  voucher,
  status,
  fixedCampaignId,
}: VoucherFormModalProps): React.JSX.Element | null {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm<VoucherFormData>({
    resolver: zodResolver(VoucherSchema),
    defaultValues: {
      name: '',
      voucherCode: '',
      type: 'AMOUNT',
      description: '',
      discountValue: 0,
      maxDiscountValue: null,
      minAmountRequired: 0,
      quantity: 0,
      redeemPoint: 0,
      startDate: '',
      endDate: '',
      expiredDate: null,
      isActive: true,
      campaignId: null,
    },
  });

  const watchedType = watch('type');
  const startDate = watch('startDate');

  useEffect(() => {
    if (isOpen) {
      if (voucher) {
        reset({
          name: voucher.name,
          voucherCode: voucher.voucherCode,
          type: voucher.type,
          description: voucher.description ?? '',
          discountValue: voucher.discountValue,
          maxDiscountValue: voucher.maxDiscountValue,
          minAmountRequired: voucher.minAmountRequired,
          quantity: voucher.quantity,
          redeemPoint: voucher.redeemPoint,
          startDate: toLocalDatetimeValue(voucher.startDate),
          endDate: toLocalDatetimeValue(voucher.endDate),
          expiredDate: toLocalDatetimeValue(voucher.expiredDate),
          isActive: voucher.isActive,
          campaignId:
            fixedCampaignId !== undefined
              ? fixedCampaignId
              : voucher.campaignId,
        });
      } else {
        reset({
          name: '',
          voucherCode: '',
          type: 'AMOUNT',
          description: '',
          discountValue: 0,
          maxDiscountValue: null,
          minAmountRequired: 0,
          quantity: 0,
          redeemPoint: 0,
          startDate: '',
          endDate: '',
          expiredDate: null,
          isActive: true,
          campaignId: fixedCampaignId !== undefined ? fixedCampaignId : null,
        });
      }
    }
  }, [isOpen, voucher, reset, fixedCampaignId]);

  const handleFormSubmit = async (data: VoucherFormData): Promise<void> => {
    const payload: VoucherCreate = {
      ...data,
      type: data.type === 'PERCENT' ? 'PERCENTAGE' : 'AMOUNT',
      startDate: toIsoZulu(data.startDate) ?? '',
      endDate: toIsoZulu(data.endDate) ?? '',
      expiredDate: toIsoZulu(data.expiredDate),
      description: data.description ?? null,
      maxDiscountValue:
        data.type === 'AMOUNT' ? null : (data.maxDiscountValue ?? null),
    };
    await onSubmit(payload);
  };

  if (!isOpen) return null;

  const inputClass = (hasError: boolean): string =>
    `w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 ${
      hasError
        ? 'border-red-500 focus:ring-red-200'
        : 'border-gray-300 focus:ring-amber-200'
    }`;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, fontWeight: 'bold', pr: 6 }}>
        {voucher ? 'Cập nhật voucher' : 'Thêm voucher mới'}
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
          {/* <CloseIcon /> */}
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent
          dividers
          sx={{
            overflowY: 'auto',
            maxHeight: 'calc(90vh - 150px)',
          }}
        >
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Tên voucher <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('name')}
                  className={inputClass(!!errors.name)}
                  placeholder="Nhập tên voucher"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Mã voucher <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('voucherCode')}
                  className={inputClass(!!errors.voucherCode)}
                  placeholder="VD: SUMMER2025"
                />
                {errors.voucherCode && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.voucherCode.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Loại giảm giá <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('type')}
                  className={inputClass(!!errors.type)}
                >
                  <option value="AMOUNT">Giảm theo số tiền</option>
                  <option value="PERCENT">Giảm theo %</option>
                </select>
                {errors.type && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.type.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Giá trị giảm <span className="text-red-500">*</span>
                  <span className="ml-1 text-xs font-normal text-gray-500">
                    {watchedType === 'PERCENT' ? '(%)' : '(VNĐ)'}
                  </span>
                </label>
                <Controller
                  control={control}
                  name="discountValue"
                  render={({ field }) => (
                    <input
                      type="text"
                      inputMode="numeric"
                      min={0}
                      max={watchedType === 'PERCENT' ? 100 : undefined}
                      step="0.01"
                      className={inputClass(!!errors.discountValue)}
                      value={
                        watchedType === 'PERCENT'
                          ? String(field.value ?? 0)
                          : formatNumberWithDots(field.value)
                      }
                      onChange={(e) => {
                        const nextValue =
                          watchedType === 'PERCENT'
                            ? Number(e.target.value.replace(/[^0-9]/g, ''))
                            : parseNumberInput(e.target.value);
                        const clamped =
                          watchedType === 'PERCENT'
                            ? Math.min(nextValue, 100)
                            : nextValue;
                        field.onChange(clamped);
                      }}
                    />
                  )}
                />
                {errors.discountValue && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.discountValue.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Giảm tối đa (VNĐ)
                  <span className="ml-1 text-xs font-normal text-gray-500">
                    {watchedType === 'AMOUNT' ? '(Không áp dụng)' : ''}
                  </span>
                </label>
                <Controller
                  control={control}
                  name="maxDiscountValue"
                  render={({ field }) => (
                    <input
                      type="text"
                      inputMode="numeric"
                      min={0}
                      step="0.01"
                      disabled={watchedType === 'AMOUNT'}
                      className={`${inputClass(!!errors.maxDiscountValue)} ${watchedType === 'AMOUNT' ? 'cursor-not-allowed bg-gray-100' : ''}`}
                      value={
                        watchedType === 'AMOUNT'
                          ? ''
                          : formatNumberWithDots(field.value)
                      }
                      onChange={(e) => {
                        const nextValue = parseNumberInput(e.target.value);
                        field.onChange(
                          e.target.value === '' ? null : nextValue
                        );
                      }}
                    />
                  )}
                />
                {errors.maxDiscountValue && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.maxDiscountValue.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Đơn hàng tối thiểu (VNĐ){' '}
                  <span className="text-red-500">*</span>
                </label>
                <Controller
                  control={control}
                  name="minAmountRequired"
                  render={({ field }) => (
                    <input
                      type="text"
                      inputMode="numeric"
                      min={0}
                      step="0.01"
                      className={inputClass(!!errors.minAmountRequired)}
                      value={formatNumberWithDots(field.value)}
                      onChange={(e) => {
                        field.onChange(parseNumberInput(e.target.value));
                      }}
                    />
                  )}
                />
                {errors.minAmountRequired && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.minAmountRequired.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Số lượng <span className="text-red-500">*</span>
                </label>
                <Controller
                  control={control}
                  name="quantity"
                  render={({ field }) => (
                    <input
                      type="text"
                      inputMode="numeric"
                      min={0}
                      step={1}
                      className={inputClass(!!errors.quantity)}
                      value={formatNumberWithDots(field.value)}
                      onChange={(e) => {
                        field.onChange(parseNumberInput(e.target.value));
                      }}
                    />
                  )}
                />
                {errors.quantity && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.quantity.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Điểm đổi (Redeem Point)
                </label>
                <Controller
                  control={control}
                  name="redeemPoint"
                  render={({ field }) => (
                    <input
                      type="text"
                      inputMode="numeric"
                      min={0}
                      step={1}
                      className={inputClass(!!errors.redeemPoint)}
                      value={formatNumberWithDots(field.value)}
                      onChange={(e) => {
                        field.onChange(parseNumberInput(e.target.value));
                      }}
                    />
                  )}
                />
                {errors.redeemPoint && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.redeemPoint.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Ngày bắt đầu <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  {...register('startDate')}
                  step="60"
                  className={inputClass(!!errors.startDate)}
                />
                {errors.startDate && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.startDate.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Ngày kết thúc <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  {...register('endDate')}
                  min={startDate || undefined}
                  step="60"
                  className={inputClass(!!errors.endDate)}
                />
                {errors.endDate && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Ngày hết hạn (tùy chọn)
                </label>
                <input
                  type="datetime-local"
                  {...register('expiredDate')}
                  step="60"
                  className={inputClass(!!errors.expiredDate)}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Mô tả
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-200"
                placeholder="Nhập mô tả voucher"
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Trạng thái hoạt động
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  {...register('isActive')}
                  className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-300"
                />
                Kích hoạt voucher
              </label>
            </div>
          </div>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit">
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={status === 'pending'}
            startIcon={
              status === 'pending' ? <CircularProgress size={20} /> : null
            }
          >
            {voucher ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
