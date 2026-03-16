import { useState, useEffect, useCallback, useMemo } from 'react';
import type { JSX } from 'react';
import type { Branch } from '@features/vendor/types/vendor';
import type { CreateOrUpdateDishResponse } from '@features/vendor/types/dish';
import type { DishFilterValues } from '@features/vendor/components/DishFilterSection';
import DishFilterSection from '@features/vendor/components/DishFilterSection';
import useDish from '@features/vendor/hooks/useDish';
import CloseIcon from '@mui/icons-material/Close';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import IconButton from '@mui/material/IconButton';
import { Checkbox, Switch, CircularProgress } from '@mui/material';
import Table from '@features/vendor/components/Table';
import Pagination from '@features/vendor/components/Pagination';
import { useAppSelector } from '@hooks/reduxHooks';
import {
  selectVendorDishes,
  selectVendorDishesPagination,
  selectBranchDishes,
  selectDishStatus,
} from '@slices/dish';

interface BranchDishDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: Branch | null;
  vendorId?: number;
}

export default function BranchDishDetailsModal({
  isOpen,
  onClose,
  branch,
  vendorId,
}: BranchDishDetailsModalProps): JSX.Element | null {
  const {
    onGetDishesOfAVendor,
    onGetDishesByBranch,
    onAssignDishToBranch,
    onUnassignDishToBranch,
    onUpdateDishAvailabilityByBranch,
  } = useDish();

  // ─── Redux state ────────────────────────────────────────────
  const vendorDishes = useAppSelector(selectVendorDishes);
  const vendorPagination = useAppSelector(selectVendorDishesPagination);
  const branchDishes = useAppSelector(selectBranchDishes);
  const status = useAppSelector(selectDishStatus);

  // Derive branchDishMap từ branchDishes trong slice (Map<dishId, { isSoldOut }>)
  const branchDishMap = useMemo<Map<number, { isSoldOut: boolean }>>(
    () =>
      new Map(branchDishes.map((d) => [d.dishId, { isSoldOut: d.isSoldOut }])),
    [branchDishes]
  );

  // ─── Local UI state ──────────────────────────────────────────
  const [vendorPage, setVendorPage] = useState(1);
  const [vendorPageSize, setVendorPageSize] = useState(10);
  const [filters, setFilters] = useState<DishFilterValues>({});
  const [actionLoading, setActionLoading] = useState<Set<number>>(new Set());

  const branchId = branch?.branchId;

  // ─── Fetch vendor dishes ────────────────────────────────────
  const fetchVendorDishes = useCallback(
    async (
      page: number,
      filterValues: DishFilterValues,
      size: number = vendorPageSize
    ) => {
      if (!vendorId) return;
      await onGetDishesOfAVendor({
        vendorId,
        params: {
          pageNumber: page,
          pageSize: size,
          ...(filterValues.keyword ? { keyword: filterValues.keyword } : {}),
          ...(filterValues.categoryId
            ? { categoryId: filterValues.categoryId }
            : {}),
        },
      });
    },
    [vendorId, vendorPageSize, onGetDishesOfAVendor]
  );

  // ─── Fetch branch dishes (all pages) ───────────────────────
  const fetchBranchDishes = useCallback(async () => {
    if (!branchId) return;
    await onGetDishesByBranch({
      branchId,
      params: { pageNumber: 1, pageSize: 999 },
    });
  }, [branchId, onGetDishesByBranch]);

  // ─── Initial load ───────────────────────────────────────────
  useEffect(() => {
    if (isOpen && vendorId && branchId) {
      void fetchVendorDishes(1, {});
      void fetchBranchDishes();
      setVendorPage(1);
      setFilters({});
    }
    // fetchVendorDishes / fetchBranchDishes are intentionally excluded:
    // including them causes this reset effect to re-fire whenever pageSize
    // changes (because vendorPageSize is in fetchVendorDishes's deps),
    // which wipes the active filters.
  }, [isOpen, vendorId, branchId]);

  // ─── Helpers ────────────────────────────────────────────────
  const addToActionLoading = (dishId: number): void => {
    setActionLoading((prev) => new Set(prev).add(dishId));
  };

  const removeFromActionLoading = (dishId: number): void => {
    setActionLoading((prev) => {
      const next = new Set(prev);
      next.delete(dishId);
      return next;
    });
  };

  // ─── Assign dish ────────────────────────────────────────────
  const handleAssign = async (dishId: number): Promise<void> => {
    if (!branchId) return;
    addToActionLoading(dishId);
    try {
      await onAssignDishToBranch({
        branchId,
        data: { dishIds: [dishId] },
      });
      // slice's addCase(assignDishToBranch.fulfilled) sẽ push dish vào branchDishes
    } finally {
      removeFromActionLoading(dishId);
    }
  };

  // ─── Unassign dish ──────────────────────────────────────────
  const handleUnassign = async (dishId: number): Promise<void> => {
    if (!branchId) return;
    addToActionLoading(dishId);
    try {
      await onUnassignDishToBranch({
        branchId,
        data: { dishIds: [dishId] },
      });
      // slice's addCase(unassignDishToBranch.fulfilled) sẽ filter branchDishes
    } finally {
      removeFromActionLoading(dishId);
    }
  };

  // ─── Toggle availability ────────────────────────────────────
  const handleToggleAvailability = async (
    dishId: number,
    currentSoldOut: boolean
  ): Promise<void> => {
    if (!branchId) return;
    addToActionLoading(dishId);
    try {
      await onUpdateDishAvailabilityByBranch({
        dishId,
        branchId,
        data: { isSoldOut: !currentSoldOut },
      });
      // slice's addCase(updateDishAvailabilityByBranch.fulfilled) sẽ cập nhật isSoldOut
    } finally {
      removeFromActionLoading(dishId);
    }
  };

  // ─── Checkbox toggle ────────────────────────────────────────
  const handleCheckboxToggle = (dishId: number): void => {
    const isAssigned = branchDishMap.has(dishId);
    if (isAssigned) {
      void handleUnassign(dishId);
    } else {
      void handleAssign(dishId);
    }
  };

  // ─── Filter change handler ─────────────────────────────────
  const handleFilterChange = useCallback(
    (newFilters: DishFilterValues) => {
      setFilters(newFilters);
      setVendorPage(1);
      void fetchVendorDishes(1, newFilters);
    },
    [fetchVendorDishes]
  );

  // ─── Page change handler ───────────────────────────────────
  const handlePageChange = (page: number): void => {
    setVendorPage(page);
    void fetchVendorDishes(page, filters);
  };

  const handlePageSizeChange = (newPageSize: number): void => {
    setVendorPageSize(newPageSize);
    setVendorPage(1);
    void fetchVendorDishes(1, filters, newPageSize);
  };

  // ─── Columns configuration ──────────────────────────────────
  const columns = [
    {
      key: 'checkbox',
      label: '',
      style: { width: '48px', textAlign: 'center' as const },
      render: (
        _: unknown,
        dish: CreateOrUpdateDishResponse
      ): React.ReactNode => {
        const isAssigned = branchDishMap.has(dish.dishId);
        const isItemLoading = actionLoading.has(dish.dishId);

        return isItemLoading ? (
          <CircularProgress size={20} />
        ) : (
          <Checkbox
            checked={isAssigned}
            onChange={() => handleCheckboxToggle(dish.dishId)}
            size="small"
            sx={{
              color: '#d1d5db',
              '&.Mui-checked': {
                color: 'var(--color-primary-600)',
              },
            }}
          />
        );
      },
    },
    {
      key: 'dish',
      label: 'Tên món ăn',
      render: (
        _: unknown,
        dish: CreateOrUpdateDishResponse
      ): React.ReactNode => {
        const isAssigned = branchDishMap.has(dish.dishId);
        return (
          <div className="flex items-center gap-3">
            {dish.imageUrl ? (
              <img
                src={dish.imageUrl}
                alt={dish.name}
                className="h-10 w-10 flex-shrink-0 rounded-lg object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-200 text-gray-400">
                <RestaurantMenuIcon sx={{ fontSize: 18 }} />
              </div>
            )}
            <div className="min-w-0">
              <p
                className={`truncate text-sm font-semibold ${
                  isAssigned
                    ? 'text-[var(--color-table-text-primary)]'
                    : 'text-gray-400'
                }`}
              >
                {dish.name}
              </p>
              <p className="truncate text-xs text-gray-400">
                {dish.categoryName} • {dish.price.toLocaleString('vi-VN')}₫
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Trạng thái',
      style: { width: '120px', textAlign: 'center' as const },
      render: (
        _: unknown,
        dish: CreateOrUpdateDishResponse
      ): React.ReactNode => {
        const isAssigned = branchDishMap.has(dish.dishId);
        return (
          <span
            className={`inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
              isAssigned
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-gray-200 bg-gray-100 text-gray-400'
            }`}
          >
            {isAssigned ? 'Đã gán' : 'Chưa gán'}
          </span>
        );
      },
    },
    {
      key: 'availability',
      label: 'Còn / Hết',
      style: { width: '160px', textAlign: 'center' as const },
      render: (
        _: unknown,
        dish: CreateOrUpdateDishResponse
      ): React.ReactNode => {
        const isAssigned = branchDishMap.has(dish.dishId);
        const branchInfo = branchDishMap.get(dish.dishId);
        const isSoldOut = branchInfo?.isSoldOut ?? false;
        const isItemLoading = actionLoading.has(dish.dishId);

        return (
          <div className="flex items-center justify-center gap-1.5">
            <Switch
              checked={isAssigned && !isSoldOut}
              disabled={!isAssigned || isItemLoading}
              onChange={() => handleToggleAvailability(dish.dishId, isSoldOut)}
              size="small"
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#22c55e',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#22c55e',
                },
              }}
            />
            <span
              className={`min-w-[56px] text-[11px] font-bold ${
                !isAssigned
                  ? 'text-gray-300'
                  : isSoldOut
                    ? 'text-red-500'
                    : 'text-green-600'
              }`}
            >
              {!isAssigned ? '—' : isSoldOut ? 'Hết món' : 'Còn món'}
            </span>
          </div>
        );
      },
    },
  ];

  // ─── Summary stats ─────────────────────────────────────────
  const assignedCount = useMemo(() => branchDishMap.size, [branchDishMap]);

  if (!isOpen || !branch) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity"
      onClick={onClose}
    >
      <div
        className="mx-4 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Modal Header ─────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <RestaurantMenuIcon />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--color-table-text-primary)] md:text-2xl">
                Quản lý thực đơn
              </h2>
              <p className="mt-0.5 flex items-center gap-2 text-sm font-medium text-[var(--color-table-text-secondary)]">
                <span className="rounded-md bg-gray-200 px-2 py-0.5 text-xs text-gray-700">
                  #{branch.branchId}
                </span>
                {branch.name}
              </p>
            </div>
          </div>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              bgcolor: 'white',
              border: '1px solid #f3f4f6',
              '&:hover': { bgcolor: '#f3f4f6' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>

        {/* ─── Modal Content ────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {/* Summary badges */}
          <div className="mb-5 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              Tổng: {vendorDishes.length} món trên trang
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Đã gán: {assignedCount} món
            </span>
          </div>

          {/* ─── Filter Section ─────────────────────────────── */}
          <DishFilterSection onFilterChange={handleFilterChange} />

          {/* ─── Dish List ──────────────────────────────────── */}
          <div className="mt-4">
            <Table
              columns={columns}
              data={vendorDishes}
              rowKey="dishId"
              loading={status === 'pending'}
              emptyMessage="Không tìm thấy món ăn nào."
            />

            {/* Pagination */}
            {vendorPagination.totalCount > 0 && (
              <Pagination
                currentPage={vendorPagination.currentPage}
                totalPages={vendorPagination.totalPages}
                totalCount={vendorPagination.totalCount}
                pageSize={vendorPagination.pageSize}
                hasPrevious={vendorPagination.hasPrevious}
                hasNext={vendorPagination.hasNext}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                pageSizeOptions={[5, 10, 20]}
              />
            )}
          </div>
        </div>

        {/* ─── Modal Footer ─────────────────────────────────── */}
        <div className="flex items-center justify-end border-t border-gray-100 bg-gray-50/50 px-8 py-4">
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg bg-gray-100 px-5 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-200"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
