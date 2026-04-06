import type { ReactNode } from 'react';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface VendorModalHeaderProps {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  iconTone?: 'branch' | 'dish' | 'campaign' | 'voucher' | 'order' | 'default';
  onClose?: () => void;
  disableClose?: boolean;
  rightActions?: ReactNode;
}

export default function VendorModalHeader({
  title,
  subtitle,
  icon,
  iconTone = 'default',
  onClose,
  disableClose = false,
  rightActions,
}: VendorModalHeaderProps): React.JSX.Element {
  const iconToneClass: Record<string, string> = {
    branch: 'bg-emerald-100 text-emerald-700',
    dish: 'bg-amber-100 text-amber-700',
    campaign: 'bg-indigo-100 text-indigo-700',
    voucher: 'bg-sky-100 text-sky-700',
    order: 'bg-rose-100 text-rose-600',
    default: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/70 px-8 py-5">
      {/* Left: icon + title block */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconToneClass[iconTone]}`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="truncate text-2xl leading-tight font-bold text-[var(--color-table-text-primary)]">
            {title}
          </p>
          {subtitle ? (
            <p className="mt-0.5 truncate text-sm font-medium text-[var(--color-table-text-secondary)]">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>

      {/* Right: actions + close */}
      <div className="ml-4 flex shrink-0 items-center gap-2">
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
      </div>
    </div>
  );
}
