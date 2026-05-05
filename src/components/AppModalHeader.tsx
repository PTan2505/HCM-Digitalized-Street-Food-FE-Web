import type { ReactNode } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface AppModalHeaderProps {
  title: string;
  subtitle?: ReactNode;
  icon: ReactNode;
  iconTone?: 'default' | 'admin' | 'category' | 'campaign' | 'voucher';
  onClose?: () => void;
  disableClose?: boolean;
  rightActions?: ReactNode;
}

export default function AppModalHeader({
  title,
  subtitle,
  icon,
  iconTone = 'default',
  onClose,
  disableClose = false,
  rightActions,
}: AppModalHeaderProps): React.JSX.Element {
  const iconToneClassByType: Record<string, string> = {
    default: 'bg-orange-100 text-orange-600',
    admin: 'bg-emerald-100 text-emerald-700',
    category: 'bg-sky-100 text-sky-700',
    campaign: 'bg-indigo-100 text-indigo-700',
    voucher: 'bg-amber-100 text-amber-700',
  };

  return (
    <Box className="flex items-center justify-between border-b border-gray-100 bg-gray-50/70 px-8 py-5">
      <Box className="flex min-w-0 items-center gap-3">
        <Box
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconToneClassByType[iconTone]}`}
        >
          {icon}
        </Box>
        <Box className="min-w-0">
          <Typography className="text-table-text-primary truncate text-xl font-bold md:text-2xl">
            {title}
          </Typography>
          {subtitle ? (
            <Typography
              component="div"
              className="text-table-text-secondary mt-0.5 text-sm font-medium"
            >
              {subtitle}
            </Typography>
          ) : null}
        </Box>
      </Box>

      <Box className="flex items-center gap-2">
        {rightActions}
        {onClose ? (
          <IconButton
            size="small"
            onClick={onClose}
            disabled={disableClose}
            sx={{
              bgcolor: 'white',
              border: '1px solid #f3f4f6',
              '&:hover': { bgcolor: '#f3f4f6' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        ) : null}
      </Box>
    </Box>
  );
}
