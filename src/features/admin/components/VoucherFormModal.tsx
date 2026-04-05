import { useEffect, useRef } from 'react';
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
import CloseIcon from '@mui/icons-material/Close';
import type { Voucher, VoucherCreate } from '@custom-types/voucher';
import { VoucherSchema } from '@features/admin/utils/voucherSchema';
import type { VoucherFormData } from '@features/admin/utils/voucherSchema';

interface VoucherFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VoucherCreate) => Promise<void>;
  voucher: Voucher | null;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  /** Khi truyền vào → mở từ CampaignVoucherModal */
  fixedCampaignId?: number | null;
  campaignStartDate?: string | null;
  campaignEndDate?: string | null;
  campaignName?: string | null;
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

/** Tính min datetime-local cho hiện tại (theo VN timezone, làm tròn phút) */
const getNowLocalMin = (): string => {
  const now = new Date();
  // Làm tròn lên phút kế tiếp để tránh bị browser block
  now.setSeconds(0, 0);
  now.setMinutes(now.getMinutes() + 1);
  return toLocalDatetimeValue(now.toISOString());
};

export default function VoucherFormModal({
  isOpen,
  onClose,
  onSubmit,
  voucher,
  status,
  fixedCampaignId,
  campaignStartDate,
  campaignEndDate,
  campaignName,
}: VoucherFormModalProps): React.JSX.Element | null {
  // openedFromCampaign = true khi được gọi từ CampaignVoucherModal
  const openedFromCampaign = fixedCampaignId !== undefined;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
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
  const watchedIsActive = watch('isActive');
  const watchedStartDate = watch('startDate');

  // --- Type-switch memory: save & restore per-type values ---
  type DiscountMemory = {
    discountValue: number;
    maxDiscountValue: number | null;
  };
  const typeMemory = useRef<{
    AMOUNT: DiscountMemory;
    PERCENT: DiscountMemory;
  }>({
    AMOUNT: { discountValue: 0, maxDiscountValue: null },
    PERCENT: { discountValue: 0, maxDiscountValue: null },
  });
  const prevTypeRef = useRef<'AMOUNT' | 'PERCENT'>('AMOUNT');

  useEffect(() => {
    const prevType = prevTypeRef.current;
    if (prevType === watchedType) return;

    // Save current values into memory for the type we're leaving
    typeMemory.current[prevType] = {
      discountValue: watch('discountValue') ?? 0,
      maxDiscountValue: watch('maxDiscountValue') ?? null,
    };

    // Restore saved values for the type we're entering
    const mem = typeMemory.current[watchedType];
    setValue('discountValue', mem.discountValue, { shouldValidate: false });
    setValue('maxDiscountValue', mem.maxDiscountValue, {
      shouldValidate: false,
    });

    prevTypeRef.current = watchedType;
  }, [watchedType]);

  // Ngày từ campaign (chỉ dùng khi mở từ CampaignVoucherModal)
  const fixedStartDate = campaignStartDate
    ? toLocalDatetimeValue(campaignStartDate)
    : null;
  const fixedEndDate = campaignEndDate
    ? toLocalDatetimeValue(campaignEndDate)
    : null;

  useEffect(() => {
    if (isOpen) {
      // Reset type-switch memory whenever the form is freshly opened
      const initDiscount = voucher?.discountValue ?? 0;
      const initMax = voucher?.maxDiscountValue ?? null;
      const initType = voucher?.type ?? 'AMOUNT';
      typeMemory.current = {
        AMOUNT: {
          discountValue: initType === 'AMOUNT' ? initDiscount : 0,
          maxDiscountValue: null,
        },
        PERCENT: {
          discountValue: initType === 'PERCENT' ? initDiscount : 0,
          maxDiscountValue: initType === 'PERCENT' ? initMax : null,
        },
      };
      prevTypeRef.current = initType;
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
          redeemPoint: openedFromCampaign ? 0 : voucher.redeemPoint,
          startDate: openedFromCampaign
            ? (fixedStartDate ?? toLocalDatetimeValue(voucher.startDate))
            : toLocalDatetimeValue(voucher.startDate),
          endDate: openedFromCampaign
            ? (fixedEndDate ?? toLocalDatetimeValue(voucher.endDate))
            : toLocalDatetimeValue(voucher.endDate),
          expiredDate: null,
          isActive: voucher.isActive,
          campaignId: openedFromCampaign ? fixedCampaignId : null,
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
          startDate: openedFromCampaign ? (fixedStartDate ?? '') : '',
          endDate: openedFromCampaign ? (fixedEndDate ?? '') : '',
          expiredDate: null,
          isActive: true,
          campaignId: openedFromCampaign ? (fixedCampaignId ?? null) : null,
        });
      }
    }
  }, [
    isOpen,
    voucher,
    reset,
    openedFromCampaign,
    fixedCampaignId,
    fixedStartDate,
    fixedEndDate,
  ]);

  const handleFormSubmit = async (data: VoucherFormData): Promise<void> => {
    const payload: VoucherCreate = {
      ...data,
      type: data.type === 'PERCENT' ? 'PERCENTAGE' : 'AMOUNT',
      startDate: toIsoZulu(data.startDate) ?? '',
      endDate: toIsoZulu(data.endDate) ?? '',
      expiredDate: null,
      redeemPoint: openedFromCampaign ? 0 : (data.redeemPoint ?? 0),
      campaignId: openedFromCampaign ? (fixedCampaignId ?? null) : null,
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
        : 'border-gray-300 focus:ring-green-200'
    }`;

  const sectionLabel = (text: string): React.JSX.Element => (
    <p
      className="mb-3 text-xs font-bold uppercase"
      style={{ color: '#8bcf3f' }}
    >
      {text}
    </p>
  );

  const nowMin = getNowLocalMin();

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
        {openedFromCampaign
          ? voucher
            ? `Cập nhật "${voucher.name}" của chiến dịch ${campaignName ?? ''}`
            : `Thêm voucher cho chiến dịch ${campaignName ?? ''}`
          : voucher
            ? `Cập nhật voucher "${voucher.name}" — MarketPlace`
            : 'Thêm voucher mới cho MarketPlace'}
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

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent
          dividers
          sx={{ overflowY: 'auto', maxHeight: 'calc(90vh - 150px)' }}
        >
          <div className="flex flex-col gap-6">
            {/* ── SECTION 1: Thông tin cơ bản ── */}
            <div>
              {sectionLabel('Thông tin cơ bản')}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* ── SECTION 2: Cấu hình giảm giá ── */}
            <div>
              {sectionLabel('Cấu hình giảm giá')}
              <div className="flex flex-col gap-4">
                {/* Loại + Giá trị + Giảm tối đa (chỉ khi PERCENT) */}
                <div
                  className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${
                    watchedType === 'PERCENT' ? 'lg:grid-cols-3' : ''
                  }`}
                >
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
                  {watchedType === 'PERCENT' && (
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-700">
                        Giảm tối đa{' '}
                        <span className="text-xs font-normal text-gray-500">
                          (VNĐ, tùy chọn)
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
                            placeholder="Không giới hạn"
                            className={inputClass(!!errors.maxDiscountValue)}
                            value={formatNumberWithDots(field.value)}
                            onChange={(e) => {
                              const nextValue = parseNumberInput(
                                e.target.value
                              );
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
                  )}
                </div>

                {/* Đơn hàng tối thiểu */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">
                      Đơn hàng tối thiểu{' '}
                      <span className="text-xs font-normal text-gray-500">
                        (VNĐ)
                      </span>{' '}
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
                          placeholder="0"
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
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* ── SECTION 3: Số lượng & Thời hiệu lực ── */}
            <div>
              {sectionLabel('Số lượng & Thời hiệu lực')}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Số lượng */}
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Số lượng phát hành <span className="text-red-500">*</span>
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
                        placeholder="0"
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

                {/* Thời gian hiệu lực */}
                {openedFromCampaign ? (
                  /* Mở từ CampaignVoucherModal → badge chỉ đọc */
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-semibold text-gray-700">
                      Thời gian hiệu lực{' '}
                      <span className="text-xs font-normal text-gray-400">
                        (theo chiến dịch)
                      </span>
                    </label>
                    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                      <span className="text-xs text-gray-500">Từ</span>
                      <span
                        className="rounded-md px-2.5 py-1 text-sm font-semibold"
                        style={{
                          background: '#f3fde8',
                          color: '#4a7a18',
                          outline: '1px solid #b8e07a',
                        }}
                      >
                        {fixedStartDate
                          ? fixedStartDate.replace('T', ' ')
                          : '—'}
                      </span>
                      <span className="text-xs text-gray-500">đến</span>
                      <span
                        className="rounded-md px-2.5 py-1 text-sm font-semibold"
                        style={{
                          background: '#f3fde8',
                          color: '#4a7a18',
                          outline: '1px solid #b8e07a',
                        }}
                      >
                        {fixedEndDate ? fixedEndDate.replace('T', ' ') : '—'}
                      </span>
                    </div>
                    <input type="hidden" {...register('startDate')} />
                    <input type="hidden" {...register('endDate')} />
                  </div>
                ) : (
                  /* Mở từ Page → cho nhập, startDate không cho chọn quá khứ */
                  <div className="grid grid-cols-1 gap-4 sm:col-span-2 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-700">
                        Ngày bắt đầu <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        {...register('startDate')}
                        min={nowMin}
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
                        min={watchedStartDate || nowMin}
                        step="60"
                        className={inputClass(!!errors.endDate)}
                      />
                      {errors.endDate && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.endDate.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* ── SECTION 4: Thông tin thêm ── */}
            <div>
              {sectionLabel('Thông tin thêm')}
              <div className="flex flex-col gap-4">
                {/* Redeem Point — chỉ hiện khi mở từ Page */}
                {!openedFromCampaign && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-700">
                        Điểm đổi{' '}
                        <span className="text-xs font-normal text-gray-500">
                          (Redeem Point)
                        </span>
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
                            placeholder="0"
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
                )}

                {/* Mô tả */}
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Mô tả
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-green-200"
                    placeholder="Nhập mô tả voucher (không bắt buộc)"
                  />
                  {errors.description && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* Toggle kích hoạt */}
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Kích hoạt voucher
                    </p>
                    <p className="text-xs text-gray-500">
                      Voucher sẽ hiển thị và có thể sử dụng ngay khi được kích
                      hoạt
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      {...register('isActive')}
                      className="peer sr-only"
                    />
                    <div
                      className="peer h-6 w-11 rounded-full after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"
                      style={{
                        backgroundColor: watchedIsActive
                          ? '#8bcf3f'
                          : '#d1d5db',
                        transition: 'background-color 0.2s',
                      }}
                    />
                  </label>
                </div>
              </div>
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
