import { useEffect, useMemo, useRef, useState } from 'react';
import type { JSX } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Branch } from '@features/vendor/types/vendor';
import type {
  GetWorkScheduleItem,
  WeekdayName,
} from '@features/vendor/types/workSchedule';
import {
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
import { Box, CircularProgress, Alert } from '@mui/material';
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
  const { onGetWorkSchedules, onUpdateWorkSchedule, onDeleteWorkSchedule } =
    useVendor();

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
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              {sortedSchedules.length}/7 ngày
            </span>
          </div>

          {status === 'pending' && sortedSchedules.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <CircularProgress />
            </div>
          ) : sortedSchedules.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center gap-4 py-20 text-gray-400"
              data-tour="manager-work-schedule-list"
            >
              <EventBusyIcon sx={{ fontSize: 64, opacity: 0.3 }} />
              <p className="text-base font-medium">
                Chưa có thời gian hoạt động cho chi nhánh này
              </p>
            </div>
          ) : (
            <div className="space-y-2" data-tour="manager-work-schedule-list">
              {sortedSchedules.map((item) => {
                const isEditing = editingId === item.workScheduleId;
                const dayName =
                  WEEKDAY_VI[item.weekday] ??
                  WEEKDAY_MAP[item.weekday] ??
                  item.weekdayName;

                return (
                  <WorkScheduleRow
                    key={item.workScheduleId}
                    item={item}
                    dayName={dayName}
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
                      if (editForm.closeTime && val >= editForm.closeTime) {
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
                  />
                );
              })}
            </div>
          )}
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
