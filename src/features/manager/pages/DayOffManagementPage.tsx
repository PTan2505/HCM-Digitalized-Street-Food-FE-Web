import { zodResolver } from '@hookform/resolvers/zod';
import DayOffDeleteConfirmDialog from '@features/manager/components/DayOffDeleteConfirmDialog';
import DayOffFormFields from '@features/manager/components/DayOffFormFields';
import useBranchManagement from '@features/manager/hooks/useBranchManagement';
import useVendor from '@features/vendor/hooks/useVendor';
import type { DayOffResponse } from '@features/vendor/types/workSchedule';
import {
  AddDayOffSchema,
  type AddDayOffFormData,
} from '@features/vendor/utils/dayOffSchema';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectDayOffs, selectVendorStatus } from '@slices/vendor';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteIcon from '@mui/icons-material/Delete';
import EventBusyIcon from '@mui/icons-material/EventBusy';
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

  const getNextAvailableDate = (): string => {
    if (dayOffs.length === 0) return getToday();

    const maxEndDate = dayOffs.reduce((max, current) => {
      const endDate = current.endDate.split('T')[0];
      return endDate > max ? endDate : max;
    }, getToday());

    const next = new Date(maxEndDate + 'T00:00:00Z');
    next.setUTCDate(next.getUTCDate() + 1);

    return next.toISOString().split('T')[0];
  };

  const resetAddForm = (date: string = getToday()): void => {
    reset({
      startDate: date,
      endDate: date,
      isAllDay: true,
      startTime: null,
      endTime: null,
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
    resetAddForm(getNextAvailableDate());
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
          startDate: toRFC3339(addForm.startDate),
          endDate: toRFC3339(addForm.endDate),
          startTime: addForm.isAllDay ? null : (addForm.startTime ?? null),
          endTime: addForm.isAllDay ? null : (addForm.endTime ?? null),
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
      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/50 p-5">
        <h3 className="mb-4 text-sm font-bold text-amber-800">
          Thêm thời gian nghỉ mới
        </h3>

        <DayOffFormFields
          form={addForm}
          errors={errors}
          theme="amber"
          onStartDateChange={(value) => {
            setValue('startDate', value, { shouldValidate: true });

            if (addForm.endDate && value > addForm.endDate) {
              setValue('endDate', value, { shouldValidate: true });
            }

            const endDate =
              value > (addForm.endDate ?? '')
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
          onIsAllDayChange={(checked) => {
            setValue('isAllDay', checked, {
              shouldValidate: true,
            });

            if (checked) {
              setValue('startTime', null, { shouldValidate: true });
              setValue('endTime', null, { shouldValidate: true });
            }
          }}
          onStartTimeChange={(value) => {
            setValue('startTime', value || null, {
              shouldValidate: true,
            });
            if (
              addForm.startDate === addForm.endDate &&
              addForm.endTime &&
              value >= addForm.endTime
            ) {
              setValue('endTime', null, {
                shouldValidate: true,
              });
            }
          }}
          onEndTimeChange={(value) => {
            setValue('endTime', value || null, {
              shouldValidate: true,
            });
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

  return (
    <div className="font-(--font-nunito)">
      <div className="mb-6">
        <h1 className="text-table-text-primary mb-1 text-3xl font-bold">
          Quản lý thời gian nghỉ
        </h1>
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
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
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
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-gray-400">
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
            <div className="space-y-2">
              {sortedDayOffs.map((item) => {
                const isSingleDay =
                  item.startDate.split('T')[0] === item.endDate.split('T')[0];
                const hasTime =
                  item.startTime !== null || item.endTime !== null;

                return (
                  <div
                    key={item.dayOffId}
                    className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-4 transition hover:border-gray-200 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-1 flex-wrap items-center gap-2">
                        <span className="rounded-md bg-amber-50 px-2.5 py-1 text-sm font-semibold text-amber-700">
                          {formatDate(item.startDate)}
                        </span>

                        {!isSingleDay && (
                          <>
                            <span className="text-sm text-gray-400">-</span>
                            <span className="rounded-md bg-amber-50 px-2.5 py-1 text-sm font-semibold text-amber-700">
                              {formatDate(item.endDate)}
                            </span>
                          </>
                        )}

                        {hasTime ? (
                          <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                            <AccessTimeIcon sx={{ fontSize: 12 }} />
                            {formatTime(item.startTime)} -{' '}
                            {formatTime(item.endTime)}
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                            Cả ngày
                          </span>
                        )}
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
