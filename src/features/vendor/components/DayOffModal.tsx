import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { JSX } from 'react';
import type { Branch } from '@features/vendor/types/vendor';
import { AddDayOffSchema } from '@features/vendor/utils/dayOffSchema';
import type { AddDayOffFormData } from '@features/vendor/utils/dayOffSchema';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import IconButton from '@mui/material/IconButton';
import {
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Tooltip,
} from '@mui/material';
import useVendor from '@features/vendor/hooks/useVendor';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectDayOffs, selectVendorStatus } from '@slices/vendor';

interface DayOffModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: Branch | null;
}

const formatDate = (dateStr: string): string => {
  const [y, m, d] = dateStr.split('T')[0].split('-');
  return `${d}/${m}/${y}`;
};

const formatTime = (time: string | null): string => {
  if (!time) return '';
  return time.slice(0, 5);
};

const getToday = (): string => new Date().toISOString().split('T')[0];

const toRFC3339 = (dateStr: string): string => `${dateStr}T00:00:00Z`;

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

  /** Returns the calendar day after the latest existing dayOff endDate, or today if none. */
  const getNextAvailableDate = (): string => {
    if (dayOffs.length === 0) return getToday();
    const maxEnd = dayOffs.reduce((max, d) => {
      const end = d.endDate.split('T')[0];
      return end > max ? end : max;
    }, '');
    const next = new Date(maxEnd + 'T00:00:00Z');
    next.setUTCDate(next.getUTCDate() + 1);
    return next.toISOString().split('T')[0];
  };

  const openAddForm = (): void => {
    const nextDate = getNextAvailableDate();
    reset({
      startDate: nextDate,
      endDate: nextDate,
      isAllDay: true,
      startTime: null,
      endTime: null,
    });
    setShowAddForm(true);
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
      startDate: getToday(),
      endDate: getToday(),
      isAllDay: true,
      startTime: null,
      endTime: null,
    },
  });

  const form = watch();

  useEffect(() => {
    if (isOpen && branch) {
      void onGetDayOffs(branch.branchId);
      setShowAddForm(false);
      reset({
        startDate: getToday(),
        endDate: getToday(),
        isAllDay: true,
        startTime: null,
        endTime: null,
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
          startDate: toRFC3339(form.startDate),
          endDate: toRFC3339(form.endDate),
          startTime: form.isAllDay ? null : form.startTime || null,
          endTime: form.isAllDay ? null : form.endTime || null,
        },
      });
      setShowAddForm(false);
      reset({
        startDate: getToday(),
        endDate: getToday(),
        isAllDay: true,
        startTime: null,
        endTime: null,
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
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-8 py-5">
            <div>
              <h2 className="text-xl font-bold text-[var(--color-table-text-primary)] md:text-2xl">
                Ngày nghỉ
              </h2>
              <p className="mt-1 flex items-center gap-2 text-sm font-medium text-[var(--color-table-text-secondary)]">
                <span className="rounded-md bg-gray-200 px-2 py-0.5 text-xs text-gray-700">
                  #{branch.branchId}
                </span>
                {branch.name}
                {dayOffs.length > 0 && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                    {dayOffs.length} đợt nghỉ
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!showAddForm && (
                <Tooltip title="Thêm ngày nghỉ">
                  <button
                    className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600"
                    onClick={openAddForm}
                  >
                    <AddIcon fontSize="small" />
                    Thêm ngày nghỉ
                  </button>
                </Tooltip>
              )}
              <IconButton
                size="small"
                onClick={onClose}
                sx={{
                  bgcolor: 'white',
                  border: '1px solid #f3f4f6',
                  '&:hover': { bgcolor: '#f3f4f6' },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-1 flex-col overflow-y-auto px-8 py-6">
            {/* Add Form */}
            {showAddForm && (
              <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/50 p-5">
                <h3 className="mb-4 text-sm font-bold text-amber-800">
                  Thêm ngày nghỉ mới
                </h3>

                {/* Date range */}
                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">
                      Ngày bắt đầu
                    </label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        setValue('startDate', val, { shouldValidate: true });
                        if (form.endDate && val > form.endDate) {
                          setValue('endDate', val, { shouldValidate: true });
                        }
                        const end =
                          val > (form.endDate || '')
                            ? val
                            : form.endDate || val;
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
                      Ngày kết thúc
                    </label>
                    <input
                      type="date"
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

                {/* All-day toggle */}
                <div className="mb-4">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.isAllDay}
                      onChange={(e) => {
                        setValue('isAllDay', e.target.checked, {
                          shouldValidate: true,
                        });
                        if (e.target.checked) {
                          setValue('startTime', null, {
                            shouldValidate: true,
                          });
                          setValue('endTime', null, { shouldValidate: true });
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300 accent-amber-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">
                      Nghỉ cả ngày
                    </span>
                  </label>
                </div>

                {/* Time inputs (only when not all-day) */}
                {!form.isAllDay && (
                  <div className="mb-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-600">
                        Giờ bắt đầu nghỉ
                      </label>
                      <input
                        type="time"
                        value={form.startTime || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setValue('startTime', val || null, {
                            shouldValidate: true,
                          });
                          if (
                            form.startDate === form.endDate &&
                            form.endTime &&
                            val >= form.endTime
                          ) {
                            setValue('endTime', null, {
                              shouldValidate: true,
                            });
                          }
                        }}
                        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
                          errors.startTime
                            ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                            : 'border-gray-300 focus:border-amber-500 focus:ring-amber-200'
                        }`}
                      />
                      {errors.startTime && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.startTime.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-600">
                        Giờ hết nghỉ
                      </label>
                      <input
                        type="time"
                        value={form.endTime || ''}
                        min={form.startTime || undefined}
                        onChange={(e) =>
                          setValue('endTime', e.target.value || null, {
                            shouldValidate: true,
                          })
                        }
                        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
                          errors.endTime
                            ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                            : 'border-gray-300 focus:border-amber-500 focus:ring-amber-200'
                        }`}
                      />
                      {errors.endTime && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.endTime.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}

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
                <button
                  className="flex items-center gap-2 rounded-lg border-2 border-dashed border-amber-300 px-6 py-3 text-sm font-semibold text-amber-500 transition hover:border-amber-500 hover:text-amber-700"
                  onClick={openAddForm}
                >
                  <AddIcon fontSize="small" />
                  Thêm ngày nghỉ đầu tiên
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedDayOffs.map((item) => {
                  const isSingleDay =
                    item.startDate.split('T')[0] === item.endDate.split('T')[0];
                  const hasTime =
                    item.startTime !== null || item.endTime !== null;

                  return (
                    <div
                      key={item.dayOffId}
                      className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 transition hover:border-gray-200 hover:shadow-sm"
                    >
                      {/* Date & time display */}
                      <div className="flex flex-1 flex-wrap items-center gap-2">
                        <span className="rounded-md bg-amber-50 px-2.5 py-1 text-sm font-semibold text-amber-700">
                          {formatDate(item.startDate)}
                        </span>
                        {!isSingleDay && (
                          <>
                            <span className="text-sm text-gray-400">—</span>
                            <span className="rounded-md bg-amber-50 px-2.5 py-1 text-sm font-semibold text-amber-700">
                              {formatDate(item.endDate)}
                            </span>
                          </>
                        )}
                        {hasTime ? (
                          <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                            <AccessTimeIcon sx={{ fontSize: 12 }} />
                            {formatTime(item.startTime)} —{' '}
                            {formatTime(item.endTime)}
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                            Cả ngày
                          </span>
                        )}
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
      <Dialog
        open={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
      >
        <DialogTitle>Xác nhận xóa ngày nghỉ</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa ngày nghỉ này? Hành động này không thể
            hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteId(null)} color="primary">
            Hủy
          </Button>
          <Button
            onClick={() => void handleConfirmDelete()}
            color="error"
            variant="contained"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
