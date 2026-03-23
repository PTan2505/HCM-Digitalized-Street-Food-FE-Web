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
import TasteFormModal from '@features/admin/components/TasteFormModal';
import type { Taste } from '@features/admin/types/taste';
import useTaste from '@features/admin/hooks/useTaste';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectTastes, selectTasteStatus } from '@slices/taste';

export default function TastePage(): JSX.Element {
  const tastes = useAppSelector(selectTastes);
  const status = useAppSelector(selectTasteStatus);
  const { onGetAllTastes, onCreateTaste, onUpdateTaste, onDeleteTaste } =
    useTaste();
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletingTaste, setDeletingTaste] = useState<Taste | null>(null);
  const [editingTaste, setEditingTaste] = useState<Taste | null>(null);
  const [formData, setFormData] = useState<Partial<Taste>>({
    name: '',
    description: '',
  });

  useEffect(() => {
    void onGetAllTastes();
  }, [onGetAllTastes]);

  const handleOpenDialog = (taste?: Taste): void => {
    if (taste) {
      setEditingTaste(taste);
      setFormData(taste);
    } else {
      setEditingTaste(null);
      setFormData({
        name: '',
        description: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
    setEditingTaste(null);
    setFormData({
      name: '',
      description: '',
    });
  };

  const handleSave = async (data: {
    name: string;
    description: string;
  }): Promise<void> => {
    try {
      const payload = {
        name: data.name,
        description: data.description,
      };

      if (editingTaste) {
        await onUpdateTaste({ id: editingTaste.tasteId, ...payload });
      } else {
        await onCreateTaste(payload);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save taste:', error);
    }
  };

  const handleDelete = (taste: Taste): void => {
    setDeletingTaste(taste);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (deletingTaste) {
      try {
        await onDeleteTaste(deletingTaste.tasteId);
        setOpenDeleteDialog(false);
        setDeletingTaste(null);
      } catch (error) {
        console.error('Failed to delete taste:', error);
      }
    }
  };

  const handleCancelDelete = (): void => {
    setOpenDeleteDialog(false);
    setDeletingTaste(null);
  };

  const columns = [
    {
      key: 'tasteId',
      label: 'ID',
      style: { width: '80px' },
    },
    {
      key: 'name',
      label: 'Tên Khẩu vị',
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
      onClick: (row: Taste): void => handleOpenDialog(row),
      color: 'primary' as const,
      variant: 'outlined' as const,
    },
    {
      label: <DeleteIcon fontSize="small" />,
      onClick: (row: Taste): void => handleDelete(row),
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
            Quản lý khẩu vị
          </h1>
          <p className="text-sm text-[var(--color-table-text-secondary)]">
            Quản lý các loại khẩu vị cho món ăn
          </p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          className="flex items-center gap-2 rounded-lg bg-[var(--color-primary-600)] px-4 py-2 font-semibold text-white transition-colors hover:bg-[var(--color-primary-700)]"
        >
          <AddIcon fontSize="small" />
          Thêm khẩu vị
        </button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={tastes}
        rowKey="tasteId"
        actions={actions}
        loading={status === 'pending'}
        emptyMessage="Chưa có khẩu vị nào"
      />

      {/* Modal Form */}
      <TasteFormModal
        isOpen={openDialog}
        isEditMode={!!editingTaste}
        formData={formData}
        onClose={handleCloseDialog}
        onSave={handleSave}
        onChange={(data) => setFormData(data as Partial<Taste>)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Xác nhận xóa khẩu vị</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Bạn có chắc chắn muốn xóa khẩu vị &quot;
            {deletingTaste?.name}&quot;? Hành động này không thể hoàn tác.
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
