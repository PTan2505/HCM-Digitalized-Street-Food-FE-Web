import type { JSX } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
} from '@mui/material';
import Groups2Icon from '@mui/icons-material/Groups2';
import AppModalHeader from '@components/AppModalHeader';
import Pagination from '@features/admin/components/Pagination';
import Table from '@features/admin/components/Table';
import useQuest from '@features/admin/hooks/useQuest';
import {
  type Quest,
  QuestTaskType,
  type QuestUserProgress,
  QUEST_TASK_TYPE_LABELS,
} from '@features/admin/types/quest';

interface QuestParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  quest: Quest | null;
}

const formatTaskProgressValue = (
  taskType: QuestTaskType,
  value: number
): string => {
  if (taskType === QuestTaskType.ORDER_AMOUNT) {
    return value.toLocaleString('vi-VN');
  }

  return String(value);
};

const formatNumber = (value?: number | null): string => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '0';
  }

  return value.toLocaleString('vi-VN');
};

const getStatusMeta = (
  status: string
): { label: string; tone: 'success' | 'warning' | 'error' | 'default' } => {
  const normalizedStatus = status.trim().toUpperCase();

  const statusMap: Record<
    string,
    { label: string; tone: 'success' | 'warning' | 'error' | 'default' }
  > = {
    COMPLETED: {
      label: 'Hoàn thành',
      tone: 'success',
    },
    IN_PROGRESS: {
      label: 'Đang thực hiện',
      tone: 'warning',
    },
    NOT_STARTED: {
      label: 'Chưa bắt đầu',
      tone: 'default',
    },
    PENDING: {
      label: 'Đang chờ',
      tone: 'warning',
    },
    READY_TO_CLAIM: {
      label: 'Sẵn sàng nhận thưởng',
      tone: 'warning',
    },
    CLAIMED: {
      label: 'Đã nhận thưởng',
      tone: 'success',
    },
    FAILED: {
      label: 'Thất bại',
      tone: 'error',
    },
    CANCELLED: {
      label: 'Đã hủy',
      tone: 'error',
    },
    EXPIRED: {
      label: 'Hết hạn',
      tone: 'error',
    },
    STOPPED: {
      label: 'Đã dừng',
      tone: 'warning',
    },
  };

  const translatedStatus = statusMap[normalizedStatus];
  if (translatedStatus) {
    return translatedStatus;
  }

  return {
    label: status.trim() === '' ? '-' : status,
    tone: 'default',
  };
};

const StatusBadge = ({
  label,
  tone,
}: {
  label: string;
  tone: 'success' | 'warning' | 'error' | 'default';
}): JSX.Element => {
  const colorClasses = {
    success: 'border-green-200 bg-green-100 text-green-700',
    warning: 'border-amber-200 bg-amber-100 text-amber-700',
    error: 'border-red-200 bg-red-100 text-red-700',
    default: 'border-slate-200 bg-slate-100 text-slate-700',
  };

  return (
    <span
      className={`inline-flex min-w-28 items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-bold shadow-sm ${colorClasses[tone]}`}
    >
      {label}
    </span>
  );
};

const getUserDisplayName = (participant: QuestUserProgress): string => {
  const userName = participant.user?.userName?.trim();
  if (userName) {
    return userName;
  }

  const fullName =
    `${participant.user?.firstName ?? ''} ${participant.user?.lastName ?? ''}`.trim();
  if (fullName) {
    return fullName;
  }

  return `User #${participant.userId}`;
};

export default function QuestParticipantsModal({
  isOpen,
  onClose,
  quest,
}: QuestParticipantsModalProps): JSX.Element | null {
  const { onGetQuestUserQuestTasks } = useQuest();

  const [participants, setParticipants] = useState<QuestUserProgress[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchParticipants = useCallback(async (): Promise<void> => {
    if (!quest) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await onGetQuestUserQuestTasks(quest.questId, {
        pageNumber: page,
        pageSize,
      });

      setParticipants(response.items ?? []);
      setTotalCount(response.totalCount ?? 0);
      setHasPrevious(response.hasPrevious ?? false);
      setHasNext(response.hasNext ?? false);
    } catch (error) {
      console.error('Failed to fetch quest participants', error);
      setParticipants([]);
      setTotalCount(0);
      setHasPrevious(false);
      setHasNext(false);
    } finally {
      setIsLoading(false);
    }
  }, [onGetQuestUserQuestTasks, page, pageSize, quest]);

  useEffect(() => {
    if (!isOpen || !quest) {
      setParticipants([]);
      setTotalCount(0);
      setHasPrevious(false);
      setHasNext(false);
      return;
    }

    void fetchParticipants();
  }, [fetchParticipants, isOpen, quest]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setPage(1);
  }, [isOpen, quest?.questId]);

  const columns = useMemo(
    () => [
      {
        key: 'user',
        label: 'Người tham gia',
        render: (_: unknown, row: QuestUserProgress): JSX.Element => {
          return (
            <div className="flex min-w-74 items-start gap-3 whitespace-normal">
              <Avatar
                src={row.user?.avatarUrl ?? undefined}
                alt={getUserDisplayName(row)}
                sx={{ width: 36, height: 36 }}
              />

              <div>
                <p className="text-table-text-primary text-sm font-semibold">
                  {getUserDisplayName(row)}
                </p>
                <p className="text-table-text-secondary text-xs">
                  {row.user?.email ?? '-'}
                </p>
                <p className="text-table-text-secondary text-xs">
                  Tier: {row.user?.tierName ?? '-'} | Point:{' '}
                  {formatNumber(row.user?.point)} | XP:{' '}
                  {formatNumber(row.user?.xp)}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        key: 'status',
        label: 'Trạng thái Nhiệm vụ',
        render: (value: unknown): JSX.Element => {
          const statusText = typeof value === 'string' ? value : '-';
          const statusMeta = getStatusMeta(statusText);

          return (
            <StatusBadge label={statusMeta.label} tone={statusMeta.tone} />
          );
        },
      },
      {
        key: 'tasks',
        label: 'Tiến độ nhiệm vụ',
        render: (_: unknown, row: QuestUserProgress): JSX.Element => {
          const totalTaskCount = row.tasks.length;
          const completedTaskCount = row.tasks.filter(
            (task) => task.isCompleted
          ).length;
          const progressPercent =
            totalTaskCount > 0
              ? Math.round((completedTaskCount / totalTaskCount) * 100)
              : 0;

          return (
            <div className="max-w-140 min-w-110 whitespace-normal">
              <p className="text-table-text-primary text-sm font-semibold">
                Hoàn thành {completedTaskCount}/{totalTaskCount} nhiệm vụ
              </p>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="bg-primary-600 h-full rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-table-text-secondary min-w-9 text-xs font-semibold">
                  {progressPercent}%
                </span>
              </div>
              <div className="mt-1 space-y-1">
                {row.tasks.map((task) => (
                  <div
                    key={task.userQuestTaskId}
                    className="text-table-text-secondary flex items-start gap-1 text-xs"
                  >
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                    <span>
                      {QUEST_TASK_TYPE_LABELS[task.type]}:{' '}
                      {formatTaskProgressValue(task.type, task.currentValue)}/
                      {formatTaskProgressValue(task.type, task.targetValue)}
                      {task.isCompleted ? ' (Đã hoàn thành)' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        },
      },
    ],
    []
  );

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '88vh',
        },
      }}
    >
      <AppModalHeader
        title="Người tham gia nhiệm vụ"
        subtitle={quest?.title ?? ''}
        icon={<Groups2Icon />}
        iconTone="admin"
        onClose={onClose}
      />

      <DialogContent dividers sx={{ p: 3 }}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
            Tổng người tham gia: {totalCount}
          </span>
          {/* <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
            Quest ID: {quest?.questId ?? '-'}
          </span> */}
        </div>

        <Table
          columns={columns}
          data={participants}
          rowKey="userQuestId"
          loading={isLoading}
          emptyMessage="Chưa có người tham gia quest này"
          maxHeight="calc(88vh - 280px)"
        />

        <Box sx={{ mt: 2 }}>
          <Pagination
            currentPage={page}
            totalPages={Math.max(1, Math.ceil((totalCount ?? 0) / pageSize))}
            totalCount={totalCount}
            pageSize={pageSize}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
            onPageChange={setPage}
            onPageSizeChange={(nextPageSize) => {
              setPageSize(nextPageSize);
              setPage(1);
            }}
          />
        </Box>
      </DialogContent>

      {/* <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Đóng
        </Button>
      </DialogActions> */}
    </Dialog>
  );
}
