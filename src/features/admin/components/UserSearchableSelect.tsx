import {
  IconButton,
  InputAdornment,
  OutlinedInput,
  Typography,
} from '@mui/material';
import { Clear as ClearIcon, Search as SearchIcon } from '@mui/icons-material';
import type { JSX } from 'react';

interface UserSearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  roleFilterLabel: string;
}

export default function UserSearchableSelect({
  value,
  onChange,
  roleFilterLabel,
}: UserSearchableSelectProps): JSX.Element {
  return (
    <div>
      <Typography className="mb-1 text-xs font-semibold tracking-wider text-gray-500 uppercase">
        Tìm kiếm {roleFilterLabel}
      </Typography>

      <OutlinedInput
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Nhập từ khóa để tìm người dùng"
        size="small"
        fullWidth
        sx={{
          bgcolor: 'white',
          borderRadius: '0.5rem',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--color-primary-600)',
            transition: 'border-color 180ms ease, box-shadow 180ms ease',
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
          value ? (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => onChange('')}
                edge="end"
                aria-label="Xóa từ khóa tìm kiếm"
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null
        }
      />
    </div>
  );
}
