import { useState, useEffect, useCallback, useMemo } from 'react';
import type { JSX } from 'react';
import { Alert, Box, CircularProgress } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import {
  type Controls,
  EVENTS,
  Joyride,
  STATUS,
  type EventData,
} from 'react-joyride';
import DishFilterSection from '@features/vendor/components/DishFilterSection';
import type { DishFilterValues } from '@features/vendor/components/DishFilterSection';
import Pagination from '@features/vendor/components/Pagination';
import useDish from '@features/vendor/hooks/useDish';
import type { Branch } from '@features/vendor/types/vendor';
import useBranchManagement from '@features/manager/hooks/useBranchManagement';
import ManagerDishSummaryBadges from '@features/manager/components/ManagerDishSummaryBadges';
import ManagerDishTable from '@features/manager/components/ManagerDishTable';
import { useAppSelector } from '@hooks/reduxHooks';
import {
  selectBranchDishes,
  selectVendorDishes,
  selectVendorDishesPagination,
} from '@slices/dish';
import { getManagerDishManagementTourSteps } from '@features/manager/utils/dishManagementTourSteps';

export default function DishManagementPage(): JSX.Element {
  const { onGetManagerMyBranch } = useBranchManagement();
  const {
    onGetDishesOfAVendor,
    onGetDishesByBranch,
    onAssignDishToBranch,
    onUnassignDishToBranch,
    onUpdateDishAvailabilityByBranch,
  } = useDish();

  const vendorDishes = useAppSelector(selectVendorDishes);
  const vendorPagination = useAppSelector(selectVendorDishesPagination);
  const branchDishes = useAppSelector(selectBranchDishes);

  const [branch, setBranch] = useState<Branch | null>(null);
  const [isLoadingBranch, setIsLoadingBranch] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [vendorPageSize, setVendorPageSize] = useState(10);
  const [filters, setFilters] = useState<DishFilterValues>({});
  const [isListLoading, setIsListLoading] = useState(false);
  const [selectedDishIds, setSelectedDishIds] = useState<number[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  const [actionLoading, setActionLoading] = useState<Set<number>>(new Set());
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [tourInstanceKey, setTourInstanceKey] = useState(0);

  const branchId = branch?.branchId;
  const vendorId = branch?.vendorId;

  const branchDishMap = useMemo<Map<number, { isSoldOut: boolean }>>(
    () =>
      new Map(
        branchDishes.map((dish) => [dish.dishId, { isSoldOut: dish.isSoldOut }])
      ),
    [branchDishes]
  );

  const fetchVendorDishes = useCallback(
    async (
      page: number,
      filterValues: DishFilterValues,
      size: number = vendorPageSize
    ): Promise<void> => {
      if (!vendorId) return;
      setIsListLoading(true);
      try {
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
      } finally {
        setIsListLoading(false);
      }
    },
    [vendorId, vendorPageSize, onGetDishesOfAVendor]
  );

  const fetchBranchDishes = useCallback(async (): Promise<void> => {
    if (!branchId) return;
    const response = await onGetDishesByBranch({
      branchId,
      params: { pageNumber: 1, pageSize: 999 },
    });
    setSelectedDishIds(response.items.map((dish) => dish.dishId));
  }, [branchId, onGetDishesByBranch]);

  useEffect(() => {
    const loadBranch = async (): Promise<void> => {
      setIsLoadingBranch(true);
      setLoadingError(null);
      try {
        const managerBranch = await onGetManagerMyBranch();
        setBranch(managerBranch);
      } catch {
        setLoadingError('Không thể tải thông tin chi nhánh của bạn.');
      } finally {
        setIsLoadingBranch(false);
      }
    };

    void loadBranch();
  }, [onGetManagerMyBranch]);

  useEffect(() => {
    if (branchId && vendorId) {
      void fetchVendorDishes(1, {});
      void fetchBranchDishes();
      setFilters({});
    }
  }, [branchId, vendorId]);

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

  const handleCheckboxToggle = (dishId: number): void => {
    setSelectedDishIds((prev) => {
      if (prev.includes(dishId)) {
        return prev.filter((id) => id !== dishId);
      }
      return [...prev, dishId];
    });
  };

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

  const handleFilterChange = useCallback(
    (newFilters: DishFilterValues): void => {
      setFilters(newFilters);
      void fetchVendorDishes(1, newFilters);
    },
    [fetchVendorDishes]
  );

  const handlePageChange = (page: number): void => {
    void fetchVendorDishes(page, filters);
  };

  const handlePageSizeChange = (newPageSize: number): void => {
    setVendorPageSize(newPageSize);
    void fetchVendorDishes(1, filters, newPageSize);
  };

  const assignedCount = useMemo(() => branchDishMap.size, [branchDishMap]);

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
    return getManagerDishManagementTourSteps({
      hasRows: vendorDishes.length > 0,
    });
  }, [vendorDishes.length]);

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

      <div className="mb-6">
        <div data-tour="manager-dish-header">
          <div className="mb-1 flex items-start gap-2">
            <h1 className="text-table-text-primary text-3xl font-bold">
              Quản lý thực đơn
            </h1>
            <button
              type="button"
              onClick={startDishTour}
              aria-label="Mở hướng dẫn quản lý thực đơn"
              title="Hướng dẫn"
              className="text-primary-700 hover:text-primary-800 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
            >
              <HelpOutlineIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
          <p className="text-table-text-secondary text-sm">
            Quản lý danh sách món ăn của {branch?.name ?? 'chi nhánh'} và cập
            nhật tình trạng còn món / hết món
          </p>
        </div>
      </div>

      {isLoadingBranch ? (
        <Box className="flex items-center justify-center rounded-lg border border-gray-200 bg-white py-16">
          <CircularProgress />
        </Box>
      ) : loadingError ? (
        <Alert severity="error">{loadingError}</Alert>
      ) : !branch ? (
        <Box className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-600">
          Không có chi nhánh nào được phân công cho bạn.
        </Box>
      ) : (
        <Box className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div
            className="mb-5 flex flex-wrap items-center justify-between gap-3"
            data-tour="manager-dish-summary"
          >
            <div>
              <h2 className="text-table-text-primary text-lg font-bold">
                Chi nhánh {branch.name}
              </h2>
            </div>
            <ManagerDishSummaryBadges
              totalOnPage={vendorDishes.length}
              assignedCount={assignedCount}
              selectedCount={selectedDishIds.length}
            />
          </div>

          <div data-tour="manager-dish-filter">
            <DishFilterSection onFilterChange={handleFilterChange} />
          </div>

          <div
            className="mt-4 flex w-full justify-center"
            data-tour="manager-dish-save-button"
          >
            <button
              onClick={() => {
                void handleApply();
              }}
              disabled={isApplying || !isDirty}
              className="bg-primary-600 hover:bg-primary-700 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {isApplying && <CircularProgress size={16} color="inherit" />}
              {isApplying ? 'Đang lưu...' : 'Lưu món ăn'}
            </button>
          </div>

          <div className="mt-4" data-tour="manager-dish-table-wrapper">
            <ManagerDishTable
              dishes={vendorDishes}
              selectedDishIdSet={selectedDishIdSet}
              branchDishMap={branchDishMap}
              actionLoading={actionLoading}
              isApplying={isApplying}
              loading={isListLoading}
              tourId="manager-dish"
              onToggleSelection={handleCheckboxToggle}
              onToggleAvailability={(dishId, currentSoldOut) => {
                void handleToggleAvailability(dishId, currentSoldOut);
              }}
            />
          </div>

          <div
            className="mt-4 border-t border-gray-100 bg-gray-50/60 px-2 py-3"
            data-tour="manager-dish-pagination"
          >
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
        </Box>
      )}
    </div>
  );
}
