import { useState, useEffect, useCallback, useMemo } from 'react';
import type { JSX } from 'react';
import type { Branch } from '@features/vendor/types/vendor';
import type { CreateOrUpdateDishResponse } from '@features/vendor/types/dish';
import type { DishFilterValues } from '@features/vendor/components/DishFilterSection';
import DishFilterSection from '@features/vendor/components/DishFilterSection';
import useDish from '@features/vendor/hooks/useDish';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import { Checkbox, Switch } from '@mui/material';
import Table from '@features/vendor/components/Table';
import Pagination from '@features/vendor/components/Pagination';
import VendorModalHeader from '@features/vendor/components/VendorModalHeader';
import { useAppSelector } from '@hooks/reduxHooks';
import { Link } from 'react-router-dom';
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

  // const activeVendorDishes = useMemo(
  //   () => vendorDishes.filter((dish) => dish.isActive),
  //   [vendorDishes]
  // );

  // ─── Local UI state ──────────────────────────────────────────
  const [vendorPageSize, setVendorPageSize] = useState(5);
  const [filters, setFilters] = useState<DishFilterValues>({});
  const [selectedDishIds, setSelectedDishIds] = useState<number[]>([]);
  const [isApplying, setIsApplying] = useState(false);
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
    const response = await onGetDishesByBranch({
      branchId,
      params: { pageNumber: 1, pageSize: 999 },
    });
    setSelectedDishIds(response.items.map((dish) => dish.dishId));
  }, [branchId, onGetDishesByBranch]);

  // ─── Initial load ───────────────────────────────────────────
  useEffect(() => {
    if (isOpen && vendorId && branchId) {
      void fetchVendorDishes(1, {});
      void fetchBranchDishes();
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

  const selectedDishIdSet = useMemo(
    () => new Set(selectedDishIds),
    [selectedDishIds]
  );

  const currentAssignedDishIdSet = useMemo(
    () => new Set(branchDishes.map((dish) => dish.dishId)),
    [branchDishes]
  );

  const isDirty = useMemo(() => {
    if (selectedDishIds.length !== currentAssignedDishIdSet.size) {
      return true;
    }
    return selectedDishIds.some(
      (dishId) => !currentAssignedDishIdSet.has(dishId)
    );
  }, [currentAssignedDishIdSet, selectedDishIds]);

  // ─── Checkbox toggle (local selection only) ─────────────────
  const handleCheckboxToggle = (dishId: number): void => {
    setSelectedDishIds((prev) => {
      if (prev.includes(dishId)) {
        return prev.filter((id) => id !== dishId);
      }
      return [...prev, dishId];
    });
  };

  // ─── Apply all selection changes in batch ───────────────────
  const handleApply = async (): Promise<void> => {
    if (!branchId || !isDirty || isApplying) {
      return;
    }

    const dishIdsToAssign = selectedDishIds.filter(
      (dishId) => !currentAssignedDishIdSet.has(dishId)
    );
    const dishIdsToUnassign = [...currentAssignedDishIdSet].filter(
      (dishId) => !selectedDishIdSet.has(dishId)
    );

    setIsApplying(true);
    try {
      if (dishIdsToAssign.length > 0) {
        await onAssignDishToBranch({
          branchId,
          data: { dishIds: dishIdsToAssign },
        });
      }

      if (dishIdsToUnassign.length > 0) {
        await onUnassignDishToBranch({
          branchId,
          data: { dishIds: dishIdsToUnassign },
        });
      }
    } finally {
      setIsApplying(false);
    }
  };

  // ─── Filter change handler ─────────────────────────────────
  const handleFilterChange = useCallback(
    (newFilters: DishFilterValues) => {
      setFilters(newFilters);
      void fetchVendorDishes(1, newFilters);
    },
    [fetchVendorDishes]
  );

  // ─── Page change handler ───────────────────────────────────
  const handlePageChange = (page: number): void => {
    void fetchVendorDishes(page, filters);
  };

  const handlePageSizeChange = (newPageSize: number): void => {
    setVendorPageSize(newPageSize);
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
        const isSelected = selectedDishIdSet.has(dish.dishId);

        return (
          <Checkbox
            checked={isSelected}
            onChange={() => handleCheckboxToggle(dish.dishId)}
            disabled={isApplying}
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
        const isAssigned = selectedDishIdSet.has(dish.dishId);
        return (
          <div className="flex items-center gap-3">
            {dish.imageUrl ? (
              <img
                src={dish.imageUrl}
                alt={dish.name}
                className="h-10 w-10 shrink-0 rounded-lg object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-200 text-gray-400">
                <RestaurantMenuIcon sx={{ fontSize: 18 }} />
              </div>
            )}
            <div className="min-w-0">
              <p
                className={`truncate text-sm font-semibold ${
                  isAssigned ? 'text-table-text-primary' : 'text-gray-400'
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
        const isAssigned = selectedDishIdSet.has(dish.dishId);
        return (
          <span
            className={`inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
              isAssigned
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-gray-200 bg-gray-100 text-gray-400'
            }`}
          >
            {isAssigned
              ? 'Đã gán vào chi nhánh này'
              : 'Chưa gán vào chi nhánh này'}
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
        const isAssigned = selectedDishIdSet.has(dish.dishId);
        const branchInfo = branchDishMap.get(dish.dishId);
        const isSoldOut = branchInfo?.isSoldOut ?? false;
        const isItemLoading = actionLoading.has(dish.dishId);

        return (
          <div className="flex items-center justify-center gap-1.5">
            <Switch
              checked={isAssigned && !isSoldOut}
              disabled={!isAssigned || isItemLoading || isApplying}
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
              className={`min-w-14 text-[11px] font-bold ${
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
        <VendorModalHeader
          title="Quản lý thực đơn"
          subtitle={`${branch.name}`}
          icon={<RestaurantMenuIcon />}
          iconTone="dish"
          onClose={onClose}
        />

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
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
              Đang chọn: {selectedDishIds.length} món
            </span>
          </div>

          {/* ─── Filter Section ─────────────────────────────── */}
          <DishFilterSection onFilterChange={handleFilterChange} />

          <div className="mt-4 flex w-full justify-center">
            <button
              onClick={() => void handleApply()}
              disabled={status === 'pending' || isApplying || !isDirty}
              className="bg-primary-600 hover:bg-primary-700 inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {isApplying ? 'Đang thêm món...' : 'Thêm món'}
            </button>
          </div>

          {/* ─── Dish List ──────────────────────────────────── */}
          <div className="mt-4">
            <Table
              columns={columns}
              data={vendorDishes}
              rowKey="dishId"
              loading={status === 'pending'}
              emptyMessage={
                <span>
                  Không tìm thấy món ăn nào. Vui lòng tạo món ăn mới tại trang{' '}
                  <Link
                    to="/vendor/dish"
                    className="text-primary-600 hover:text-primary-700 font-semibold underline"
                  >
                    Quản lý món ăn
                  </Link>{' '}
                  trước khi gán vào chi nhánh.
                </span>
              }
            />
          </div>

          {vendorPagination.totalCount > 0 && (
            <div className="mt-4">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
