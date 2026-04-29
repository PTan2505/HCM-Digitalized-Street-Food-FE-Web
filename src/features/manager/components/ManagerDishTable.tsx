import type { JSX, ReactNode } from 'react';
import { Checkbox, Switch } from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import Table from '@features/vendor/components/Table';
import type { CreateOrUpdateDishResponse } from '@features/vendor/types/dish';

interface ManagerDishTableProps {
  dishes: CreateOrUpdateDishResponse[];
  selectedDishIdSet: Set<number>;
  branchDishMap: Map<number, { isSoldOut: boolean }>;
  actionLoading: Set<number>;
  isApplying: boolean;
  loading: boolean;
  tourId?: string;
  onToggleSelection: (dishId: number) => void;
  onToggleAllSelection?: (dishIds: number[], select: boolean) => void;
  onToggleAvailability: (dishId: number, currentSoldOut: boolean) => void;
}

export default function ManagerDishTable({
  dishes,
  selectedDishIdSet,
  branchDishMap,
  actionLoading,
  isApplying,
  loading,
  tourId,
  onToggleSelection,
  onToggleAllSelection,
  onToggleAvailability,
}: ManagerDishTableProps): JSX.Element {
  const isAllSelectedOnPage =
    dishes.length > 0 &&
    dishes.every((dish) => selectedDishIdSet.has(dish.dishId));
  const isIndeterminate =
    dishes.length > 0 &&
    dishes.some((dish) => selectedDishIdSet.has(dish.dishId)) &&
    !isAllSelectedOnPage;

  const columns = [
    {
      key: 'checkbox',
      label: (
        <button
          type="button"
          onClick={() => {
            if (onToggleAllSelection) {
              onToggleAllSelection(
                dishes.map((d) => d.dishId),
                !isAllSelectedOnPage
              );
            }
          }}
          disabled={isApplying || dishes.length === 0}
          className="text-primary-600 hover:text-primary-700 text-[11px] font-bold whitespace-nowrap disabled:cursor-not-allowed disabled:text-gray-400"
        >
          {isAllSelectedOnPage ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
        </button>
      ),
      style: { width: '100px', textAlign: 'center' as const },
      render: (_: unknown, dish: CreateOrUpdateDishResponse): ReactNode => {
        const isSelected = selectedDishIdSet.has(dish.dishId);

        return (
          <Checkbox
            checked={isSelected}
            onChange={() => onToggleSelection(dish.dishId)}
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
      render: (_: unknown, dish: CreateOrUpdateDishResponse): ReactNode => {
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
      render: (_: unknown, dish: CreateOrUpdateDishResponse): ReactNode => {
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
      render: (_: unknown, dish: CreateOrUpdateDishResponse): ReactNode => {
        const isAssigned = selectedDishIdSet.has(dish.dishId);
        const branchInfo = branchDishMap.get(dish.dishId);
        const isSoldOut = branchInfo?.isSoldOut ?? false;
        const isItemLoading = actionLoading.has(dish.dishId);

        return (
          <div className="flex items-center justify-center gap-1.5">
            <Switch
              checked={isAssigned && !isSoldOut}
              disabled={!isAssigned || isItemLoading || isApplying}
              onChange={() => onToggleAvailability(dish.dishId, isSoldOut)}
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

  return (
    <Table
      columns={columns}
      data={dishes}
      rowKey="dishId"
      loading={loading}
      tourId={tourId}
      emptyMessage={
        <span>Không tìm thấy món ăn phù hợp với từ khóa tìm kiếm.</span>
      }
    />
  );
}
