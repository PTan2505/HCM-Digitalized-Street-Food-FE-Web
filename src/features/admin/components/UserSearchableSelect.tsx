import { InputAdornment, TextField } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
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
    <TextField
      value={value}
      onChange={(event) => onChange(event.target.value)}
      label={`Tìm ${roleFilterLabel}`}
      placeholder="Nhập từ khóa để tìm người dùng"
      size="small"
      fullWidth
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" className="text-slate-400" />
          </InputAdornment>
        ),
      }}
      sx={{
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: 'var(--color-primary-300)',
          transition: 'border-color 180ms ease, box-shadow 180ms ease',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: 'var(--color-primary-500)',
        },
        '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: 'var(--color-primary-600)',
          borderWidth: '2px',
        },
      }}
    />
  );
}
