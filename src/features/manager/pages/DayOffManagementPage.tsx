import { zodResolver } from '@hookform/resolvers/zod';
import DayOffDeleteConfirmDialog from '@features/manager/components/DayOffDeleteConfirmDialog';
import DayOffFormFields from '@features/manager/components/DayOffFormFields';
import useBranchManagement from '@features/manager/hooks/useBranchManagement';
import { getManagerDayOffManagementTourSteps } from '@features/manager/utils/dayOffManagementTourSteps';
import useVendor from '@features/vendor/hooks/useVendor';
import {
  AddDayOffSchema,
  type AddDayOffFormData,
} from '@features/vendor/utils/dayOffSchema';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectDayOffs, selectVendorStatus } from '@slices/vendor';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DeleteIcon from '@mui/icons-material/Delete';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SaveIcon from '@mui/icons-material/Save';
import {
  Alert,
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import type { JSX } from 'react';
import { useForm } from 'react-hook-form';
import {
  type Controls,
  EVENTS,
  Joyride,
  STATUS,
  type EventData,
} from 'react-joyride';

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

export default function DayOffManagementPage(): JSX.Element {
  const { onGetManagerMyBranch } = useBranchManagement();
  const { onGetDayOffs, onSubmitDayOff, onDeleteDayOff } = useVendor();

  const dayOffs = useAppSelector(selectDayOffs);
  const status = useAppSelector(selectVendorStatus);

  const [branchId, setBranchId] = useState<number | null>(null);
  const [branchName, setBranchName] = useState<string>('');
  const [isLoadingBranch, setIsLoadingBranch] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [tourInstanceKey, setTourInstanceKey] = useState(0);

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

  const addForm = watch();

  const occupiedDates = useMemo(() => {
    const map = new Map<number, Set<string>>();

    dayOffs.forEach((d) => {
      map.set(d.dayOffId, new Set(expandRange(d.startDate, d.endDate)));
    });

    return map;
  }, [dayOffs]);

  const hasRangeOverlap = (
    start: string,
    end: string,
    excludedDayOffId?: number
  ): boolean => {
    const targetDays = new Set(expandRange(start, end));

    for (const [dayOffId, days] of occupiedDates.entries()) {
      if (excludedDayOffId !== undefined && dayOffId === excludedDayOffId) {
        continue;
      }

      for (const day of targetDays) {
        if (days.has(day)) {
          return true;
        }
      }
    }

    return false;
  };

  const sortedDayOffs = useMemo(() => {
    return [...dayOffs].sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [dayOffs]);

  const resetAddForm = (): void => {
    reset({
      startDate: getLocalDatetimeNow(),
      endDate: getLocalDatetimeNow(),
    });
    clearErrors();
  };

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      setIsLoadingBranch(true);
      setLoadingError(null);

      try {
        const branch = await onGetManagerMyBranch();
        setBranchId(branch.branchId);
        setBranchName(branch.name);
        await onGetDayOffs(branch.branchId);
      } catch {
        setLoadingError('Không thể tải dữ liệu chi nhánh hoặc thời gian nghỉ.');
      } finally {
        setIsLoadingBranch(false);
      }
    };

    void loadData();
  }, [onGetManagerMyBranch, onGetDayOffs]);

  const openAddForm = (): void => {
    resetAddForm();
    setShowAddForm(true);
  };

  const handleCancelAdd = (): void => {
    setShowAddForm(false);
    resetAddForm();
  };

  const handleSubmitAdd = async (): Promise<void> => {
    if (!branchId || !isValid) {
      return;
    }

    if (hasRangeOverlap(addForm.startDate, addForm.endDate)) {
      setError('startDate', {
        message: 'Khoảng ngày này trùng với đợt nghỉ đã có!',
      });
      setError('endDate', {
        message: 'Khoảng ngày này trùng với đợt nghỉ đã có!',
      });
      return;
    }

    try {
      await onSubmitDayOff({
        branchId,
        data: {
          startDate: addForm.startDate,
          endDate: addForm.endDate,
        },
      });

      setShowAddForm(false);
      resetAddForm();
    } catch {
      // Toast is handled by axios interceptor.
    }
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (confirmDeleteId === null) {
      return;
    }

    setConfirmDeleteId(null);

    try {
      await onDeleteDayOff(confirmDeleteId);
    } catch {
      // Toast is handled by axios interceptor.
    }
  };

  const renderAddForm = (): JSX.Element => {
    return (
      <div
        className="mb-6 rounded-xl border border-amber-200 bg-amber-50/50 p-5"
        data-tour="manager-dayoff-form"
      >
        <h3 className="mb-4 text-sm font-bold text-amber-800">
          Thêm thời gian nghỉ mới
        </h3>

        <DayOffFormFields
          form={addForm}
          errors={errors}
          theme="amber"
          onStartDateChange={(value) => {
            setValue('startDate', value, { shouldValidate: true });
            if (addForm.endDate && value >= addForm.endDate) {
              setValue('endDate', value, { shouldValidate: true });
            }
            const endDate =
              value >= (addForm.endDate ?? '')
                ? value
                : (addForm.endDate ?? value);
            if (hasRangeOverlap(value, endDate)) {
              setError('startDate', {
                message: 'Khoảng ngày này trùng với đợt nghỉ đã có!',
              });
              setError('endDate', {
                message: 'Khoảng ngày này trùng với đợt nghỉ đã có!',
              });
            } else {
              clearErrors(['startDate', 'endDate']);
            }
          }}
          onEndDateChange={(value) => {
            setValue('endDate', value, { shouldValidate: true });
            if (value && addForm.startDate) {
              if (hasRangeOverlap(addForm.startDate, value)) {
                setError('startDate', {
                  message: 'Khoảng ngày này trùng với đợt nghỉ đã có!',
                });
                setError('endDate', {
                  message: 'Khoảng ngày này trùng với đợt nghỉ đã có!',
                });
              } else {
                clearErrors(['startDate', 'endDate']);
              }
            }
          }}
        />

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
            onClick={handleCancelAdd}
            disabled={status === 'pending'}
          >
            Hủy
          </button>
          <button
            type="button"
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 disabled:opacity-50"
            onClick={() => {
              void handleSubmitAdd();
            }}
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
    );
  };

  const startDayOffTour = (): void => {
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
    return getManagerDayOffManagementTourSteps({
      hasRows: sortedDayOffs.length > 0,
      isAddFormVisible: showAddForm,
    });
  }, [showAddForm, sortedDayOffs.length]);

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

      <div className="mb-6" data-tour="manager-dayoff-header">
        <div className="mb-1 flex items-start gap-2">
          <h1 className="text-table-text-primary text-3xl font-bold">
            Quản lý thời gian nghỉ
          </h1>
          <button
            type="button"
            onClick={startDayOffTour}
            aria-label="Mở hướng dẫn quản lý thời gian nghỉ"
            title="Hướng dẫn"
            className="text-primary-700 hover:text-primary-800 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
          >
            <HelpOutlineIcon sx={{ fontSize: 18 }} />
          </button>
        </div>
        <p className="text-table-text-secondary text-sm">
          Quản lý các đợt nghỉ của chi nhánh: xem, thêm và xóa
        </p>
      </div>

      {isLoadingBranch ? (
        <Box className="flex items-center justify-center rounded-lg border border-gray-200 bg-white py-16">
          <CircularProgress />
        </Box>
      ) : loadingError ? (
        <Alert severity="error">{loadingError}</Alert>
      ) : !branchId ? (
        <Box className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-600">
          Không có chi nhánh nào được phân công cho bạn.
        </Box>
      ) : (
        <Box className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div
            className="mb-5 flex flex-wrap items-center justify-between gap-3"
            data-tour="manager-dayoff-summary"
          >
            <div>
              <h2 className="text-table-text-primary text-lg font-bold">
                Chi nhánh {branchName}
              </h2>
              <p className="text-table-text-secondary mt-1 text-sm">
                Tổng số đợt nghỉ: {sortedDayOffs.length}
              </p>
            </div>

            {!showAddForm && (
              <button
                type="button"
                className="flex cursor-pointer items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 disabled:opacity-60"
                onClick={openAddForm}
                disabled={status === 'pending'}
                data-tour="manager-dayoff-create-button"
              >
                <AddIcon fontSize="small" />
                Thêm thời gian nghỉ
              </button>
            )}
          </div>

          {showAddForm && renderAddForm()}

          {status === 'pending' && sortedDayOffs.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <CircularProgress />
            </div>
          ) : sortedDayOffs.length === 0 && !showAddForm ? (
            <div
              className="flex flex-col items-center justify-center gap-4 py-20 text-gray-400"
              data-tour="manager-dayoff-list"
            >
              <EventBusyIcon sx={{ fontSize: 64, opacity: 0.3 }} />
              <p className="text-base font-medium">Chưa có thời gian nghỉ</p>
              {/* <button
                type="button"
                className="flex items-center gap-2 rounded-lg border-2 border-dashed border-amber-300 px-6 py-3 text-sm font-semibold text-amber-500 transition hover:border-amber-500 hover:text-amber-700"
                onClick={openAddForm}
              >
                <AddIcon fontSize="small" />
                Thêm đợt nghỉ đầu tiên
              </button> */}
            </div>
          ) : (
            <div className="space-y-2" data-tour="manager-dayoff-list">
              {sortedDayOffs.map((item) => {
                return (
                  <div
                    key={item.dayOffId}
                    className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-4 transition hover:border-gray-200 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-1 flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-1 text-sm font-semibold text-amber-700">
                          <CalendarMonthIcon sx={{ fontSize: 14 }} />
                          {formatDateTime(item.startDate)}
                        </span>

                        <span className="text-sm text-gray-400">—</span>
                        <span className="flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-1 text-sm font-semibold text-amber-700">
                          <CalendarMonthIcon sx={{ fontSize: 14 }} />
                          {formatDateTime(item.endDate)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Tooltip title="Xóa">
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
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Box>
      )}

      <DayOffDeleteConfirmDialog
        open={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          void handleConfirmDelete();
        }}
        isLoading={status === 'pending'}
      />
    </div>
  );
}
