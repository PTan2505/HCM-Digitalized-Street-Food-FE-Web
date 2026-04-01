import { useState, useEffect } from 'react';
import type { JSX } from 'react';
import { Avatar, Box, Chip } from '@mui/material';
import DeleteConfirmationDialog from '@components/ui/DeleteConfirmationDialog';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import Table from '@features/vendor/components/Table';
import Pagination from '@features/vendor/components/Pagination';
import DishFormModal from '@features/vendor/components/DishFormModal';
import DishFilterSection from '@features/vendor/components/DishFilterSection';
import type { DishFilterValues } from '@features/vendor/components/DishFilterSection';
import type { CreateOrUpdateDishResponse } from '@features/vendor/types/dish';
import useDish from '@features/vendor/hooks/useDish';
import useVendor from '@features/vendor/hooks/useVendor';
import { useAppSelector } from '@hooks/reduxHooks';
import {
  selectVendorDishes,
  selectVendorDishesPagination,
  selectDishStatus,
} from '@slices/dish';
import { selectMyVendor } from '@slices/vendor';

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
      className={`inline-flex min-w-[100px] items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-bold shadow-sm ${colors[type]}`}
    >
      {label}
    </span>
  );
};

export default function DishPage(): JSX.Element {
  const myVendor = useAppSelector(selectMyVendor);
  const dishes = useAppSelector(selectVendorDishes);
  const pagination = useAppSelector(selectVendorDishesPagination);
  const status = useAppSelector(selectDishStatus);

  const { onGetMyVendor } = useVendor();
  const { onCreateDish, onUpdateDish, onDeleteDish, onGetDishesOfAVendor } =
    useDish();

  const [openFormModal, setOpenFormModal] = useState(false);
  const [editingDish, setEditingDish] =
    useState<CreateOrUpdateDishResponse | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletingDish, setDeletingDish] =
    useState<CreateOrUpdateDishResponse | null>(null);

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<DishFilterValues>({});

  const vendorId = myVendor?.vendorId;

  // Fetch vendor info on mount
  useEffect(() => {
    void onGetMyVendor();
  }, [onGetMyVendor]);

  // Fetch dishes whenever vendorId / page / filters change
  useEffect(() => {
    if (vendorId !== undefined) {
      void onGetDishesOfAVendor({
        vendorId,
        params: {
          pageNumber,
          pageSize,
          ...(filters.categoryId !== undefined && {
            categoryId: filters.categoryId,
          }),
          ...(filters.keyword !== undefined &&
            filters.keyword !== '' && { keyword: filters.keyword }),
        },
      });
    }
  }, [vendorId, pageNumber, pageSize, filters, onGetDishesOfAVendor]);

  // ─── Handlers ──────────────────────────────────────────

  const handleOpenCreateModal = (): void => {
    setEditingDish(null);
    setOpenFormModal(true);
  };

  const handleOpenEditModal = (dish: CreateOrUpdateDishResponse): void => {
    setEditingDish(dish);
    setOpenFormModal(true);
  };

  const handleCloseFormModal = (): void => {
    setOpenFormModal(false);
    setEditingDish(null);
  };

  const handleFormSuccess = (): void => {
    handleCloseFormModal();
  };

  const handleFilterChange = (newFilters: DishFilterValues): void => {
    setFilters(newFilters);
    setPageNumber(1); // Reset về trang 1 khi đổi filter
  };

  const handleDelete = (dish: CreateOrUpdateDishResponse): void => {
    setDeletingDish(dish);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (deletingDish) {
      try {
        await onDeleteDish(deletingDish.dishId);
        setOpenDeleteDialog(false);
        setDeletingDish(null);
      } catch (error) {
        console.error('Failed to delete dish:', error);
      }
    }
  };

  const handleCancelDelete = (): void => {
    setOpenDeleteDialog(false);
    setDeletingDish(null);
  };

  const handlePageChange = (page: number): void => {
    setPageNumber(page);
  };

  const handlePageSizeChange = (size: number): void => {
    setPageSize(size);
    setPageNumber(1);
  };

  // ─── Table config ──────────────────────────────────────

  const columns = [
    // {
    //   key: 'dishId',
    //   label: 'ID',
    //   style: { width: '60px' },
    // },
    {
      key: 'imageUrl',
      label: 'Ảnh',
      style: { width: '80px' },
      render: (value: unknown): React.ReactNode => (
        <Avatar
          src={String(value)}
          alt="Dish"
          variant="rounded"
          className="h-10 w-10 bg-[var(--color-primary-100)]"
        />
      ),
    },
    {
      key: 'name',
      label: 'Tên món',
      render: (value: unknown): React.ReactNode => (
        <Box className="text-table-text-primary font-semibold">
          {String(value)}
        </Box>
      ),
    },
    {
      key: 'price',
      label: 'Giá',
      style: { width: '120px' },
      render: (value: unknown): React.ReactNode => (
        <Chip
          label={`${Number(value).toLocaleString('vi-VN')}đ`}
          size="small"
          className="bg-[var(--color-primary-100)] font-[var(--font-nunito)] font-semibold text-[var(--color-primary-800)]"
        />
      ),
    },
    {
      key: 'categoryName',
      label: 'Danh mục',
      style: { width: '140px' },
    },
    {
      key: 'tasteNames',
      label: 'Hương vị',
      render: (value: unknown): React.ReactNode => {
        const names = value as string[];
        return (
          <Box className="flex flex-wrap gap-1">
            {names.length > 0
              ? names.map((n) => (
                  <Chip key={n} label={n} size="small" variant="outlined" />
                ))
              : '-'}
          </Box>
        );
      },
    },
    // {
    //   key: 'dietaryPreferenceNames',
    //   label: 'Chế độ ăn',
    //   render: (value: unknown): React.ReactNode => {
    //     const names = value as string[];
    //     return (
    //       <Box className="flex flex-wrap gap-1">
    //         {names.length > 0
    //           ? names.map((n) => (
    //               <Chip key={n} label={n} size="small" variant="outlined" />
    //             ))
    //           : '-'}
    //       </Box>
    //     );
    //   },
    // },
    {
      key: 'isActive',
      label: 'Trạng thái',
      style: { width: '130px' },
      render: (value: unknown): React.ReactNode => (
        <StatusBadge
          label={value ? 'Đang bán' : 'Ngừng bán'}
          type={value ? 'success' : 'error'}
        />
      ),
    },
  ];

  const actions = [
    {
      label: <EditIcon fontSize="small" />,
      menuLabel: 'Chỉnh sửa',
      onClick: (row: CreateOrUpdateDishResponse): void =>
        handleOpenEditModal(row),
      color: 'primary' as const,
    },
    {
      label: <DeleteIcon fontSize="small" />,
      menuLabel: 'Xóa món',
      onClick: (row: CreateOrUpdateDishResponse): void => handleDelete(row),
      color: 'error' as const,
    },
  ];

  return (
    <div className="font-[var(--font-nunito)]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-bold text-[var(--color-table-text-primary)]">
            Quản lý món ăn
          </h1>
          <p className="text-sm text-[var(--color-table-text-secondary)]">
            Danh sách các món ăn của cửa hàng
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 rounded-lg bg-[var(--color-primary-600)] px-4 py-2 font-semibold text-white transition-colors hover:bg-[var(--color-primary-700)]"
        >
          <AddIcon fontSize="small" />
          Thêm món ăn
        </button>
      </div>

      {/* Filter Section */}
      <DishFilterSection onFilterChange={handleFilterChange} />

      {/* Table */}
      <Table
        columns={columns}
        data={dishes}
        rowKey="dishId"
        actions={actions}
        loading={status === 'pending'}
        emptyMessage="Chưa có món ăn nào"
      />

      {/* Pagination */}
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalCount={pagination.totalCount}
        pageSize={pagination.pageSize}
        hasPrevious={pagination.hasPrevious}
        hasNext={pagination.hasNext}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Form Modal */}
      <DishFormModal
        isOpen={openFormModal}
        isEditMode={!!editingDish}
        editingDish={editingDish}
        vendorId={vendorId ?? 0}
        onClose={handleCloseFormModal}
        onCreateDish={onCreateDish}
        onUpdateDish={onUpdateDish}
        onSuccess={handleFormSuccess}
      />

      <DeleteConfirmationDialog
        open={openDeleteDialog}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa món ăn"
        confirmationMessage={
          <>
            Bạn có chắc chắn muốn xóa món &quot;{deletingDish?.name}&quot;? Hành
            động này không thể hoàn tác.
          </>
        }
      />
    </div>
  );
}
