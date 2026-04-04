import type { PendingRegistrationType } from '@features/moderator/types/branch';
import FilterListIcon from '@mui/icons-material/FilterList';
import {
  Box,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Typography,
} from '@mui/material';
import type { JSX } from 'react';
import { useCallback } from 'react';

interface PendingTypeFilterSectionProps {
  value: PendingRegistrationType;
  onFilterChange: (type: PendingRegistrationType) => void;
}

const TYPE_LABELS: Record<PendingRegistrationType, string> = {
  0: 'Danh sách ghost pin đang chờ duyệt',
  1: 'Danh sách quán ăn đang chờ duyệt',
  2: 'Danh sách ghost pin được yêu cầu quyền sở hữu đang chờ duyệt',
};

const TYPE_OPTIONS: PendingRegistrationType[] = [0, 1, 2];

export default function PendingTypeFilterSection({
  value,
  onFilterChange,
}: PendingTypeFilterSectionProps): JSX.Element {
  const handleTypeChange = useCallback(
    (event: SelectChangeEvent<number>): void => {
      const nextType = Number(event.target.value) as PendingRegistrationType;
      onFilterChange(nextType);
    },
    [onFilterChange]
  );

  return (
    <Box
      className="mb-6 flex flex-col gap-4 rounded-xl border border-gray-100 p-5 shadow-sm"
      sx={{
        background: 'linear-gradient(to right, #ffffff, #f8fafc)',
      }}
    >
      {/* <Box className="flex items-center gap-2">
        <Box className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <FilterListIcon fontSize="small" />
        </Box>
        <Typography className="text-base font-bold text-gray-800">
          Lọc danh sách chờ duyệt
        </Typography>
      </Box> */}

      <Box className="w-full sm:w-[520px]">
        <Typography className="mb-1 text-xs font-semibold tracking-wider text-gray-500 uppercase">
          Loại yêu cầu
        </Typography>
        <Select
          value={value}
          onChange={handleTypeChange}
          size="small"
          fullWidth
          sx={{
            bgcolor: 'white',
            borderRadius: '0.5rem',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#e5e7eb',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#d1d5db',
            },
          }}
        >
          {TYPE_OPTIONS.map((type) => (
            <MenuItem key={type} value={type}>
              {TYPE_LABELS[type]}
            </MenuItem>
          ))}
        </Select>
      </Box>
    </Box>
  );
}
