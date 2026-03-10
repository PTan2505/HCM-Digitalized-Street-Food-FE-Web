import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { JSX } from 'react';
import type { Branch } from '@features/vendor/types/vendor';
import type {
  GetWorkScheduleItem,
  WeekdayName,
} from '@features/vendor/types/workSchedule';
import {
  AddWorkScheduleSchema,
  EditWorkScheduleSchema,
} from '@features/vendor/utils/workScheduleSchema';
import type {
  AddWorkScheduleFormData,
  EditWorkScheduleFormData,
} from '@features/vendor/utils/workScheduleSchema';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import EventBusyIcon from '@mui/icons-material/EventBusy';
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
import { selectWorkSchedules, selectVendorStatus } from '@slices/vendor';

interface WorkScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: Branch | null;
}

const WEEKDAY_MAP: Record<number, WeekdayName> = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  0: 'Sunday',
};

const WEEKDAY_VI: Record<number, string> = {
  1: 'Thứ Hai',
  2: 'Thứ Ba',
  3: 'Thứ Tư',
  4: 'Thứ Năm',
  5: 'Thứ Sáu',
  6: 'Thứ Bảy',
  0: 'Chủ Nhật',
};

// Display order: Mon -> Sun
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export default function WorkScheduleModal({
  isOpen,
  onClose,
  branch,
}: WorkScheduleModalProps): JSX.Element | null {
  const {
    onGetWorkSchedules,
    onSubmitWorkSchedule,
    onUpdateWorkSchedule,
    onDeleteWorkSchedule,
  } = useVendor();

  const schedules = useAppSelector(selectWorkSchedules);
  const status = useAppSelector(selectVendorStatus);

  // Add form
  const [showAddForm, setShowAddForm] = useState(false);
  const {
    setValue: setAddValue,
    watch: watchAdd,
    reset: resetAdd,
    formState: { errors: addErrors, isValid: isAddValid },
  } = useForm<AddWorkScheduleFormData>({
    resolver: zodResolver(AddWorkScheduleSchema),
    mode: 'onChange',
    defaultValues: { weekdays: [], openTime: '06:00', closeTime: '22:00' },
  });
  const addForm = watchAdd();

  // Edit form
  const [editingId, setEditingId] = useState<number | null>(null);
  const {
    setValue: setEditValue,
    watch: watchEdit,
    reset: resetEdit,
    formState: { errors: editErrors, isValid: isEditValid },
  } = useForm<EditWorkScheduleFormData>({
    resolver: zodResolver(EditWorkScheduleSchema),
    mode: 'onChange',
    defaultValues: { openTime: '', closeTime: '' },
  });
  const editForm = watchEdit();

  // Delete confirm
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && branch) {
      void onGetWorkSchedules(branch.branchId);
      setShowAddForm(false);
      setEditingId(null);
      resetAdd({ weekdays: [], openTime: '06:00', closeTime: '22:00' });
    }
  }, [isOpen, branch, onGetWorkSchedules, resetAdd]);

  // Compute which weekdays are already scheduled
  const scheduledWeekdays = new Set(schedules.map((s) => s.weekday));

  // Compute available weekdays for adding (not yet scheduled)
  const availableWeekdays = WEEKDAY_ORDER.filter(
    (d) => !scheduledWeekdays.has(d)
  );

  const handleToggleWeekday = (day: number): void => {
    const current = addForm.weekdays;
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    setAddValue('weekdays', updated, { shouldValidate: true });
  };

  const handleSelectAll = (): void => {
    const updated =
      addForm.weekdays.length === availableWeekdays.length
        ? []
        : [...availableWeekdays];
    setAddValue('weekdays', updated, { shouldValidate: true });
  };

  const handleSubmitAdd = async (): Promise<void> => {
    if (!branch || !isAddValid) return;
    try {
      await onSubmitWorkSchedule({
        branchId: branch.branchId,
        data: {
          weekdays: addForm.weekdays,
          openTime: addForm.openTime,
          closeTime: addForm.closeTime,
        },
      });
      setShowAddForm(false);
      resetAdd({ weekdays: [], openTime: '06:00', closeTime: '22:00' });
    } catch {
      // Handle error silently
    }
  };

  // ─── Edit Schedule ──────────────────────────────────────

  const handleStartEdit = (item: GetWorkScheduleItem): void => {
    setEditingId(item.workScheduleId);
    resetEdit({
      openTime: item.openTime.slice(0, 5),
      closeTime: item.closeTime.slice(0, 5),
    });
  };

  const handleCancelEdit = (): void => {
    setEditingId(null);
  };

  const handleSaveEdit = async (item: GetWorkScheduleItem): Promise<void> => {
    if (!isEditValid) return;
    try {
      await onUpdateWorkSchedule({
        workScheduleId: item.workScheduleId,
        data: {
          weekday: item.weekday,
          openTime: editForm.openTime,
          closeTime: editForm.closeTime,
        },
      });
      setEditingId(null);
    } catch {
      // Handle error silently
    }
  };

  // ─── Delete Schedule ────────────────────────────────────

  const handleConfirmDelete = async (): Promise<void> => {
    if (confirmDeleteId === null) return;
    setConfirmDeleteId(null);
    try {
      await onDeleteWorkSchedule(confirmDeleteId);
    } catch {
      // Handle error silently
    }
  };

  // Sort schedules by weekday order
  const sortedSchedules = [...schedules].sort(
    (a, b) =>
      WEEKDAY_ORDER.indexOf(a.weekday) - WEEKDAY_ORDER.indexOf(b.weekday)
  );

  const formatTime = (time: string): string => time.slice(0, 5);

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
                Lịch làm việc
              </h2>
              <p className="mt-1 flex items-center gap-2 text-sm font-medium text-[var(--color-table-text-secondary)]">
                <span className="rounded-md bg-gray-200 px-2 py-0.5 text-xs text-gray-700">
                  #{branch.branchId}
                </span>
                {branch.name}
                {schedules.length > 0 && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                    {schedules.length}/7 ngày
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {availableWeekdays.length > 0 && !showAddForm && (
                <Tooltip title="Thêm lịch">
                  <button
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    onClick={() => setShowAddForm(true)}
                  >
                    <AddIcon fontSize="small" />
                    Thêm lịch
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
              <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50/50 p-5">
                <h3 className="mb-3 text-sm font-bold text-blue-800">
                  Thêm lịch làm việc mới
                </h3>

                {/* Weekday selection */}
                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-600">
                      Chọn ngày trong tuần
                    </label>
                    <button
                      className="text-xs font-medium text-blue-600 hover:text-blue-800"
                      onClick={handleSelectAll}
                      type="button"
                    >
                      {addForm.weekdays.length === availableWeekdays.length
                        ? 'Bỏ chọn tất cả'
                        : 'Chọn tất cả'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableWeekdays.map((day) => {
                      const isSelected = addForm.weekdays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleToggleWeekday(day)}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                            isSelected
                              ? 'border-blue-500 bg-blue-600 text-white shadow-sm'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          {WEEKDAY_VI[day]}
                        </button>
                      );
                    })}
                  </div>
                  {availableWeekdays.length === 0 && (
                    <p className="mt-1 text-xs text-amber-600">
                      Tất cả các ngày đã được lên lịch.
                    </p>
                  )}
                </div>

                {/* Time inputs */}
                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">
                      Giờ mở cửa
                    </label>
                    <input
                      type="time"
                      value={addForm.openTime}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAddValue('openTime', val, { shouldValidate: true });
                        if (addForm.closeTime && val >= addForm.closeTime) {
                          setAddValue('closeTime', '', {
                            shouldValidate: true,
                          });
                        }
                      }}
                      className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
                        addErrors.openTime
                          ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                      }`}
                    />
                    {addErrors.openTime && (
                      <p className="mt-1 text-xs text-red-500">
                        {addErrors.openTime.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">
                      Giờ đóng cửa
                    </label>
                    <input
                      type="time"
                      value={addForm.closeTime}
                      min={addForm.openTime || undefined}
                      onChange={(e) =>
                        setAddValue('closeTime', e.target.value, {
                          shouldValidate: true,
                        })
                      }
                      className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
                        addErrors.closeTime
                          ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                      }`}
                    />
                    {addErrors.closeTime && (
                      <p className="mt-1 text-xs text-red-500">
                        {addErrors.closeTime.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Form actions */}
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                    onClick={() => {
                      setShowAddForm(false);
                      resetAdd({
                        weekdays: [],
                        openTime: '06:00',
                        closeTime: '22:00',
                      });
                    }}
                    disabled={status === 'pending'}
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
                    onClick={() => void handleSubmitAdd()}
                    disabled={status === 'pending' || !isAddValid}
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

            {/* Schedule list */}
            {status === 'pending' && schedules.length === 0 ? (
              <div className="flex flex-1 items-center justify-center py-20">
                <CircularProgress />
              </div>
            ) : sortedSchedules.length === 0 && !showAddForm ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20 text-gray-400">
                <EventBusyIcon sx={{ fontSize: 64, opacity: 0.3 }} />
                <p className="text-base font-medium">Chưa có lịch làm việc</p>
                <button
                  className="flex items-center gap-2 rounded-lg border-2 border-dashed border-blue-300 px-6 py-3 text-sm font-semibold text-blue-500 transition hover:border-blue-500 hover:text-blue-700"
                  onClick={() => setShowAddForm(true)}
                >
                  <AddIcon fontSize="small" />
                  Thêm lịch làm việc đầu tiên
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedSchedules.map((item) => {
                  const isEditing = editingId === item.workScheduleId;
                  const dayName =
                    WEEKDAY_VI[item.weekday] ??
                    WEEKDAY_MAP[item.weekday] ??
                    item.weekdayName;

                  return (
                    <div
                      key={item.workScheduleId}
                      className={`flex items-center gap-4 rounded-xl border p-4 transition ${
                        isEditing
                          ? 'border-blue-300 bg-blue-50/50'
                          : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                      }`}
                    >
                      {/* Weekday badge */}
                      <div className="flex min-w-[90px] items-center justify-center">
                        <span className="inline-block rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                          {dayName}
                        </span>
                      </div>

                      {/* Time display or edit inputs */}
                      {isEditing ? (
                        <div className="flex flex-1 items-center gap-3">
                          <input
                            type="time"
                            value={editForm.openTime}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditValue('openTime', val, {
                                shouldValidate: true,
                              });
                              if (
                                editForm.closeTime &&
                                val >= editForm.closeTime
                              ) {
                                setEditValue('closeTime', '', {
                                  shouldValidate: true,
                                });
                              }
                            }}
                            className={`rounded-lg border px-3 py-1.5 text-sm outline-none focus:ring-2 ${
                              editErrors.openTime
                                ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                            }`}
                          />
                          <span className="text-sm text-gray-400">—</span>
                          <input
                            type="time"
                            value={editForm.closeTime}
                            min={editForm.openTime || undefined}
                            onChange={(e) =>
                              setEditValue('closeTime', e.target.value, {
                                shouldValidate: true,
                              })
                            }
                            className={`rounded-lg border px-3 py-1.5 text-sm outline-none focus:ring-2 ${
                              editErrors.closeTime
                                ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                            }`}
                          />
                        </div>
                      ) : (
                        <div className="flex flex-1 items-center gap-2">
                          <span className="rounded-md bg-green-50 px-2.5 py-1 text-sm font-semibold text-green-700">
                            {formatTime(item.openTime)}
                          </span>
                          <span className="text-sm text-gray-400">—</span>
                          <span className="rounded-md bg-red-50 px-2.5 py-1 text-sm font-semibold text-red-700">
                            {formatTime(item.closeTime)}
                          </span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {isEditing ? (
                          <>
                            <Tooltip title="Lưu">
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => void handleSaveEdit(item)}
                                  disabled={
                                    status === 'pending' || !isEditValid
                                  }
                                  sx={{ color: '#16a34a' }}
                                >
                                  {status === 'pending' ? (
                                    <CircularProgress
                                      size={16}
                                      sx={{ color: '#16a34a' }}
                                    />
                                  ) : (
                                    <SaveIcon fontSize="small" />
                                  )}
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Hủy">
                              <IconButton
                                size="small"
                                onClick={handleCancelEdit}
                                disabled={status === 'pending'}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : (
                          <>
                            <Tooltip title="Chỉnh sửa giờ">
                              <IconButton
                                size="small"
                                onClick={() => handleStartEdit(item)}
                                disabled={editingId !== null}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xóa">
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    setConfirmDeleteId(item.workScheduleId)
                                  }
                                  disabled={
                                    status === 'pending' || editingId !== null
                                  }
                                  sx={{
                                    color: '#ef4444',
                                    '&:hover': {
                                      bgcolor: '#fee2e2',
                                    },
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </>
                        )}
                      </div>
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
        <DialogTitle>Xác nhận xóa lịch làm việc</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa lịch làm việc này? Hành động này không thể
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
