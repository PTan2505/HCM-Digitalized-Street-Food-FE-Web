import { useEffect, useRef, useState } from 'react';
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
import useBranchManagement from '@features/manager/hooks/useBranchManagement';
import useVendor from '@features/vendor/hooks/useVendor';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectVendorStatus, selectWorkSchedules } from '@slices/vendor';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import {
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import { useForm } from 'react-hook-form';

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
  const { onGetWorkSchedules, onUpdateWorkSchedule } = useVendor();

  const schedules = useAppSelector(selectWorkSchedules);
  const status = useAppSelector(selectVendorStatus);

  const [branch, setBranch] = useState<Branch | null>(null);
  const [isLoadingBranch, setIsLoadingBranch] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
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

  const sortedSchedulesRef = useRef<GetWorkScheduleItem[]>([]);

  useEffect(() => {
    sortedSchedulesRef.current = [...schedules].sort(
      (a, b) =>
        WEEKDAY_ORDER.indexOf(a.weekday) - WEEKDAY_ORDER.indexOf(b.weekday)
    );
  }, [schedules]);

  const sortedSchedules = sortedSchedulesRef.current;

  const formatTime = (time: string): string => time.slice(0, 5);

  return (
    <div className="font-(--font-nunito)">
      <div className="mb-6">
        <h1 className="text-table-text-primary mb-1 text-3xl font-bold">
          Quản lý thời gian hoạt động
        </h1>
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
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
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
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-gray-400">
              <EventBusyIcon sx={{ fontSize: 64, opacity: 0.3 }} />
              <p className="text-base font-medium">
                Chưa có thời gian hoạt động cho chi nhánh này
              </p>
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
                    <div className="flex min-w-22.5 items-center justify-center">
                      <span className="inline-block rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                        {dayName}
                      </span>
                    </div>

                    {isEditing ? (
                      <div className="flex flex-1 items-center gap-3">
                        <div>
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
                          {editErrors.openTime && (
                            <p className="mt-1 text-xs text-red-500">
                              {editErrors.openTime.message}
                            </p>
                          )}
                        </div>

                        <span className="text-sm text-gray-400">-</span>

                        <div>
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
                          {editErrors.closeTime && (
                            <p className="mt-1 text-xs text-red-500">
                              {editErrors.closeTime.message}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-1 items-center gap-2">
                        <span className="rounded-md bg-green-50 px-2.5 py-1 text-sm font-semibold text-green-700">
                          {formatTime(item.openTime)}
                        </span>
                        <span className="text-sm text-gray-400">-</span>
                        <span className="rounded-md bg-red-50 px-2.5 py-1 text-sm font-semibold text-red-700">
                          {formatTime(item.closeTime)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      {isEditing ? (
                        <>
                          <Tooltip title="Lưu">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  void handleSaveEdit(item);
                                }}
                                disabled={status === 'pending' || !isEditValid}
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
                        <Tooltip title="Chỉnh sửa giờ">
                          <IconButton
                            size="small"
                            onClick={() => handleStartEdit(item)}
                            disabled={editingId !== null}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Box>
      )}
    </div>
  );
}
