import { useState, useEffect } from 'react';
import type { JSX } from 'react';
import { Avatar, Chip } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import Table from '@features/admin/components/Table';
import UserBadgeFormModal from '@features/admin/components/UserBadgeFormModal';
import type { UserWithBadges, Badge } from '@features/admin/types/badge';
import useBadge from '@features/admin/hooks/useBadge';
import { useAppSelector } from '@hooks/reduxHooks';
import {
  selectUsersWithBadges,
  selectBadges,
  selectBadgeStatus,
} from '@slices/badge';

export default function UserBadgeManagement(): JSX.Element {
  const usersWithBadges = useAppSelector(selectUsersWithBadges);
  const allBadges = useAppSelector(selectBadges);
  const status = useAppSelector(selectBadgeStatus);
  const {
    onGetUsersWithBadges,
    onGetAllBadges,
    onAwardBadgeToUser,
    onRevokeBadgeFromUser,
  } = useBadge();

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithBadges | null>(null);

  useEffect(() => {
    void onGetUsersWithBadges();
    void onGetAllBadges();
  }, [onGetUsersWithBadges, onGetAllBadges]);

  const availableBadges = allBadges.map((b) => ({
    badgeId: b.badgeId,
    badgeName: b.badgeName,
    iconUrl: b.iconUrl,
  }));

  const handleOpenDialog = (user: UserWithBadges): void => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleAssignBadge = async (
    userId: number,
    badgeId: number
  ): Promise<void> => {
    try {
      await onAwardBadgeToUser({ userId, badgeId });
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to award badge:', error);
    }
  };

  const handleRemoveBadge = async (
    userId: number,
    badgeId: number
  ): Promise<void> => {
    try {
      await onRevokeBadgeFromUser({ userId, badgeId });
    } catch (error) {
      console.error('Failed to revoke badge:', error);
    }
  };

  const columns = [
    {
      key: 'userId',
      label: 'ID',
      style: { width: '80px' },
    },
    {
      key: 'userName',
      label: 'Tên người dùng',
      render: (
        value: unknown,
        row: Record<string, unknown>
      ): React.ReactNode => (
        <div>
          <div className="font-semibold text-[var(--color-table-text-primary)]">
            {String(value)}
          </div>
          <div className="text-xs text-[var(--color-table-text-secondary)]">
            {String(row.email)}
          </div>
        </div>
      ),
    },
    {
      key: 'badges',
      label: 'Huy hiệu',
      render: (value: unknown): React.ReactNode => {
        const badges = value as Badge[];
        return (
          <div className="flex flex-wrap gap-1">
            {badges.length === 0 ? (
              <span className="text-xs text-[var(--color-table-text-secondary)]">
                Chưa có huy hiệu nào
              </span>
            ) : (
              badges.map((badge) => (
                <div
                  key={badge.badgeId}
                  className="flex items-center gap-1 rounded-full bg-[var(--color-primary-100)] px-2 py-1"
                >
                  <Avatar
                    src={badge.iconUrl}
                    alt={badge.badgeName}
                    className="h-4 w-4"
                  />
                  <span className="text-xs font-medium text-[var(--color-primary-800)]">
                    {badge.badgeName}
                  </span>
                </div>
              ))
            )}
          </div>
        );
      },
    },
    {
      key: 'point',
      label: 'Tổng điểm',
      style: { width: '120px' },
      render: (value: unknown): React.ReactNode => (
        <Chip
          label={`${String(value)} điểm`}
          size="small"
          className="bg-[var(--color-admin-active-bg)] font-[var(--font-nunito)] font-semibold text-[var(--color-admin-active-text)]"
        />
      ),
    },
  ];

  const actions = [
    {
      label: (
        <div className="flex items-center gap-1">
          {/* <AddIcon fontSize="small" /> */}
          <span>Thêm hoặc thu hồi huy hiệu</span>
        </div>
      ),
      onClick: (row: Record<string, unknown>): void =>
        handleOpenDialog(row as unknown as UserWithBadges),
      color: 'primary' as const,
      variant: 'outlined' as const,
    },
  ];

  return (
    <div className="font-[var(--font-nunito)]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-bold text-[var(--color-table-text-primary)]">
            Quản lý Badge của User
          </h1>
          <p className="text-sm text-[var(--color-table-text-secondary)]">
            Gán và quản lý badges cho từng người dùng
          </p>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={usersWithBadges as unknown as Record<string, unknown>[]}
        rowKey="userId"
        actions={actions}
        loading={status === 'pending'}
        emptyMessage="Chưa có người dùng nào"
      />

      {/* Modal Form */}
      <UserBadgeFormModal
        isOpen={openDialog}
        user={selectedUser}
        availableBadges={availableBadges}
        onClose={handleCloseDialog}
        onAssignBadge={handleAssignBadge}
        onRemoveBadge={handleRemoveBadge}
      />
    </div>
  );
}
