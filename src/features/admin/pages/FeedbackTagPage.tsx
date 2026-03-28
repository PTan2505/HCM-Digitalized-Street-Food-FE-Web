import { useState, useEffect } from 'react';
import type { JSX } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import Table from '@features/admin/components/Table';
import FeedbackTagModal from '@features/admin/components/FeedbackTagModal';
import type { FeedbackTag } from '@features/admin/types/feedbackTag';
import useFeedbackTag from '@features/admin/hooks/useFeedbackTag';
import { useAppSelector } from '@hooks/reduxHooks';
import {
  selectFeedbackTags,
  selectFeedbackTagStatus,
} from '@slices/feedbackTag';

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
        <Box className="text-table-text-secondary block max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap">
          {(value as string | null | undefined) ?? '-'}
        </Box>
      ),
    },
  ];

  const actions = [
    {
      label: <EditIcon fontSize="small" />,
      onClick: (row: FeedbackTag): void => handleOpenDialog(row),
      color: 'primary' as const,
      variant: 'outlined' as const,
    },
    {
      label: <DeleteIcon fontSize="small" />,
      onClick: (row: FeedbackTag): void => handleDelete(row),
      color: 'error' as const,
      variant: 'outlined' as const,
    },
  ];

  return (
    <div className="font-[var(--font-nunito)]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-bold text-[var(--color-table-text-primary)]">
            Quản lý Tag phản hồi
          </h1>
          <p className="text-sm text-[var(--color-table-text-secondary)]">
            Quản lý các nhãn phản hồi từ người dùng
          </p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          className="flex items-center gap-2 rounded-lg bg-[var(--color-primary-600)] px-4 py-2 font-semibold text-white transition-colors hover:bg-[var(--color-primary-700)]"
        >
          <AddIcon fontSize="small" />
          Thêm Tag phản hồi
        </button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={feedbackTags}
        rowKey="tagId"
        actions={actions}
        loading={status === 'pending'}
        emptyMessage="Chưa có tag phản hồi nào"
      />

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
      <Dialog
        open={openDeleteDialog}
        onClose={handleCancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Xác nhận xóa tag phản hồi
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Bạn có chắc chắn muốn xóa tag phản hồi &quot;
            {deletingTag?.tagName}&quot;? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancelDelete}
            color="primary"
            className="font-[var(--font-nunito)]"
          >
            Hủy
          </Button>
          <Button
            onClick={() => void handleConfirmDelete()}
            color="error"
            variant="contained"
            className="font-[var(--font-nunito)]"
            autoFocus
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
