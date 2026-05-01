import { useEffect, useMemo, useRef, useState } from 'react';
import type { JSX } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Branch } from '@features/vendor/types/vendor';
import type {
  GetWorkScheduleItem,
  WeekdayName,
} from '@features/vendor/types/workSchedule';
import {
  AddWorkScheduleSchema,
  type AddWorkScheduleFormData,
  EditWorkScheduleSchema,
  type EditWorkScheduleFormData,
} from '@features/vendor/utils/workScheduleSchema';
import WorkScheduleDeleteConfirmDialog from '@features/manager/components/WorkScheduleDeleteConfirmDialog';
import WorkScheduleRow from '@features/manager/components/WorkScheduleRow';
import useBranchManagement from '@features/manager/hooks/useBranchManagement';
import { getManagerWorkScheduleManagementTourSteps } from '@features/manager/utils/workScheduleManagementTourSteps';
import useVendor from '@features/vendor/hooks/useVendor';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectVendorStatus, selectWorkSchedules } from '@slices/vendor';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import {
  type Controls,
  EVENTS,
  Joyride,
  STATUS,
  type EventData,
} from 'react-joyride';

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

const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export default function WorkScheduleManagementPage(): JSX.Element {
  const { onGetManagerMyBranch } = useBranchManagement();
  const {
    onGetWorkSchedules,
    onUpdateWorkSchedule,
    onDeleteWorkSchedule,
    onSubmitWorkSchedule,
  } = useVendor();

  const schedules = useAppSelector(selectWorkSchedules);
  const status = useAppSelector(selectVendorStatus);

  const [branch, setBranch] = useState<Branch | null>(null);
  const [isLoadingBranch, setIsLoadingBranch] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [sortedSchedules, setSortedSchedules] = useState<GetWorkScheduleItem[]>(
    []
  );
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [tourInstanceKey, setTourInstanceKey] = useState(0);

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

  // Add form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [addingDay, setAddingDay] = useState<number | null>(null);

  const {
    setValue: setAddValue,
    watch: watchAdd,
    reset: resetAdd,
    formState: { errors: addErrors, isValid: isAddValid },
  } = useForm<AddWorkScheduleFormData>({
    resolver: zodResolver(AddWorkScheduleSchema),
    mode: 'onChange',
    defaultValues: { weekdays: [], openTime: '06:00', closeTime: '17:00' },
  });
  const addForm = watchAdd();

  const handleStartAdd = (day: number) => {
    setAddingDay(day);

    let defaultOpen = '06:00';
    let defaultClose = '17:00';

    const daySchedules = schedules.filter((s) => s.weekday === day);
    if (daySchedules.length > 0) {
      let maxClose = '00:00';
      for (const s of daySchedules) {
        const cTime = s.closeTime.slice(0, 5);
        if (cTime > maxClose) {
          maxClose = cTime;
        }
      }

      const [hourStr, minStr] = maxClose.split(':');
      const hour = parseInt(hourStr, 10);

      if (hour < 23) {
        const openHour = hour + 1;
        defaultOpen = `${openHour.toString().padStart(2, '0')}:${minStr}`;

        const closeHour = Math.min(23, openHour + 4);
        defaultClose = `${closeHour.toString().padStart(2, '0')}:${closeHour === 23 ? '59' : minStr}`;
      } else {
        defaultOpen = maxClose;
        defaultClose = '23:59';
      }
    }

    resetAdd({
      weekdays: [day],
      openTime: defaultOpen,
      closeTime: defaultClose,
    });
  };

  const handleCancelAdd = () => {
    setAddingDay(null);
    resetAdd({ weekdays: [], openTime: '06:00', closeTime: '17:00' });
  };

  const handleToggleWeekday = (day: number): void => {
    const current = addForm.weekdays;
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    setAddValue('weekdays', updated, { shouldValidate: true });
  };

  const handleSelectAll = (): void => {
    const updated =
      addForm.weekdays.length === WEEKDAY_ORDER.length
        ? []
        : [...WEEKDAY_ORDER];
    setAddValue('weekdays', updated, { shouldValidate: true });
  };

  const handleSubmitAdd = async (): Promise<void> => {
    const isGlobalAdd = showAddForm;
    const weekdaysToSubmit = isGlobalAdd
      ? addForm.weekdays
      : addingDay !== null
        ? [addingDay]
        : [];

    if (!branch || !isAddValid || weekdaysToSubmit.length === 0) return;

    try {
      await onSubmitWorkSchedule({
        branchId: branch.branchId,
        data: {
          weekdays: weekdaysToSubmit,
          openTime: addForm.openTime,
          closeTime: addForm.closeTime,
        },
      });
      if (isGlobalAdd) {
        setShowAddForm(false);
      } else {
        setAddingDay(null);
      }
      resetAdd({ weekdays: [], openTime: '06:00', closeTime: '17:00' });
    } catch {
      // Handle error silently
    }
  };

  const addFormConflictError = useMemo(() => {
    if (
      !addForm.openTime ||
      !addForm.closeTime ||
      addForm.weekdays.length === 0
    )
      return null;

    for (const day of addForm.weekdays) {
      const daySchedules = schedules.filter((s) => s.weekday === day);
      for (const s of daySchedules) {
        const sOpen = s.openTime.slice(0, 5);
        const sClose = s.closeTime.slice(0, 5);
        if (addForm.openTime < sClose && sOpen < addForm.closeTime) {
          return `Khung giờ bị trùng lặp với ca làm việc hiện tại vào ${WEEKDAY_VI[day] ?? 'ngày đã chọn'}.`;
        }
      }
    }
    return null;
  }, [addForm.openTime, addForm.closeTime, addForm.weekdays, schedules]);

  useEffect(() => {
    const loadBranchAndSchedules = async (): Promise<void> => {
      setIsLoadingBranch(true);
      setLoadingError(null);

      try {
        const managerBranch = await onGetManagerMyBranch();
        setBranch(managerBranch);
        await onGetWorkSchedules(managerBranch.branchId);
      } catch {
        setLoadingError('Không thể tải dữ liệu chi nhánh hoặc lịch hoạt động.');
      } finally {
        setIsLoadingBranch(false);
      }
    };

    void loadBranchAndSchedules();
  }, [onGetManagerMyBranch, onGetWorkSchedules]);

  const handleStartEdit = (item: GetWorkScheduleItem): void => {
    setEditingId(item.workScheduleId);
    resetEdit({
      openTime: item.openTime.slice(0, 5),
      closeTime: item.closeTime.slice(0, 5),
    });
  };

  const handleCancelEdit = (): void => {
    setEditingId(null);
    resetEdit({ openTime: '', closeTime: '' });
  };

  const handleSaveEdit = async (item: GetWorkScheduleItem): Promise<void> => {
    if (!isEditValid) {
      return;
    }

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
      // Toast is handled by api interceptor.
    }
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (confirmDeleteId === null) {
      return;
    }

    const deletingId = confirmDeleteId;
    setConfirmDeleteId(null);
    try {
      await onDeleteWorkSchedule(deletingId);
      const nextSchedules = sortedSchedulesRef.current.filter(
        (item) => item.workScheduleId !== deletingId
      );
      sortedSchedulesRef.current = nextSchedules;
      setSortedSchedules(nextSchedules);
    } catch {
      // Toast is handled by api interceptor.
    }
  };

  const sortedSchedulesRef = useRef<GetWorkScheduleItem[]>([]);

  useEffect(() => {
    const nextSchedules = [...schedules].sort(
      (a, b) =>
        WEEKDAY_ORDER.indexOf(a.weekday) - WEEKDAY_ORDER.indexOf(b.weekday)
    );
    sortedSchedulesRef.current = nextSchedules;
    setSortedSchedules(nextSchedules);
  }, [schedules]);

  const formatTime = (time: string): string => time.slice(0, 5);

  const startWorkScheduleTour = (): void => {
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
    return getManagerWorkScheduleManagementTourSteps({
      hasRows: sortedSchedules.length > 0,
    });
  }, [sortedSchedules.length]);

  return (
    <div className="font-(--font-nunito)">
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

      <div className="mb-6" data-tour="manager-work-schedule-header">
        <div className="mb-1 flex items-start gap-2">
          <h1 className="text-table-text-primary text-3xl font-bold">
            Quản lý thời gian hoạt động
          </h1>
          <button
            type="button"
            onClick={startWorkScheduleTour}
            aria-label="Mở hướng dẫn quản lý thời gian hoạt động"
            title="Hướng dẫn"
            className="text-primary-700 hover:text-primary-800 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
          >
            <HelpOutlineIcon sx={{ fontSize: 18 }} />
          </button>
        </div>
        <p className="text-table-text-secondary text-sm">
          Xem và cập nhật giờ mở cửa, đóng cửa theo từng ngày trong tuần
        </p>
      </div>

      {isLoadingBranch ? (
        <Box className="flex items-center justify-center rounded-lg border border-gray-200 bg-white py-16">
          <CircularProgress />
        </Box>
      ) : loadingError ? (
        <Alert severity="error">{loadingError}</Alert>
      ) : !branch ? (
        <Box className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-600">
          Không có chi nhánh nào được phân công cho bạn.
        </Box>
      ) : (
        <Box className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div
            className="mb-5 flex flex-wrap items-center justify-between gap-3"
            data-tour="manager-work-schedule-summary"
          >
            <div>
              <h2 className="text-table-text-primary text-lg font-bold">
                Chi nhánh {branch.name}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              {schedules.length === 0 && !showAddForm && (
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                  onClick={() => setShowAddForm(true)}
                >
                  <AddIcon fontSize="small" />
                  Thêm lịch
                </button>
              )}
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                {new Set(sortedSchedules.map((s) => s.weekday)).size}/7 ngày
              </span>
            </div>
          </div>

          {showAddForm && (
            <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50/50 p-5">
              <h3 className="mb-3 text-sm font-bold text-blue-800">
                Thêm thời gian hoạt động mới
              </h3>

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
                    {addForm.weekdays.length === WEEKDAY_ORDER.length
                      ? 'Bỏ chọn tất cả'
                      : 'Chọn tất cả'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAY_ORDER.map((day) => {
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
              </div>

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

              {addFormConflictError && (
                <div className="mb-4 rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-600">
                  {addFormConflictError}
                </div>
              )}
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                  onClick={() => {
                    setShowAddForm(false);
                    resetAdd({
                      weekdays: [],
                      openTime: '06:00',
                      closeTime: '17:00',
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
                  disabled={
                    status === 'pending' ||
                    !isAddValid ||
                    !!addFormConflictError ||
                    addForm.weekdays.length === 0
                  }
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

          {status === 'pending' && sortedSchedules.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <CircularProgress />
            </div>
          ) : sortedSchedules.length === 0 && !showAddForm ? (
            <div
              className="flex flex-col items-center justify-center gap-4 py-20 text-gray-400"
              data-tour="manager-work-schedule-list"
            >
              <EventBusyIcon sx={{ fontSize: 64, opacity: 0.3 }} />
              <p className="text-base font-medium">
                Chưa có thời gian hoạt động cho chi nhánh này
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Thêm lịch ngay
              </button>
            </div>
          ) : sortedSchedules.length > 0 ? (
            <div className="space-y-4" data-tour="manager-work-schedule-list">
              {WEEKDAY_ORDER.map((day) => {
                const daySchedules = sortedSchedules.filter(
                  (s) => s.weekday === day
                );

                const dayName =
                  WEEKDAY_VI[day] ?? WEEKDAY_MAP[day] ?? 'Không xác định';

                return (
                  <div
                    key={day}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 bg-slate-50 px-4 py-2.5">
                      <span className="text-sm font-bold text-slate-700">
                        {dayName}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleStartAdd(day)}
                        disabled={addingDay !== null || editingId !== null}
                        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 disabled:opacity-50 disabled:hover:bg-transparent"
                      >
                        <AddIcon sx={{ fontSize: 16 }} />
                        Thêm ca
                      </button>
                    </div>
                    <div className="flex flex-col gap-1 p-2">
                      {daySchedules.length === 0 && addingDay !== day && (
                        <div className="py-3 text-center text-sm text-gray-400 italic">
                          Chưa có ca làm việc
                        </div>
                      )}
                      {daySchedules.map((item, index) => {
                        const isEditing = editingId === item.workScheduleId;

                        let editConflictError: string | null = null;
                        if (
                          isEditing &&
                          editForm.openTime &&
                          editForm.closeTime
                        ) {
                          for (const s of daySchedules) {
                            if (s.workScheduleId !== item.workScheduleId) {
                              const sOpen = s.openTime.slice(0, 5);
                              const sClose = s.closeTime.slice(0, 5);
                              if (
                                editForm.openTime < sClose &&
                                sOpen < editForm.closeTime
                              ) {
                                editConflictError =
                                  'Khung giờ bị trùng lặp với ca làm việc khác trong ngày.';
                                break;
                              }
                            }
                          }
                        }

                        return (
                          <WorkScheduleRow
                            key={item.workScheduleId}
                            item={item}
                            isEditing={isEditing}
                            status={status}
                            isEditValid={isEditValid}
                            editForm={editForm}
                            editErrors={editErrors}
                            formatTime={formatTime}
                            onOpenTimeChange={(val) => {
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
                            onCloseTimeChange={(val) => {
                              setEditValue('closeTime', val, {
                                shouldValidate: true,
                              });
                            }}
                            onSave={() => {
                              void handleSaveEdit(item);
                            }}
                            onCancel={handleCancelEdit}
                            onStartEdit={() => handleStartEdit(item)}
                            onRequestDelete={() =>
                              setConfirmDeleteId(item.workScheduleId)
                            }
                            disableEdit={editingId !== null}
                            editConflictError={editConflictError}
                            index={index}
                          />
                        );
                      })}
                      {addingDay === day && (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-4 rounded-lg bg-blue-50/50 p-3">
                            <div className="flex flex-1 items-center gap-3">
                              <span className="w-10 text-sm font-semibold text-gray-500">
                                Ca {daySchedules.length + 1}
                              </span>
                              <input
                                type="time"
                                value={addForm.openTime}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setAddValue('openTime', val, {
                                    shouldValidate: true,
                                  });
                                  if (
                                    addForm.closeTime &&
                                    val >= addForm.closeTime
                                  ) {
                                    setAddValue('closeTime', '', {
                                      shouldValidate: true,
                                    });
                                  }
                                }}
                                className={`rounded-lg border px-3 py-1.5 text-sm outline-none focus:ring-2 ${
                                  addErrors.openTime
                                    ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                                }`}
                              />
                              <span className="text-sm text-gray-400">—</span>
                              <input
                                type="time"
                                value={addForm.closeTime}
                                min={addForm.openTime || undefined}
                                onChange={(e) =>
                                  setAddValue('closeTime', e.target.value, {
                                    shouldValidate: true,
                                  })
                                }
                                className={`rounded-lg border px-3 py-1.5 text-sm outline-none focus:ring-2 ${
                                  addErrors.closeTime
                                    ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                                }`}
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <Tooltip title="Lưu">
                                <span>
                                  <IconButton
                                    size="small"
                                    onClick={() => void handleSubmitAdd()}
                                    disabled={
                                      status === 'pending' ||
                                      !isAddValid ||
                                      !!addFormConflictError
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
                                  onClick={handleCancelAdd}
                                  disabled={status === 'pending'}
                                >
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </div>
                          </div>
                          {addFormConflictError && (
                            <div className="px-3 pb-2">
                              <p className="text-xs font-medium text-red-500">
                                {addFormConflictError}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </Box>
      )}

      <WorkScheduleDeleteConfirmDialog
        open={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          void handleConfirmDelete();
        }}
      />
    </div>
  );
}
