import type { JSX } from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import QuestDetailsModal from '@features/admin/components/QuestDetailsModal';
import QuestFormModal from '@features/admin/components/QuestFormModal';
import Pagination from '@features/admin/components/Pagination';
import Table from '@features/admin/components/Table';
import useQuest from '@features/admin/hooks/useQuest';
import { type Quest } from '@features/admin/types/quest';
import { useAppSelector } from '@hooks/reduxHooks';
import {
  selectQuestHasNext,
  selectQuestHasPrevious,
  selectQuestStatus,
  selectQuestTotalCount,
  selectQuests,
} from '@slices/quest';

const formatVNDatetime = (isoStr?: string): string => {
  if (!isoStr) {
    return '-';
  }

  const date = new Date(isoStr);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const StatusBadge = ({
  label,
  type,
}: {
  label: string;
  type: 'success' | 'error' | 'warning' | 'default';
}): JSX.Element => {
  const colors = {
    success: 'bg-green-100 text-green-700 border-green-200',
    error: 'bg-red-100 text-red-700 border-red-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    default: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={`inline-flex min-w-25 items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-bold shadow-sm ${colors[type]}`}
    >
      {label}
    </span>
  );
};

export default function QuestPage(): JSX.Element {
  const quests = useAppSelector(selectQuests);
  const status = useAppSelector(selectQuestStatus);
  const totalCount = useAppSelector(selectQuestTotalCount);
  const hasPrevious = useAppSelector(selectQuestHasPrevious);
  const hasNext = useAppSelector(selectQuestHasNext);
  const {
    onGetQuests,
    onGetQuestById,
    onCreateQuest,
    onUpdateQuest,
    onDeleteQuest,
  } = useQuest();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [openModal, setOpenModal] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [viewingQuest, setViewingQuest] = useState<Quest | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletingQuest, setDeletingQuest] = useState<Quest | null>(null);

  const fetchQuests = useCallback(async (): Promise<void> => {
    try {
      await onGetQuests({
        pageNumber: page,
        pageSize,
      });
    } catch (error) {
      console.error('Failed to fetch quests', error);
    }
  }, [onGetQuests, page, pageSize]);

  useEffect(() => {
    void fetchQuests();
  }, [fetchQuests]);

  const handleOpenModal = (quest?: Quest): void => {
    setEditingQuest(quest ?? null);
    setOpenModal(true);
  };

  const handleCloseModal = (): void => {
    setOpenModal(false);
    setEditingQuest(null);
  };

  const handleSaveQuest = async (
    data: Parameters<typeof onCreateQuest>[0]
  ): Promise<void> => {
    try {
      if (editingQuest) {
        await onUpdateQuest(editingQuest.questId, data);
      } else {
        await onCreateQuest(data);
      }
      handleCloseModal();
      await fetchQuests();
    } catch (error) {
      console.error('Failed to save quest', error);
    }
  };

  const handleDelete = (quest: Quest): void => {
    setDeletingQuest(quest);
    setOpenDeleteDialog(true);
  };

  const handleViewDetails = async (quest: Quest): Promise<void> => {
    try {
      const latestQuest = await onGetQuestById(quest.questId);
      setViewingQuest(latestQuest);
    } catch (error) {
      console.error('Failed to get quest details', error);
      setViewingQuest(quest);
    }
    setOpenDetailDialog(true);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (!deletingQuest) {
      return;
    }

    try {
      await onDeleteQuest(deletingQuest.questId);
      setOpenDeleteDialog(false);
      setDeletingQuest(null);
      await fetchQuests();
    } catch (error) {
      console.error('Failed to delete quest', error);
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Tiêu đề',
      render: (value: unknown): JSX.Element => (
        <Box className="text-table-text-primary font-semibold">
          {String(value)}
        </Box>
      ),
    },
    {
      key: 'description',
      label: 'Mô tả',
      render: (value: unknown): JSX.Element => (
        <Box className="text-table-text-secondary line-clamp-2 max-w-50 text-sm">
          {typeof value === 'string' && value.trim().length > 0
            ? value
            : 'Không có mô tả'}
        </Box>
      ),
    },
    {
      key: 'tasks',
      label: 'Nhiệm vụ',
      render: (_: unknown, row: Quest): JSX.Element => {
        return (
          <Box className="text-table-text-secondary text-sm">
            <div>{row.taskCount ?? row.tasks.length} nhiệm vụ</div>
          </Box>
        );
      },
    },
    {
      key: 'isActive',
      label: 'Trạng thái',
      render: (value: unknown): JSX.Element => (
        <StatusBadge
          label={value === true ? 'Đang hoạt động' : 'Tạm ngưng'}
          type={value === true ? 'success' : 'error'}
        />
      ),
    },
    {
      key: 'isStandalone',
      label: 'Kiểu',
      render: (value: unknown): JSX.Element => (
        <StatusBadge
          label={value === true ? 'Độc lập' : 'Theo chiến dịch'}
          type={value === true ? 'warning' : 'default'}
        />
      ),
    },
    // {
    //   key: 'campaignId',
    //   label: 'Áp dụng',
    //   render: (value: unknown, row: Quest): JSX.Element => (
    //     <Box className="text-table-text-secondary text-sm">
    //       {row.isStandalone
    //         ? 'Độc lập'
    //         : `Campaign ${typeof value === 'number' ? value : '-'}`}
    //     </Box>
    //   ),
    // },
    {
      key: 'updatedAt',
      label: 'Thời gian',
      render: (_: unknown, row: Quest): JSX.Element => (
        <Box className="text-table-text-secondary text-sm">
          <div>Tạo: {formatVNDatetime(row.createdAt)}</div>
          <div>Cập nhật: {formatVNDatetime(row.updatedAt)}</div>
        </Box>
      ),
    },
  ];

  const actions = [
    {
      label: <VisibilityIcon fontSize="small" />,
      onClick: (row: Quest): void => {
        void handleViewDetails(row);
      },
      tooltip: 'Xem chi tiết nhiệm vụ',
      color: 'info' as const,
      variant: 'outlined' as const,
    },
    {
      label: <EditIcon fontSize="small" />,
      onClick: (row: Quest): void => handleOpenModal(row),
      tooltip: 'Chỉnh sửa nhiệm vụ',
      color: 'primary' as const,
      variant: 'outlined' as const,
    },
    {
      label: <DeleteIcon fontSize="small" />,
      onClick: (row: Quest): void => handleDelete(row),
      tooltip: 'Xóa nhiệm vụ',
      color: 'error' as const,
      variant: 'outlined' as const,
    },
  ];

  return (
    <div className="flex h-full flex-col font-(--font-nunito)">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-table-text-primary mb-1 text-3xl font-bold">
            Quản lý nhiệm vụ
          </h1>
          <p className="text-table-text-secondary text-sm">
            Tạo và quản lý nhiệm vụ cùng phần thưởng theo từng nhiệm vụ
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="bg-primary-600 hover:bg-primary-700 flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white transition-colors"
        >
          <AddIcon fontSize="small" />
          Thêm nhiệm vụ
        </button>
      </div>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <Table
          columns={columns}
          data={quests}
          rowKey="questId"
          actions={actions}
          loading={status === 'pending'}
          emptyMessage="Chưa có quest nào"
        />
      </Box>

      <Pagination
        currentPage={page}
        totalPages={Math.max(1, Math.ceil((totalCount ?? 0) / pageSize))}
        totalCount={totalCount ?? 0}
        pageSize={pageSize}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        onPageChange={setPage}
        onPageSizeChange={(nextPageSize) => {
          setPageSize(nextPageSize);
          setPage(1);
        }}
      />

      <QuestFormModal
        isOpen={openModal}
        onClose={handleCloseModal}
        onSubmit={handleSaveQuest}
        quest={editingQuest}
        status={status}
      />

      <QuestDetailsModal
        isOpen={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        quest={viewingQuest}
      />

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="delete-quest-dialog-title"
        aria-describedby="delete-quest-dialog-description"
      >
        <DialogTitle id="delete-quest-dialog-title">Xóa nhiệm vụ</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-quest-dialog-description">
            Bạn có chắc muốn xóa nhiệm vụ &quot;{deletingQuest?.title}&quot;?
            Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button
            color="error"
            variant="outlined"
            onClick={() => void handleConfirmDelete()}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
