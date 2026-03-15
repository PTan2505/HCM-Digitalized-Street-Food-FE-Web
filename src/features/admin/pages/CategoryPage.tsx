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
import CategoryFormModal from '@features/admin/components/CategoryFormModal';
import type { Category } from '@features/admin/types/category';
import useCategory from '@features/admin/hooks/useCategory';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectCategories, selectCategoryStatus } from '@slices/category';

export default function CategoryPage(): JSX.Element {
  const categories = useAppSelector(selectCategories);
  const status = useAppSelector(selectCategoryStatus);
  const {
    onGetAllCategories,
    onCreateCategory,
    onUpdateCategory,
    onDeleteCategory,
  } = useCategory();
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  );
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    description: null,
  });

  useEffect(() => {
    void onGetAllCategories();
  }, [onGetAllCategories]);

  const handleOpenDialog = (category?: Category): void => {
    if (category) {
      setEditingCategory(category);
      setFormData(category);
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: null,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: null,
    });
  };

  const handleSave = async (data: {
    name: string;
    description?: string | null;
  }): Promise<void> => {
    try {
      const payload = {
        name: data.name,
        description: data.description ?? null,
      };

      if (editingCategory) {
        await onUpdateCategory({ id: editingCategory.categoryId, ...payload });
      } else {
        await onCreateCategory(payload);
      }
      await onGetAllCategories();
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  const handleDelete = (category: Category): void => {
    setDeletingCategory(category);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (deletingCategory) {
      try {
        await onDeleteCategory(deletingCategory.categoryId);
        await onGetAllCategories();
        setOpenDeleteDialog(false);
        setDeletingCategory(null);
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  const handleCancelDelete = (): void => {
    setOpenDeleteDialog(false);
    setDeletingCategory(null);
  };

  const columns = [
    {
      key: 'categoryId',
      label: 'ID',
      style: { width: '80px' },
    },
    {
      key: 'name',
      label: 'Tên Danh mục',
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
        <Box className="text-table-text-secondary block max-w-100 overflow-hidden text-ellipsis whitespace-nowrap">
          {typeof value === 'string' && value !== '' ? value : '-'}
        </Box>
      ),
    },
  ];

  const actions = [
    {
      label: <EditIcon fontSize="small" />,
      onClick: (row: Category): void => handleOpenDialog(row),
      color: 'primary' as const,
      variant: 'outlined' as const,
    },
    {
      label: <DeleteIcon fontSize="small" />,
      onClick: (row: Category): void => handleDelete(row),
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
            Quản lý Danh mục
          </h1>
          <p className="text-sm text-[var(--color-table-text-secondary)]">
            Quản lý các danh mục sản phẩm của hệ thống
          </p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          className="flex items-center gap-2 rounded-lg bg-[var(--color-primary-600)] px-4 py-2 font-semibold text-white transition-colors hover:bg-[var(--color-primary-700)]"
        >
          <AddIcon fontSize="small" />
          Thêm danh mục
        </button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={categories ?? []}
        rowKey="categoryId"
        actions={actions}
        loading={status === 'pending'}
        emptyMessage="Chưa có danh mục nào"
      />

      {/* Modal Form */}
      <CategoryFormModal
        isOpen={openDialog}
        isEditMode={!!editingCategory}
        formData={formData}
        onClose={handleCloseDialog}
        onSave={handleSave}
        onChange={(data) => setFormData(data as Partial<Category>)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Xác nhận xóa danh mục
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Bạn có chắc chắn muốn xóa danh mục &quot;
            {deletingCategory?.name}&quot;? Hành động này không thể hoàn tác.
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
