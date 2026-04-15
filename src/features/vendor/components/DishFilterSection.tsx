import { useState, useEffect, useCallback } from 'react';
import type { JSX } from 'react';
import {
  Box,
  MenuItem,
  Select,
  InputAdornment,
  OutlinedInput,
  IconButton,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import type { Category } from '@features/admin/types/category';
import useCategory from '@features/admin/hooks/useCategory';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectCategories } from '@slices/category';

export interface DishFilterValues {
  keyword?: string;
  categoryId?: number;
}

interface DishFilterSectionProps {
  onFilterChange: (filters: DishFilterValues) => void;
}

export default function DishFilterSection({
  onFilterChange,
}: DishFilterSectionProps): JSX.Element {
  const categories = useAppSelector(selectCategories);
  const { onGetAllCategories } = useCategory();

  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');

  // Fetch categories on mount
  useEffect(() => {
    void onGetAllCategories();
  }, [onGetAllCategories]);

  // Build & emit filter whenever values change
  const emitFilter = useCallback(
    (kw: string, catId: number | '') => {
      const filters: DishFilterValues = {};
      if (kw.trim() !== '') filters.keyword = kw.trim();
      if (catId !== '') filters.categoryId = catId;
      onFilterChange(filters);
    },
    [onFilterChange]
  );

  const handleKeywordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setKeyword(e.target.value);
  };

  const handleKeywordKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ): void => {
    if (e.key === 'Enter') {
      emitFilter(keyword, categoryId);
    }
  };

  const handleKeywordClear = (): void => {
    setKeyword('');
    emitFilter('', categoryId);
  };

  const handleCategoryChange = (value: number | ''): void => {
    setCategoryId(value);
    emitFilter(keyword, value);
  };

  const handleReset = (): void => {
    setKeyword('');
    setCategoryId('');
    onFilterChange({});
  };

  const hasFilter = keyword.trim() !== '' || categoryId !== '';

  return (
    <Box
      className="mb-4 flex flex-col gap-4 rounded-xl border border-gray-100 p-5 shadow-sm"
      sx={{
        background: 'linear-gradient(to right, #ffffff, #f8fafc)',
      }}
    >
      {/* <Box className="flex items-center gap-2">
        <Box className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <FilterListIcon fontSize="small" />
        </Box>
        <Typography className="text-base font-bold text-gray-800">
          Lọc và Tìm kiếm
        </Typography>
      </Box> */}

      <Box className="flex flex-wrap items-center gap-4">
        {/* Keyword search */}
        <Box className="w-full sm:w-80">
          <Typography className="mb-1 text-xs font-semibold tracking-wider text-gray-500 uppercase">
            Từ khóa
          </Typography>
          <OutlinedInput
            value={keyword}
            onChange={handleKeywordChange}
            onKeyDown={handleKeywordKeyDown}
            placeholder="Tìm theo tên món ăn..."
            size="small"
            fullWidth
            sx={{
              bgcolor: 'white',
              borderRadius: '0.5rem',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--color-primary-600)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--color-primary-700)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--color-primary-600)',
              },
            }}
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            }
            endAdornment={
              keyword ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={handleKeywordClear}
                    edge="end"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null
            }
          />
        </Box>

        {/* Category filter */}
        <Box className="w-full sm:w-64">
          <Typography className="mb-1 text-xs font-semibold tracking-wider text-gray-500 uppercase">
            Danh mục
          </Typography>
          <Select
            value={categoryId}
            displayEmpty
            onChange={(e) =>
              handleCategoryChange(e.target.value as number | '')
            }
            size="small"
            fullWidth
            sx={{
              bgcolor: 'white',
              borderRadius: '0.5rem',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--color-primary-600)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--color-primary-700)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--color-primary-600)',
              },
            }}
          >
            <MenuItem value="">
              <span className="text-gray-500">Tất cả danh mục</span>
            </MenuItem>
            {categories.map((cat: Category) => (
              <MenuItem key={cat.categoryId} value={cat.categoryId}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Action Button */}
        <Box className="mt-5 flex self-end">
          <button
            onClick={() => emitFilter(keyword, categoryId)}
            className="bg-primary-600 hover:bg-primary-700 flex items-center justify-center rounded-lg px-5 py-[0.625rem] text-sm font-semibold text-white transition-all hover:shadow-md"
          >
            Áp dụng
          </button>
          {hasFilter && (
            <button
              onClick={handleReset}
              className="ml-3 flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              Xóa bộ lọc
            </button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
