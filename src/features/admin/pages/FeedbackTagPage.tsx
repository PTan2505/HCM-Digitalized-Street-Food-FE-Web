import { useState, useEffect, useMemo } from 'react';
import type { JSX } from 'react';
import { Box, Chip } from '@mui/material';
import {
  Add as AddIcon,
  Block as BlockIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Edit as EditIcon,
  HelpOutline as HelpOutlineIcon,
} from '@mui/icons-material';
import {
  type Controls,
  EVENTS,
  Joyride,
  STATUS,
  type EventData,
} from 'react-joyride';
import Table from '@features/admin/components/Table';
import FeedbackTagModal from '@features/admin/components/FeedbackTagModal';
import DeleteConfirmationDialog from '@components/ui/DeleteConfirmationDialog';
import type { FeedbackTag } from '@features/admin/types/feedbackTag';
import useFeedbackTag from '@features/admin/hooks/useFeedbackTag';
import { useAppSelector } from '@hooks/reduxHooks';
import {
  selectFeedbackTags,
  selectFeedbackTagStatus,
} from '@slices/feedbackTag';
import { getFeedbackTagManagementTourSteps } from '@features/admin/utils/feedbackTagManagementTourSteps';

export default function FeedbackTagPage(): JSX.Element {
  const feedbackTags = useAppSelector(selectFeedbackTags);
  const status = useAppSelector(selectFeedbackTagStatus);
  const {
    onGetAllFeedbackTags,
    onCreateFeedbackTag,
    onUpdateFeedbackTag,
    onDeleteFeedbackTag,
  } = useFeedbackTag();
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletingTag, setDeletingTag] = useState<FeedbackTag | null>(null);
  const [editingTag, setEditingTag] = useState<FeedbackTag | null>(null);
  const [formData, setFormData] = useState<Partial<FeedbackTag>>({
    tagName: '',
    description: '',
  });
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [tourInstanceKey, setTourInstanceKey] = useState(0);

  useEffect(() => {
    void onGetAllFeedbackTags();
  }, [onGetAllFeedbackTags]);

  const handleOpenDialog = (tag?: FeedbackTag): void => {
    if (tag) {
      setEditingTag(tag);
      setFormData(tag);
    } else {
      setEditingTag(null);
      setFormData({
        tagName: '',
        description: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
    setEditingTag(null);
    setFormData({
      tagName: '',
      description: '',
    });
  };

  const handleSave = async (data: {
    tagName: string;
    description: string;
  }): Promise<void> => {
    try {
      const payload = {
        tagName: data.tagName,
        description: data.description,
      };

      if (editingTag) {
        await onUpdateFeedbackTag({ id: editingTag.tagId, ...payload });
      } else {
        await onCreateFeedbackTag(payload);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save feedback tag:', error);
    }
  };

  const handleDelete = (tag: FeedbackTag): void => {
    setDeletingTag(tag);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (deletingTag) {
      try {
        await onDeleteFeedbackTag(deletingTag.tagId);
        setOpenDeleteDialog(false);
        setDeletingTag(null);
      } catch (error) {
        console.error('Failed to delete feedback tag:', error);
      }
    }
  };

  const handleCancelDelete = (): void => {
    setOpenDeleteDialog(false);
    setDeletingTag(null);
  };

  const startFeedbackTagTour = (): void => {
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
    return getFeedbackTagManagementTourSteps({
      hasRows: feedbackTags.length > 0,
    });
  }, [feedbackTags.length]);

  const columns = [
    // {
    //   key: 'tagId',
    //   label: 'ID',
    //   style: { width: '80px' },
    // },
    {
      key: 'tagName',
      label: 'Tên Tag phản hồi',
      render: (value: unknown): React.ReactNode => (
        <Box className="text-table-text-primary font-semibold">
          {String(value)}
        </Box>
      ),
    },
    {
      key: 'description',
      label: 'Mô tả',
      render: (value: unknown): React.ReactNode => (
        <Box className="text-table-text-secondary block max-w-75 overflow-hidden text-ellipsis whitespace-nowrap">
          {(value as string | null | undefined) ?? '-'}
        </Box>
      ),
    },
    {
      key: 'isActive',
      label: 'Trạng thái',
      style: { width: '140px' },
      render: (value: unknown): React.ReactNode => {
        const isActive = Boolean(value);
        return (
          <Chip
            label={isActive ? 'Đang hoạt động' : 'Đã đóng'}
            size="small"
            className={
              isActive
                ? 'bg-green-100 font-semibold text-green-800'
                : 'bg-red-100 font-semibold text-red-800'
            }
          />
        );
      },
    },
  ];

  const actions = [
    {
      id: 'edit',
      label: <EditIcon fontSize="small" />,
      onClick: (row: FeedbackTag): void => handleOpenDialog(row),
      tooltip: 'Chỉnh sửa tag phản hồi',
      color: 'primary' as const,
      variant: 'outlined' as const,
    },
    {
      id: 'close',
      label: <BlockIcon fontSize="small" />,
      onClick: (row: FeedbackTag): void => handleDelete(row),
      tooltip: 'Đóng tag phản hồi',
      color: 'warning' as const,
      variant: 'outlined' as const,
      show: (row: FeedbackTag): boolean => row.isActive ?? false,
    },
    {
      id: 'activate',
      label: <CheckCircleOutlineIcon fontSize="small" />,
      onClick: (row: FeedbackTag): void => handleDelete(row),
      tooltip: 'Kích hoạt tag phản hồi',
      color: 'success' as const,
      variant: 'outlined' as const,
      show: (row: FeedbackTag): boolean => !(row.isActive ?? false),
    },
  ];

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

      {/* Header */}
      <div
        className="mb-6 flex items-center justify-between"
        data-tour="feedback-tag-page-header"
      >
        <div>
          <div className="mb-1 flex items-start gap-2">
            <h1 className="text-table-text-primary text-3xl font-bold">
              Quản lý tag phản hồi
            </h1>
            <button
              type="button"
              onClick={startFeedbackTagTour}
              aria-label="Mở hướng dẫn quản lý tag phản hồi"
              title="Hướng dẫn"
              className="text-primary-700 hover:text-primary-800 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
            >
              <HelpOutlineIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
          <p className="text-table-text-secondary text-sm">
            Quản lý các nhãn phản hồi từ người dùng
          </p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          data-tour="feedback-tag-create-button"
          className="bg-primary-600 hover:bg-primary-700 flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white transition-colors"
        >
          <AddIcon fontSize="small" />
          Thêm tag phản hồi
        </button>
      </div>

      {/* Table */}
      <div data-tour="feedback-tag-table-wrapper">
        <Table
          columns={columns}
          data={feedbackTags}
          rowKey="tagId"
          actions={actions}
          loading={status === 'pending'}
          emptyMessage="Chưa có tag phản hồi nào"
          tourId="admin-feedback-tag"
        />
      </div>

      {/* Modal Form */}
      <FeedbackTagModal
        isOpen={openDialog}
        isEditMode={!!editingTag}
        formData={formData}
        onClose={handleCloseDialog}
        onSave={handleSave}
        onChange={(data) => setFormData(data as Partial<FeedbackTag>)}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={openDeleteDialog}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={
          deletingTag?.isActive
            ? 'Xác nhận đóng tag phản hồi'
            : 'Xác nhận kích hoạt tag phản hồi'
        }
        confirmButtonLabel={deletingTag?.isActive ? 'Đóng' : 'Kích hoạt'}
        confirmButtonColor={deletingTag?.isActive ? 'warning' : 'success'}
        confirmationMessage={
          <>
            Bạn có chắc chắn muốn {deletingTag?.isActive ? 'đóng' : 'kích hoạt'}{' '}
            tag phản hồi &quot;{deletingTag?.tagName}&quot;?
          </>
        }
      />
    </div>
  );
}
