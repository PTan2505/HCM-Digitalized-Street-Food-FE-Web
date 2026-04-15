import { useEffect, useRef } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import type { Voucher, VoucherCreate } from '@custom-types/voucher';
import { VoucherSchema } from '@features/admin/utils/voucherSchema';
import type { VoucherFormData } from '@features/admin/utils/voucherSchema';
import AppModalHeader from '@components/AppModalHeader';

// ── Multi-entry schema ───────────────────────────────────────────────────────
const MultiVoucherSchema = z.object({
  entries: z.array(VoucherSchema).min(1),
});
type MultiVoucherFormData = z.infer<typeof MultiVoucherSchema>;

// ── Props ────────────────────────────────────────────────────────────────────
interface VoucherFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VoucherCreate | VoucherCreate[]) => Promise<void>;
  voucher: Voucher | null;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  fixedCampaignId?: number | null;
  campaignStartDate?: string | null;
  campaignEndDate?: string | null;
  campaignName?: string | null;
  disableCancel?: boolean;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
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

const getNowLocalMin = (): string => {
  const now = new Date();
  now.setSeconds(0, 0);
  now.setMinutes(now.getMinutes() + 1);
  return toLocalDatetimeValue(now.toISOString());
};

const makeDefaultEntry = (
  fixedCampaignId: number | null | undefined,
  fixedStartDate: string | null,
  fixedEndDate: string | null
): VoucherFormData => ({
  name: '',
  voucherCode: '',
  type: 'AMOUNT',
  description: '',
  discountValue: 0,
  maxDiscountValue: null,
  minAmountRequired: 0,
  quantity: 0,
  redeemPoint: 0,
  startDate: fixedStartDate ?? '',
  endDate: fixedEndDate ?? '',
  expiredDate: null,
  isActive: true,
  campaignId: fixedCampaignId ?? null,
});

const toPayload = (data: VoucherFormData): VoucherCreate => ({
  ...data,
  type: data.type === 'PERCENT' ? 'PERCENTAGE' : 'AMOUNT',
  startDate: toIsoZulu(data.startDate) ?? '',
  endDate: toIsoZulu(data.endDate) ?? '',
  expiredDate: null,
  redeemPoint: 0,
  description: data.description ?? null,
  maxDiscountValue:
    data.type === 'AMOUNT' ? null : (data.maxDiscountValue ?? null),
});

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  Sub-component: một section voucher trong multi-mode                    ║
// ╚══════════════════════════════════════════════════════════════════════════╝
interface VoucherEntryProps {
  index: number;
  control: ReturnType<typeof useForm<MultiVoucherFormData>>['control'];
  register: ReturnType<typeof useForm<MultiVoucherFormData>>['register'];
  errors: ReturnType<
    typeof useForm<MultiVoucherFormData>
  >['formState']['errors'];
  watch: ReturnType<typeof useForm<MultiVoucherFormData>>['watch'];
  setValue: ReturnType<typeof useForm<MultiVoucherFormData>>['setValue'];
  canRemove: boolean;
  onRemove: () => void;
  fixedStartDate: string | null;
  fixedEndDate: string | null;
  inputClass: (hasError: boolean) => string;
}

function VoucherEntry({
  index,
  control,
  register,
  errors,
  watch,
  setValue,
  canRemove,
  onRemove,
  fixedStartDate,
  fixedEndDate,
  inputClass,
}: VoucherEntryProps): React.JSX.Element {
  const prefix = `entries.${index}` as const;
  const watchedType = watch(`entries.${index}.type`);

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
    const prev = prevTypeRef.current;
    if (prev === watchedType) return;
    typeMemory.current[prev] = {
      discountValue: watch(`entries.${index}.discountValue`) ?? 0,
      maxDiscountValue: watch(`entries.${index}.maxDiscountValue`) ?? null,
    };
    const mem = typeMemory.current[watchedType];
    setValue(`entries.${index}.discountValue`, mem.discountValue, {
      shouldValidate: false,
    });
    setValue(`entries.${index}.maxDiscountValue`, mem.maxDiscountValue, {
      shouldValidate: false,
    });
    prevTypeRef.current = watchedType;
  }, [watchedType]);

  const entryErrors = errors.entries?.[index];

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
      {/* Header của entry */}
      <div className="mb-4 flex items-center gap-3">
        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{
            background: 'linear-gradient(135deg, #8bcf3f 0%, #6aaa28 100%)',
          }}
        >
          {index + 1}
        </div>
        <div className="flex-1 border-t border-dashed border-gray-200" />
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <DeleteOutlineIcon sx={{ fontSize: 14 }} />
            Xóa
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {/* Tên + Mã */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Tên voucher <span className="text-red-500">*</span>
            </label>
            <input
              {...register(`${prefix}.name`)}
              className={inputClass(!!entryErrors?.name)}
              placeholder="Nhập tên voucher"
            />
            {entryErrors?.name && (
              <p className="mt-1 text-xs text-red-500">
                {entryErrors.name.message}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Mã voucher <span className="text-red-500">*</span>
            </label>
            <input
              {...register(`${prefix}.voucherCode`)}
              className={inputClass(!!entryErrors?.voucherCode)}
              placeholder="VD: SUMMER2025"
            />
            {entryErrors?.voucherCode && (
              <p className="mt-1 text-xs text-red-500">
                {entryErrors.voucherCode.message}
              </p>
            )}
          </div>
        </div>

        {/* Loại + Giá trị + Giảm tối đa */}
        <div
          className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${watchedType === 'PERCENT' ? 'lg:grid-cols-3' : ''}`}
        >
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Loại giảm giá <span className="text-red-500">*</span>
            </label>
            <select
              {...register(`${prefix}.type`)}
              className={inputClass(!!entryErrors?.type)}
            >
              <option value="AMOUNT">Giảm theo số tiền</option>
              <option value="PERCENT">Giảm theo %</option>
            </select>
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
              name={`entries.${index}.discountValue`}
              render={({ field }) => (
                <input
                  type="text"
                  inputMode="numeric"
                  className={inputClass(!!entryErrors?.discountValue)}
                  value={
                    watchedType === 'PERCENT'
                      ? String(field.value ?? 0)
                      : formatNumberWithDots(field.value)
                  }
                  onChange={(e) => {
                    const next =
                      watchedType === 'PERCENT'
                        ? Math.min(
                            Number(e.target.value.replace(/[^0-9]/g, '')),
                            100
                          )
                        : parseNumberInput(e.target.value);
                    field.onChange(next);
                  }}
                />
              )}
            />
            {entryErrors?.discountValue && (
              <p className="mt-1 text-xs text-red-500">
                {entryErrors.discountValue.message}
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
                name={`entries.${index}.maxDiscountValue`}
                render={({ field }) => (
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Không giới hạn"
                    className={inputClass(!!entryErrors?.maxDiscountValue)}
                    value={formatNumberWithDots(field.value)}
                    onChange={(e) => {
                      const next = parseNumberInput(e.target.value);
                      field.onChange(e.target.value === '' ? null : next);
                    }}
                  />
                )}
              />
            </div>
          )}
        </div>

        {/* Đơn hàng tối thiểu + Số lượng */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Đơn hàng tối thiểu{' '}
              <span className="text-xs font-normal text-gray-500">(VNĐ)</span>{' '}
              <span className="text-red-500">*</span>
            </label>
            <Controller
              control={control}
              name={`entries.${index}.minAmountRequired`}
              render={({ field }) => (
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  className={inputClass(!!entryErrors?.minAmountRequired)}
                  value={formatNumberWithDots(field.value)}
                  onChange={(e) =>
                    field.onChange(parseNumberInput(e.target.value))
                  }
                />
              )}
            />
            {entryErrors?.minAmountRequired && (
              <p className="mt-1 text-xs text-red-500">
                {entryErrors.minAmountRequired.message}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Số lượng phát hành <span className="text-red-500">*</span>
            </label>
            <Controller
              control={control}
              name={`entries.${index}.quantity`}
              render={({ field }) => (
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  className={inputClass(!!entryErrors?.quantity)}
                  value={formatNumberWithDots(field.value)}
                  onChange={(e) =>
                    field.onChange(parseNumberInput(e.target.value))
                  }
                />
              )}
            />
            {entryErrors?.quantity && (
              <p className="mt-1 text-xs text-red-500">
                {entryErrors.quantity.message}
              </p>
            )}
          </div>
        </div>

        {/* Thời gian hiệu lực (badge chỉ đọc) */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">
            Thời gian hiệu lực{' '}
            <span className="text-xs font-normal text-gray-400">
              (theo chiến dịch)
            </span>
          </label>
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5">
            <span className="text-xs text-gray-500">Từ</span>
            <span
              className="rounded-md px-2.5 py-1 text-sm font-semibold"
              style={{
                background: '#f3fde8',
                color: '#4a7a18',
                outline: '1px solid #b8e07a',
              }}
            >
              {fixedStartDate ? fixedStartDate.replace('T', ' ') : '—'}
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
          <input type="hidden" {...register(`${prefix}.startDate`)} />
          <input type="hidden" {...register(`${prefix}.endDate`)} />
        </div>

        {/* Mô tả */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">
            Mô tả
          </label>
          <textarea
            {...register(`${prefix}.description`)}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-green-200"
            placeholder="Nhập mô tả voucher (không bắt buộc)"
          />
        </div>

        {/* isActive toggle */}
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-gray-700">
              Kích hoạt voucher
            </p>
            <p className="text-xs text-gray-500">
              Voucher sẽ hiển thị và có thể sử dụng ngay
            </p>
          </div>
          <Controller
            control={control}
            name={`entries.${index}.isActive`}
            render={({ field }) => (
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="peer sr-only"
                />
                <div
                  className="peer h-6 w-11 rounded-full after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"
                  style={{
                    backgroundColor: field.value ? '#8bcf3f' : '#d1d5db',
                    transition: 'background-color 0.2s',
                  }}
                />
              </label>
            )}
          />
        </div>
      </div>
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  Main component                                                         ║
// ╚══════════════════════════════════════════════════════════════════════════╝
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
  disableCancel = false,
}: VoucherFormModalProps): React.JSX.Element | null {
  const openedFromCampaign = fixedCampaignId !== undefined;

  const fixedStartDate = campaignStartDate
    ? toLocalDatetimeValue(campaignStartDate)
    : null;
  const fixedEndDate = campaignEndDate
    ? toLocalDatetimeValue(campaignEndDate)
    : null;

  // ╔═══════════════════════ SINGLE MODE (MarketPlace) ═══════════════════╗
  const singleForm = useForm<VoucherFormData>({
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

  const singleWatchedType = singleForm.watch('type');
  const singleWatchedIsActive = singleForm.watch('isActive');
  const singleWatchedStartDate = singleForm.watch('startDate');

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
    const prev = prevTypeRef.current;
    if (prev === singleWatchedType) return;
    typeMemory.current[prev] = {
      discountValue: singleForm.watch('discountValue') ?? 0,
      maxDiscountValue: singleForm.watch('maxDiscountValue') ?? null,
    };
    const mem = typeMemory.current[singleWatchedType];
    singleForm.setValue('discountValue', mem.discountValue, {
      shouldValidate: false,
    });
    singleForm.setValue('maxDiscountValue', mem.maxDiscountValue, {
      shouldValidate: false,
    });
    prevTypeRef.current = singleWatchedType;
  }, [singleWatchedType]);

  useEffect(() => {
    if (!isOpen || openedFromCampaign) return;
    typeMemory.current = {
      AMOUNT: {
        discountValue:
          voucher?.type === 'AMOUNT' ? (voucher.discountValue ?? 0) : 0,
        maxDiscountValue: null,
      },
      PERCENT: {
        discountValue:
          voucher?.type === 'PERCENT' ? (voucher.discountValue ?? 0) : 0,
        maxDiscountValue:
          voucher?.type === 'PERCENT'
            ? (voucher.maxDiscountValue ?? null)
            : null,
      },
    };
    prevTypeRef.current = voucher?.type ?? 'AMOUNT';
    if (voucher) {
      singleForm.reset({
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
        expiredDate: null,
        isActive: voucher.isActive,
        campaignId: voucher.campaignId,
      });
    } else {
      singleForm.reset({
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
      });
    }
  }, [isOpen]);

  const handleSingleSubmit = async (data: VoucherFormData): Promise<void> => {
    const payload: VoucherCreate = {
      ...data,
      type: data.type === 'PERCENT' ? 'PERCENTAGE' : 'AMOUNT',
      startDate: toIsoZulu(data.startDate) ?? '',
      endDate: toIsoZulu(data.endDate) ?? null,
      expiredDate: null,
      redeemPoint: data.redeemPoint ?? 0,
      campaignId: null,
      description: data.description ?? null,
      maxDiscountValue:
        data.type === 'AMOUNT' ? null : (data.maxDiscountValue ?? null),
    };
    await onSubmit(payload);
  };

  // ╔═══════════════════════ MULTI MODE (Campaign) ════════════════════════╗
  const multiForm = useForm<MultiVoucherFormData>({
    resolver: zodResolver(MultiVoucherSchema),
    defaultValues: {
      entries: [
        makeDefaultEntry(fixedCampaignId, fixedStartDate, fixedEndDate),
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: multiForm.control,
    name: 'entries',
  });

  useEffect(() => {
    if (!isOpen || !openedFromCampaign) return;
    multiForm.reset({
      entries: [
        makeDefaultEntry(fixedCampaignId, fixedStartDate, fixedEndDate),
      ],
    });
  }, [isOpen]);

  const handleMultiSubmit = async (
    data: MultiVoucherFormData
  ): Promise<void> => {
    const payloads: VoucherCreate[] = data.entries.map(toPayload);
    await onSubmit(payloads);
  };

  // ── UI helpers ──────────────────────────────────────────────────────────
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

  if (!isOpen) return null;

  // ── Render: MULTI MODE ─────────────────────────────────────────────────
  if (openedFromCampaign) {
    return (
      <Dialog
        open={isOpen}
        onClose={disableCancel ? undefined : onClose}
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
        <AppModalHeader
          title={
            voucher
              ? 'Cập nhật voucher chiến dịch'
              : 'Thêm voucher cho chiến dịch'
          }
          subtitle={campaignName ?? voucher?.name ?? ''}
          icon={<LocalOfferIcon />}
          iconTone="voucher"
          onClose={disableCancel ? undefined : onClose}
        />

        <form onSubmit={multiForm.handleSubmit(handleMultiSubmit)}>
          <DialogContent
            dividers
            sx={{ overflowY: 'auto', maxHeight: 'calc(90vh - 150px)' }}
          >
            <div className="flex flex-col gap-4">
              {fields.map((field, index) => (
                <VoucherEntry
                  key={field.id}
                  index={index}
                  control={multiForm.control}
                  register={multiForm.register}
                  errors={multiForm.formState.errors}
                  watch={multiForm.watch}
                  setValue={multiForm.setValue}
                  canRemove={fields.length > 1}
                  onRemove={() => remove(index)}
                  fixedStartDate={fixedStartDate}
                  fixedEndDate={fixedEndDate}
                  inputClass={inputClass}
                />
              ))}

              {/* Nút thêm section mới */}
              <button
                type="button"
                onClick={() =>
                  append(
                    makeDefaultEntry(
                      fixedCampaignId,
                      fixedStartDate,
                      fixedEndDate
                    )
                  )
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-3 text-sm font-semibold text-gray-500 transition-colors hover:border-[#8bcf3f] hover:bg-[#f3fde8] hover:text-[#4a7a18]"
              >
                <AddIcon sx={{ fontSize: 18 }} />
                Thêm voucher khác
              </button>
            </div>
          </DialogContent>

          <DialogActions
            sx={{ px: 3, py: 1.5, justifyContent: 'space-between' }}
          >
            <span className="text-xs text-gray-400">
              {fields.length} voucher sẽ được tạo
            </span>
            <div className="flex gap-2">
              {!disableCancel && (
                <Button onClick={onClose} color="inherit">
                  Hủy
                </Button>
              )}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={status === 'pending'}
                startIcon={
                  status === 'pending' ? <CircularProgress size={20} /> : null
                }
              >
                {`Tạo ${fields.length > 1 ? `${fields.length} ` : ''}voucher`}
              </Button>
            </div>
          </DialogActions>
        </form>
      </Dialog>
    );
  }

  // ── Render: SINGLE MODE (MarketPlace) ──────────────────────────────────
  return (
    <Dialog
      open={isOpen}
      onClose={disableCancel ? undefined : onClose}
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
      <AppModalHeader
        title={
          voucher
            ? 'Cập nhật voucher MarketPlace'
            : 'Thêm voucher mới cho MarketPlace'
        }
        subtitle={voucher?.name ?? campaignName ?? ''}
        icon={<LocalOfferIcon />}
        iconTone="voucher"
        onClose={disableCancel ? undefined : onClose}
      />

      <form onSubmit={singleForm.handleSubmit(handleSingleSubmit)}>
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
                    {...singleForm.register('name')}
                    className={inputClass(!!singleForm.formState.errors.name)}
                    placeholder="Nhập tên voucher"
                  />
                  {singleForm.formState.errors.name && (
                    <p className="mt-1 text-xs text-red-500">
                      {singleForm.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Mã voucher <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...singleForm.register('voucherCode')}
                    className={inputClass(
                      !!singleForm.formState.errors.voucherCode
                    )}
                    placeholder="VD: SUMMER2025"
                  />
                  {singleForm.formState.errors.voucherCode && (
                    <p className="mt-1 text-xs text-red-500">
                      {singleForm.formState.errors.voucherCode.message}
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
                <div
                  className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${singleWatchedType === 'PERCENT' ? 'lg:grid-cols-3' : ''}`}
                >
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">
                      Loại giảm giá <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...singleForm.register('type')}
                      className={inputClass(!!singleForm.formState.errors.type)}
                    >
                      <option value="AMOUNT">Giảm theo số tiền</option>
                      <option value="PERCENT">Giảm theo %</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">
                      Giá trị giảm <span className="text-red-500">*</span>
                      <span className="ml-1 text-xs font-normal text-gray-500">
                        {singleWatchedType === 'PERCENT' ? '(%)' : '(VNĐ)'}
                      </span>
                    </label>
                    <Controller
                      control={singleForm.control}
                      name="discountValue"
                      render={({ field }) => (
                        <input
                          type="text"
                          inputMode="numeric"
                          className={inputClass(
                            !!singleForm.formState.errors.discountValue
                          )}
                          value={
                            singleWatchedType === 'PERCENT'
                              ? String(field.value ?? 0)
                              : formatNumberWithDots(field.value)
                          }
                          onChange={(e) => {
                            const next =
                              singleWatchedType === 'PERCENT'
                                ? Math.min(
                                    Number(
                                      e.target.value.replace(/[^0-9]/g, '')
                                    ),
                                    100
                                  )
                                : parseNumberInput(e.target.value);
                            field.onChange(next);
                          }}
                        />
                      )}
                    />
                    {singleForm.formState.errors.discountValue && (
                      <p className="mt-1 text-xs text-red-500">
                        {singleForm.formState.errors.discountValue.message}
                      </p>
                    )}
                  </div>
                  {singleWatchedType === 'PERCENT' && (
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-700">
                        Giảm tối đa{' '}
                        <span className="text-xs font-normal text-gray-500">
                          (VNĐ, tùy chọn)
                        </span>
                      </label>
                      <Controller
                        control={singleForm.control}
                        name="maxDiscountValue"
                        render={({ field }) => (
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="Không giới hạn"
                            className={inputClass(
                              !!singleForm.formState.errors.maxDiscountValue
                            )}
                            value={formatNumberWithDots(field.value)}
                            onChange={(e) => {
                              const next = parseNumberInput(e.target.value);
                              field.onChange(
                                e.target.value === '' ? null : next
                              );
                            }}
                          />
                        )}
                      />
                    </div>
                  )}
                </div>
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
                      control={singleForm.control}
                      name="minAmountRequired"
                      render={({ field }) => (
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="0"
                          className={inputClass(
                            !!singleForm.formState.errors.minAmountRequired
                          )}
                          value={formatNumberWithDots(field.value)}
                          onChange={(e) =>
                            field.onChange(parseNumberInput(e.target.value))
                          }
                        />
                      )}
                    />
                    {singleForm.formState.errors.minAmountRequired && (
                      <p className="mt-1 text-xs text-red-500">
                        {singleForm.formState.errors.minAmountRequired.message}
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
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Số lượng phát hành <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    control={singleForm.control}
                    name="quantity"
                    render={({ field }) => (
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        className={inputClass(
                          !!singleForm.formState.errors.quantity
                        )}
                        value={formatNumberWithDots(field.value)}
                        onChange={(e) =>
                          field.onChange(parseNumberInput(e.target.value))
                        }
                      />
                    )}
                  />
                  {singleForm.formState.errors.quantity && (
                    <p className="mt-1 text-xs text-red-500">
                      {singleForm.formState.errors.quantity.message}
                    </p>
                  )}
                </div>

                {/* Ngày bắt đầu + kết thúc (nhập thủ công MarketPlace) */}
                <div className="grid grid-cols-1 gap-4 sm:col-span-2 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">
                      Ngày bắt đầu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      {...singleForm.register('startDate')}
                      min={voucher ? undefined : nowMin}
                      step="60"
                      className={inputClass(
                        !!singleForm.formState.errors.startDate
                      )}
                    />
                    {singleForm.formState.errors.startDate && (
                      <p className="mt-1 text-xs text-red-500">
                        {singleForm.formState.errors.startDate.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">
                      Ngày kết thúc
                    </label>
                    <input
                      type="datetime-local"
                      {...singleForm.register('endDate')}
                      min={
                        voucher ? undefined : singleWatchedStartDate || nowMin
                      }
                      step="60"
                      className={inputClass(
                        !!singleForm.formState.errors.endDate
                      )}
                    />
                    {!voucher && (
                      <p className="mt-1 text-[11px] text-gray-400 italic">
                        * Nếu không chọn, voucher sẽ tồn tại vô hạn kể từ ngày
                        bắt đầu
                      </p>
                    )}
                    {singleForm.formState.errors.endDate && (
                      <p className="mt-1 text-xs text-red-500">
                        {singleForm.formState.errors.endDate.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* ── SECTION 4: Thông tin thêm ── */}
            <div>
              {sectionLabel('Thông tin thêm')}
              <div className="flex flex-col gap-4">
                {/* Điểm đổi (chỉ MarketPlace) */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">
                      Điểm đổi{' '}
                      <span className="text-xs font-normal text-gray-500">
                        (Redeem Point)
                      </span>
                    </label>
                    <Controller
                      control={singleForm.control}
                      name="redeemPoint"
                      render={({ field }) => (
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="0"
                          className={inputClass(
                            !!singleForm.formState.errors.redeemPoint
                          )}
                          value={formatNumberWithDots(field.value)}
                          onChange={(e) =>
                            field.onChange(parseNumberInput(e.target.value))
                          }
                        />
                      )}
                    />
                    {singleForm.formState.errors.redeemPoint && (
                      <p className="mt-1 text-xs text-red-500">
                        {singleForm.formState.errors.redeemPoint.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Mô tả */}
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Mô tả
                  </label>
                  <textarea
                    {...singleForm.register('description')}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-green-200"
                    placeholder="Nhập mô tả voucher (không bắt buộc)"
                  />
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
                      {...singleForm.register('isActive')}
                      className="peer sr-only"
                    />
                    <div
                      className="peer h-6 w-11 rounded-full after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"
                      style={{
                        backgroundColor: singleWatchedIsActive
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

        <DialogActions sx={{ px: 3, py: 1 }}>
          {!disableCancel && (
            <Button onClick={onClose} color="inherit">
              Hủy
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={
              status === 'pending' ||
              (voucher !== null && !singleForm.formState.isDirty)
            }
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
