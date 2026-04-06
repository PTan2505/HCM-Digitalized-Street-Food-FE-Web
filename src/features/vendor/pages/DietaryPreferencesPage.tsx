import { useCallback, useEffect, useMemo, useState } from 'react';
import type { JSX } from 'react';
import { Box, Checkbox, CircularProgress, Chip } from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import Table from '@features/vendor/components/Table';
import useVendor from '@features/vendor/hooks/useVendor';
import useDietary from '@features/admin/hooks/useDietary';
import { useAppSelector } from '@hooks/reduxHooks';
import {
  selectMyVendor,
  selectMyVendorDietaryPreferences,
  selectVendorStatus,
} from '@slices/vendor';
import {
  selectUserDietaryPreferenceStatus,
  selectUserDietaryPreferences,
} from '@slices/userPreferenceDietary';

export default function DietaryPreferencesPage(): JSX.Element {
  const dietaryPreferences = useAppSelector(selectUserDietaryPreferences);
  const myVendor = useAppSelector(selectMyVendor);
  const myVendorDietaryPreferences = useAppSelector(
    selectMyVendorDietaryPreferences
  );
  const vendorStatus = useAppSelector(selectVendorStatus);
  const dietaryStatus = useAppSelector(selectUserDietaryPreferenceStatus);

  const { onGetAllUserDietaryPreferences } = useDietary();
  const {
    onGetMyVendor,
    onGetDietaryPreferencesOfMyVendor,
    onUpdateDietaryPreferencesOfMyVendor,
  } = useVendor();

  const vendorId = myVendor?.vendorId;

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const initialIdSet = useMemo(
    () => new Set(myVendorDietaryPreferences.map((d) => d.dietaryPreferenceId)),
    [myVendorDietaryPreferences]
  );

  const isDirty = useMemo(() => {
    if (selectedIds.length !== initialIdSet.size) {
      return true;
    }
    return selectedIds.some((id) => !initialIdSet.has(id));
  }, [initialIdSet, selectedIds]);

  const fetchAllDietaryPreferences = useCallback(async (): Promise<void> => {
    await onGetAllUserDietaryPreferences();
  }, [onGetAllUserDietaryPreferences]);

  const fetchMyVendorDietaryPreferences =
    useCallback(async (): Promise<void> => {
      if (!vendorId) {
        return;
      }
      await onGetDietaryPreferencesOfMyVendor({ vendorId });
    }, [onGetDietaryPreferencesOfMyVendor, vendorId]);

  useEffect(() => {
    void onGetMyVendor();
  }, [onGetMyVendor]);

  useEffect(() => {
    void fetchAllDietaryPreferences();
    void fetchMyVendorDietaryPreferences();
  }, [fetchAllDietaryPreferences, fetchMyVendorDietaryPreferences]);

  useEffect(() => {
    setSelectedIds(
      myVendorDietaryPreferences.map((d) => d.dietaryPreferenceId)
    );
  }, [myVendorDietaryPreferences]);

  const handleToggle = (dietaryPreferenceId: number): void => {
    setSelectedIds((prev) => {
      if (prev.includes(dietaryPreferenceId)) {
        return prev.filter((id) => id !== dietaryPreferenceId);
      }
      return [...prev, dietaryPreferenceId];
    });
  };

  const handleSave = async (): Promise<void> => {
    if (!isDirty || isSaving) {
      return;
    }
    setIsSaving(true);
    try {
      await onUpdateDietaryPreferencesOfMyVendor(selectedIds);
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    {
      key: 'select',
      label: '',
      style: { width: '56px', textAlign: 'center' as const },
      render: (
        _: unknown,
        row: {
          dietaryPreferenceId: number;
          name: string;
          description: string;
        }
      ): React.ReactNode => (
        <Checkbox
          checked={selectedIdSet.has(row.dietaryPreferenceId)}
          onChange={() => handleToggle(row.dietaryPreferenceId)}
          size="small"
          sx={{
            color: '#d1d5db',
            '&.Mui-checked': {
              color: 'var(--color-primary-600)',
            },
          }}
        />
      ),
    },
    {
      key: 'name',
      label: 'Tên chế độ ăn',
      render: (value: unknown): React.ReactNode => (
        <Box className="flex items-center gap-2">
          <RestaurantIcon fontSize="small" className="text-primary-600" />
          <Box className="text-table-text-primary font-semibold">
            {String(value)}
          </Box>
        </Box>
      ),
    },
    {
      key: 'description',
      label: 'Mô tả',
      render: (value: unknown): React.ReactNode => (
        <Box className="text-table-text-secondary block max-w-140">
          {typeof value === 'string' && value.trim() !== '' ? value : '-'}
        </Box>
      ),
    },
    {
      key: 'status',
      label: 'Áp dụng',
      style: { width: '150px' },
      render: (
        _: unknown,
        row: {
          dietaryPreferenceId: number;
        }
      ): React.ReactNode => {
        const isSelected = selectedIdSet.has(row.dietaryPreferenceId);
        return (
          <Chip
            label={isSelected ? 'Đang áp dụng' : 'Chưa áp dụng'}
            size="small"
            className={
              isSelected
                ? 'border border-green-200 bg-green-50 font-bold text-green-700'
                : 'border border-gray-200 bg-gray-100 font-bold text-gray-500'
            }
          />
        );
      },
    },
  ];

  const loading = vendorStatus === 'pending' || dietaryStatus === 'pending';

  return (
    <div className="font-(--font-nunito)">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-table-text-primary mb-1 text-3xl font-bold">
            Chế độ ăn của cửa hàng
          </h1>
          <p className="text-table-text-secondary text-sm">
            Chọn các chế độ ăn phù hợp mà cửa hàng của bạn đang phục vụ
          </p>
        </div>

        <button
          onClick={() => void handleSave()}
          disabled={loading || isSaving || !isDirty}
          className="bg-primary-600 hover:bg-primary-700 flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isSaving ? <CircularProgress size={16} color="inherit" /> : null}
          {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          Tổng lựa chọn khả dụng: {dietaryPreferences.length}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          Đang áp dụng: {selectedIds.length}
        </span>
      </div>

      <Table
        columns={columns}
        data={dietaryPreferences}
        rowKey="dietaryPreferenceId"
        loading={loading}
        emptyMessage="Chưa có chế độ ăn nào"
        maxHeight="calc(100vh - 240px)"
      />
    </div>
  );
}
