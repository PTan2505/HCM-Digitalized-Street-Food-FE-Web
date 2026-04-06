import type { JSX } from 'react';

interface UserStatusBadgeProps {
  isBanned: boolean;
}

const BADGE_COLORS = {
  success: 'bg-green-100 text-green-700 border-green-200',
  error: 'bg-red-100 text-red-700 border-red-200',
} as const;

export default function UserStatusBadge({
  isBanned,
}: UserStatusBadgeProps): JSX.Element {
  const colorClass = isBanned ? BADGE_COLORS.error : BADGE_COLORS.success;

  return (
    <span
      className={`inline-flex min-w-[100px] items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-bold shadow-sm ${colorClass}`}
    >
      {isBanned ? 'Đã chặn' : 'Hoạt động'}
    </span>
  );
}
