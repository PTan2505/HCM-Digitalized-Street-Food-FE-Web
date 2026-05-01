import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { JSX } from 'react';
import type { Branch } from '@features/vendor/types/vendor';
import { AddDayOffSchema } from '@features/vendor/utils/dayOffSchema';
import type { AddDayOffFormData } from '@features/vendor/utils/dayOffSchema';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import IconButton from '@mui/material/IconButton';
import { CircularProgress, Tooltip } from '@mui/material';
import DeleteConfirmationDialog from '@components/ui/DeleteConfirmationDialog';
import useVendor from '@features/vendor/hooks/useVendor';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectDayOffs, selectVendorStatus } from '@slices/vendor';
import VendorModalHeader from '@features/vendor/components/VendorModalHeader';

interface DayOffModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: Branch | null;
}

/** Format "YYYY-MM-DDTHH:mm" → "DD/MM/YYYY HH:mm" */
const formatDateTime = (iso: string): string => {
  const [datePart, timePart] = iso.split('T');
  if (!datePart) return iso;
  const [y, m, d] = datePart.split('-');
  const time = timePart ? timePart.slice(0, 5) : '';
  return time ? `${d}/${m}/${y} ${time}` : `${d}/${m}/${y}`;
};

const getLocalDatetimeNow = (): string => {
  const now = new Date();
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

/** Expand a dayOff's date range into individual YYYY-MM-DD strings */
const expandRange = (startIso: string, endIso: string): string[] => {
  const dates: string[] = [];
  const cur = new Date(startIso.split('T')[0] + 'T00:00:00Z');
  const end = new Date(endIso.split('T')[0] + 'T00:00:00Z');
  while (cur <= end) {
    dates.push(cur.toISOString().split('T')[0]);
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return dates;
};

export default function DayOffModal({
  isOpen,
  onClose,
  branch,
}: DayOffModalProps): JSX.Element | null {
  const { onGetDayOffs, onSubmitDayOff, onDeleteDayOff } = useVendor();

  const dayOffs = useAppSelector(selectDayOffs);
  const status = useAppSelector(selectVendorStatus);
  const [showAddForm, setShowAddForm] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const occupiedDates = useMemo<Set<string>>(() => {
    const set = new Set<string>();
    dayOffs.forEach((d) =>
      expandRange(d.startDate, d.endDate).forEach((date) => set.add(date))
    );
    return set;
  }, [dayOffs]);

  const hasRangeOverlap = (start: string, end: string): boolean => {
    const days = expandRange(start, end);
    return days.some((d) => occupiedDates.has(d));
  };

  const {
    setValue,
    watch,
    reset,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = useForm<AddDayOffFormData>({
    resolver: zodResolver(AddDayOffSchema),
    mode: 'onChange',
    defaultValues: {
      startDate: getLocalDatetimeNow(),
      endDate: getLocalDatetimeNow(),
    },
  });

  const form = watch();

  const openAddForm = (): void => {
    reset({
      startDate: getLocalDatetimeNow(),
      endDate: getLocalDatetimeNow(),
    });
    setShowAddForm(true);
  };

  useEffect(() => {
    if (isOpen && branch) {
      void onGetDayOffs(branch.branchId);
      setShowAddForm(false);
      reset({
        startDate: getLocalDatetimeNow(),
        endDate: getLocalDatetimeNow(),
      });
    }
  }, [isOpen, branch, onGetDayOffs, reset]);

  // ─── Submit ─────────────────────────────────────────────

  const handleSubmitAdd = async (): Promise<void> => {
    if (!branch || !isValid) return;
    if (hasRangeOverlap(form.startDate, form.endDate)) return;
    try {
      await onSubmitDayOff({
        branchId: branch.branchId,
        data: {
          startDate: form.startDate,
          endDate: form.endDate,
        },
      });
      setShowAddForm(false);
      reset({
        startDate: getLocalDatetimeNow(),
        endDate: getLocalDatetimeNow(),
      });
    } catch {
      // silent
    }
  };

  // ─── Delete ─────────────────────────────────────────────

  const handleConfirmDelete = async (): Promise<void> => {
    if (confirmDeleteId === null) return;
    setConfirmDeleteId(null);
    try {
      await onDeleteDayOff(confirmDeleteId);
    } catch {
      // silent
    }
  };

  const sortedDayOffs = [...dayOffs].sort((a, b) =>
    a.startDate.localeCompare(b.startDate)
  );

  if (!isOpen || !branch) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        onClick={onClose}
      >
        <div
          className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <VendorModalHeader
            title="Ngày nghỉ"
            subtitle={`${branch.name}${dayOffs.length > 0 ? ` - ${dayOffs.length.toString()} đợt nghỉ` : ''}`}
            icon={<EventBusyIcon />}
            iconTone="branch"
            onClose={onClose}
            rightActions={
              !showAddForm ? (
                <Tooltip title="Thêm ngày nghỉ">
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600"
                    onClick={openAddForm}
                  >
                    <AddIcon fontSize="small" />
                    Thêm ngày nghỉ
                  </button>
                </Tooltip>
              ) : null
            }
          />

          {/* Body */}
          <div className="flex flex-1 flex-col overflow-y-auto px-8 py-6">
            {/* Add Form */}
            {showAddForm && (
              <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/50 p-5">
                <h3 className="mb-4 text-sm font-bold text-amber-800">
                  Thêm ngày nghỉ mới
                </h3>

                {/* Datetime range */}
                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">
                      Thời điểm bắt đầu
                    </label>
                    <input
                      type="datetime-local"
                      value={form.startDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        setValue('startDate', val, { shouldValidate: true });
                        if (form.endDate && val >= form.endDate) {
                          setValue('endDate', val, { shouldValidate: true });
                        }
                        const end =
                          val >= (form.endDate ?? '')
                            ? val
                            : (form.endDate ?? val);
                        if (hasRangeOverlap(val, end)) {
                          setError('startDate', {
                            message:
                              'Khoảng ngày này trùng với đợt nghỉ đã có!',
                          });
                          setError('endDate', {
                            message:
                              'Khoảng ngày này trùng với đợt nghỉ đã có!',
                          });
                        } else {
                          clearErrors(['startDate', 'endDate']);
                        }
                      }}
                      className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
                        errors.startDate
                          ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                          : 'border-gray-300 focus:border-amber-500 focus:ring-amber-200'
                      }`}
                    />
                    {errors.startDate && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.startDate.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">
                      Thời điểm kết thúc
                    </label>
                    <input
                      type="datetime-local"
                      value={form.endDate}
                      min={form.startDate || undefined}
                      onChange={(e) => {
                        const val = e.target.value;
                        setValue('endDate', val, { shouldValidate: true });
                        if (val && form.startDate) {
                          if (hasRangeOverlap(form.startDate, val)) {
                            setError('startDate', {
                              message:
                                'Khoảng ngày này trùng với đợt nghỉ đã có!',
                            });
                            setError('endDate', {
                              message:
                                'Khoảng ngày này trùng với đợt nghỉ đã có!',
                            });
                          } else {
                            clearErrors(['startDate', 'endDate']);
                          }
                        }
                      }}
                      className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
                        errors.endDate
                          ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                          : 'border-gray-300 focus:border-amber-500 focus:ring-amber-200'
                      }`}
                    />
                    {errors.endDate && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.endDate.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Form actions */}
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                    onClick={() => setShowAddForm(false)}
                    disabled={status === 'pending'}
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 disabled:opacity-50"
                    onClick={() => void handleSubmitAdd()}
                    disabled={status === 'pending' || !isValid}
                  >
                    {status === 'pending' ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <SaveIcon fontSize="small" />
                    )}
                    {status === 'pending' ? 'Đang lưu...' : 'Lưu'}
                  </button>
                </div>
              </div>
            )}

            {/* Day-off list */}
            {status === 'pending' && dayOffs.length === 0 ? (
              <div className="flex flex-1 items-center justify-center py-20">
                <CircularProgress />
              </div>
            ) : sortedDayOffs.length === 0 && !showAddForm ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20 text-gray-400">
                <EventBusyIcon sx={{ fontSize: 64, opacity: 0.3 }} />
                <p className="text-base font-medium">Chưa có ngày nghỉ</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedDayOffs.map((item) => {
                  return (
                    <div
                      key={item.dayOffId}
                      className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 transition hover:border-gray-200 hover:shadow-sm"
                    >
                      {/* Date & time display */}
                      <div className="flex flex-1 flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-1 text-sm font-semibold text-amber-700">
                          <AccessTimeIcon sx={{ fontSize: 14 }} />
                          {formatDateTime(item.startDate)}
                        </span>
                        <span className="text-sm text-gray-400">—</span>
                        <span className="flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-1 text-sm font-semibold text-amber-700">
                          <AccessTimeIcon sx={{ fontSize: 14 }} />
                          {formatDateTime(item.endDate)}
                        </span>
                      </div>

                      {/* Delete action */}
                      <Tooltip title="Xóa ngày nghỉ">
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => setConfirmDeleteId(item.dayOffId)}
                            disabled={status === 'pending'}
                            sx={{
                              color: '#ef4444',
                              '&:hover': { bgcolor: '#fee2e2' },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <DeleteConfirmationDialog
        open={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa ngày nghỉ"
        confirmationMessage={
          <>
            Bạn có chắc chắn muốn xóa ngày nghỉ này? Hành động này không thể
            hoàn tác.
          </>
        }
      />
    </>
  );
}
