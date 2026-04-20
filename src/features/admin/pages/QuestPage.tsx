import type { JSX } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Groups as GroupsIcon,
  HelpOutline as HelpOutlineIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import {
  type Controls,
  EVENTS,
  Joyride,
  STATUS,
  type EventData,
} from 'react-joyride';
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
import QuestParticipantsModal from '@features/admin/components/QuestParticipantsModal';
import Pagination from '@features/admin/components/Pagination';
import Table from '@features/admin/components/Table';
import useQuest from '@features/admin/hooks/useQuest';
import { getQuestManagementTourSteps } from '@features/admin/utils/questManagementTourSteps';
import { type Quest, QuestTaskType } from '@features/admin/types/quest';
import { useAppSelector } from '@hooks/reduxHooks';
import {
  selectQuestHasNext,
  selectQuestHasPrevious,
  selectQuestStatus,
  selectQuestTotalCount,
  selectQuests,
} from '@slices/quest';

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
    onUpdateQuestTasks,
    onDeleteQuest,
    onPostQuestImage,
  } = useQuest();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [openModal, setOpenModal] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [viewingQuest, setViewingQuest] = useState<Quest | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletingQuest, setDeletingQuest] = useState<Quest | null>(null);
  const [openParticipantsDialog, setOpenParticipantsDialog] = useState(false);
  const [selectedParticipantQuest, setSelectedParticipantQuest] =
    useState<Quest | null>(null);
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [tourInstanceKey, setTourInstanceKey] = useState(0);

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

  const handleSaveQuest = useCallback(
    async (
      data: Parameters<typeof onCreateQuest>[0],
      imageFile?: File | null
    ): Promise<void> => {
      try {
        let savedQuest: Quest;

        if (editingQuest) {
          savedQuest = await onUpdateQuest(editingQuest.questId, {
            title: data.title,
            description: data.description,
            imageUrl: data.imageUrl,
            isActive: data.isActive,
            requiresEnrollment: data.requiresEnrollment,
            isStandalone: data.isStandalone,
            campaignId: data.campaignId,
          });

          if ((editingQuest.userQuestCount ?? 0) === 0) {
            await onUpdateQuestTasks(editingQuest.questId, data.tasks);
          }
        } else {
          savedQuest = await onCreateQuest(data);
        }

        if (imageFile && savedQuest.questId) {
          const formData = new FormData();
          formData.append('imageFile', imageFile);
          await onPostQuestImage(savedQuest.questId, formData);
        }

        await fetchQuests();
        handleCloseModal();
      } catch (error) {
        console.error('Failed to save quest', error);
      }
    },
    [
      editingQuest,
      fetchQuests,
      onCreateQuest,
      onPostQuestImage,
      onUpdateQuest,
      onUpdateQuestTasks,
    ]
  );

  const handleOpenParticipants = (quest: Quest): void => {
    setSelectedParticipantQuest(quest);
    setOpenParticipantsDialog(true);
  };

  const handleCloseParticipantsDialog = (): void => {
    setOpenParticipantsDialog(false);
    setSelectedParticipantQuest(null);
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
    } catch (error) {
      console.error('Failed to delete quest', error);
    }
  };

  const startTour = (): void => {
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
    return getQuestManagementTourSteps({
      hasRows: quests.length > 0,
    });
  }, [quests.length]);

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
      key: 'questType',
      label: 'Loại quest',
      render: (_: unknown, row: Quest): JSX.Element => {
        const isUpgradeQuest = row.tasks.some(
          (task) => task.type === QuestTaskType.TIER_UP
        );
        const questTypeLabel = isUpgradeQuest
          ? 'Nâng hạng'
          : row.isStandalone
            ? 'Độc lập'
            : 'Theo chiến dịch';

        const badgeStyle = isUpgradeQuest
          ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
          : row.isStandalone
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : 'border-amber-200 bg-amber-50 text-amber-700';

        return (
          <Box>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${badgeStyle}`}
            >
              {questTypeLabel}
            </span>
          </Box>
        );
      },
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
      key: 'userQuestCount',
      label: 'Người tham gia',
      render: (value: unknown): JSX.Element => (
        <Box className="text-table-text-secondary text-sm font-semibold">
          {typeof value === 'number' ? value : 0} người
        </Box>
      ),
    },
  ];

  const actions = [
    {
      id: 'detail',
      label: <VisibilityIcon fontSize="small" />,
      onClick: (row: Quest): void => {
        void handleViewDetails(row);
      },
      tooltip: 'Xem chi tiết nhiệm vụ',
      color: 'info' as const,
      variant: 'outlined' as const,
    },
    {
      id: 'participants',
      label: <GroupsIcon fontSize="small" />,
      onClick: (row: Quest): void => {
        handleOpenParticipants(row);
      },
      tooltip: 'Xem người tham gia và tiến độ',
      color: 'secondary' as const,
      variant: 'outlined' as const,
    },
    {
      id: 'edit',
      label: <EditIcon fontSize="small" />,
      onClick: (row: Quest): void => handleOpenModal(row),
      // show: (row: Quest): boolean => row.campaignId === null,
      tooltip: 'Chỉnh sửa nhiệm vụ',
      color: 'primary' as const,
      variant: 'outlined' as const,
    },
  ];

  return (
    <div className="flex h-full flex-col font-(--font-nunito)">
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

      <div
        className="mb-6 flex items-center justify-between"
        data-tour="admin-quest-page-header"
      >
        <div>
          <div className="mb-1 flex items-start gap-2">
            <h1 className="text-table-text-primary text-3xl font-bold">
              Quản lý nhiệm vụ
            </h1>
            <button
              type="button"
              onClick={startTour}
              aria-label="Mở hướng dẫn quản lý nhiệm vụ"
              title="Hướng dẫn"
              className="text-primary-700 hover:text-primary-800 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
            >
              <HelpOutlineIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
          <p className="text-table-text-secondary text-sm">
            Tạo và quản lý nhiệm vụ cùng phần thưởng theo từng nhiệm vụ
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          data-tour="admin-quest-create-button"
          className="bg-primary-600 hover:bg-primary-700 flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white transition-colors"
        >
          <AddIcon fontSize="small" />
          Thêm nhiệm vụ
        </button>
      </div>

      <Box sx={{ flex: 1, minHeight: 0 }} data-tour="admin-quest-table-wrapper">
        <Table
          columns={columns}
          data={quests}
          rowKey="questId"
          actions={actions}
          loading={status === 'pending'}
          emptyMessage="Chưa có quest nào"
          tourId="admin-quest"
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
        canEditTasks={
          editingQuest ? (editingQuest.userQuestCount ?? 0) === 0 : true
        }
        status={status}
      />

      <QuestDetailsModal
        isOpen={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        quest={viewingQuest}
      />

      <QuestParticipantsModal
        isOpen={openParticipantsDialog}
        onClose={handleCloseParticipantsDialog}
        quest={selectedParticipantQuest}
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
