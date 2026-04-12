import { useState, useEffect, useMemo } from 'react';
import type { JSX } from 'react';
import { Avatar, Box, Chip } from '@mui/material';
import DeleteConfirmationDialog from '@components/ui/DeleteConfirmationDialog';
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
import { getDishManagementTourSteps } from '@features/vendor/utils/dishManagementTourSteps';

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
  const [pageSize, setPageSize] = useState(5);
  const [filters, setFilters] = useState<DishFilterValues>({});
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [tourInstanceKey, setTourInstanceKey] = useState(0);

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

  const startDishTour = (): void => {
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
    return getDishManagementTourSteps({
      hasRows: dishes.length > 0,
    });
  }, [dishes.length]);

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
          className="bg-primary-100 h-10 w-10"
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
          className="bg-primary-100 text-primary-800 font-semibold"
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
      id: 'edit',
      label: <EditIcon fontSize="small" />,
      menuLabel: 'Chỉnh sửa',
      onClick: (row: CreateOrUpdateDishResponse): void =>
        handleOpenEditModal(row),
      color: 'primary' as const,
    },
    {
      id: 'delete',
      label: <DeleteIcon fontSize="small" />,
      menuLabel: 'Xóa món',
      onClick: (row: CreateOrUpdateDishResponse): void => handleDelete(row),
      color: 'error' as const,
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
        data-tour="dish-page-header"
      >
        <div>
          <div className="mb-1 flex items-start gap-2">
            <h1 className="text-table-text-primary text-3xl font-bold">
              Quản lý món ăn
            </h1>
            <button
              type="button"
              onClick={startDishTour}
              aria-label="Mở hướng dẫn quản lý món ăn"
              title="Hướng dẫn"
              className="text-primary-700 hover:text-primary-800 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
            >
              <HelpOutlineIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
          <p className="text-table-text-secondary text-sm">
            Danh sách các món ăn của cửa hàng
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          data-tour="dish-create-button"
          className="bg-primary-600 hover:bg-primary-700 flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white transition-colors"
        >
          <AddIcon fontSize="small" />
          Thêm món ăn
        </button>
      </div>

      {/* Filter Section */}
      <div data-tour="dish-filter-section">
        <DishFilterSection onFilterChange={handleFilterChange} />
      </div>

      {/* Table */}
      <div data-tour="dish-table-wrapper">
        <Table
          columns={columns}
          data={dishes}
          rowKey="dishId"
          actions={actions}
          loading={status === 'pending'}
          emptyMessage="Chưa có món ăn nào"
          tourId="vendor-dish"
        />
      </div>

      {/* Pagination */}
      <div data-tour="dish-pagination">
        <Pagination
          currentPage={pageNumber}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalCount}
          pageSize={pageSize}
          hasPrevious={pagination.hasPrevious}
          hasNext={pagination.hasNext}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

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
