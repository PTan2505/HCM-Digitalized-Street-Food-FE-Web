import { useState, useEffect, useMemo } from 'react';
import type { JSX } from 'react';
import { Box, Avatar } from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
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
import CategoryFormModal from '@features/admin/components/CategoryFormModal';
import DeleteConfirmationDialog from '@components/ui/DeleteConfirmationDialog';
import type { Category } from '@features/admin/types/category';
import useCategory from '@features/admin/hooks/useCategory';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectCategories, selectCategoryStatus } from '@slices/category';
import { getCategoryManagementTourSteps } from '@features/admin/utils/categoryManagementTourSteps';

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
    imageUrl: null,
  });
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [tourInstanceKey, setTourInstanceKey] = useState(0);

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
        imageUrl: null,
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
      imageUrl: null,
    });
  };

  const handleSave = async (data: {
    name: string;
    description?: string | null;
    imageFile?: File | null;
  }): Promise<void> => {
    try {
      const payload = {
        name: data.name,
        description: data.description ?? null,
        imageFile: data.imageFile,
      };

      if (editingCategory) {
        await onUpdateCategory({ id: editingCategory.categoryId, ...payload });
      } else {
        await onCreateCategory(payload);
      }
      // await onGetAllCategories();
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

  const startCategoryTour = (): void => {
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
    return getCategoryManagementTourSteps({
      hasRows: categories.length > 0,
    });
  }, [categories.length]);

  const columns = [
    // {
    //   key: 'categoryId',
    //   label: 'ID',
    //   style: { width: '80px' },
    // },
    {
      key: 'imageUrl',
      label: 'Hình ảnh',
      style: { width: '100px' },
      render: (value: unknown): React.ReactNode => (
        <Avatar
          src={String(value)}
          alt="Category Image"
          variant="rounded"
          className="bg-primary-100 h-10 w-10"
        />
      ),
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
      id: 'edit',
      label: <EditIcon fontSize="small" />,
      onClick: (row: Category): void => handleOpenDialog(row),
      tooltip: 'Chỉnh sửa danh mục',
      color: 'primary' as const,
      variant: 'outlined' as const,
    },
    {
      id: 'delete',
      label: <DeleteIcon fontSize="small" />,
      onClick: (row: Category): void => handleDelete(row),
      tooltip: 'Xóa danh mục',
      color: 'error' as const,
      variant: 'outlined' as const,
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
        data-tour="category-page-header"
      >
        <div>
          <div className="mb-1 flex items-start gap-2">
            <h1 className="text-table-text-primary text-3xl font-bold">
              Quản lý Danh mục
            </h1>
            <button
              type="button"
              onClick={startCategoryTour}
              aria-label="Mở hướng dẫn quản lý danh mục"
              title="Hướng dẫn"
              className="text-primary-700 hover:text-primary-800 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
            >
              <HelpOutlineIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
          <p className="text-table-text-secondary text-sm">
            Quản lý các danh mục sản phẩm của hệ thống
          </p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          data-tour="category-create-button"
          className="bg-primary-600 hover:bg-primary-700 flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white transition-colors"
        >
          <AddIcon fontSize="small" />
          Thêm danh mục
        </button>
      </div>

      {/* Table */}
      <div data-tour="category-table-wrapper">
        <Table
          columns={columns}
          data={categories ?? []}
          rowKey="categoryId"
          actions={actions}
          loading={status === 'pending'}
          emptyMessage="Chưa có danh mục nào"
          tourId="admin-category"
        />
      </div>

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
      <DeleteConfirmationDialog
        open={openDeleteDialog}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa danh mục"
        confirmationMessage={
          <>
            Bạn có chắc chắn muốn xóa danh mục &quot;{deletingCategory?.name}
            &quot;? Hành động này không thể hoàn tác.
          </>
        }
      />
    </div>
  );
}
