import { useState } from 'react';
import type { JSX } from 'react';
import { Avatar, Chip } from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import Table from '@features/admin/components/Table';
import {
  MOCK_BADGES,
  MOCK_USER_BADGES,
  type UserBadgeData,
} from '@features/admin/data/mockBadgeData';

interface UserBadge extends UserBadgeData {
  [key: string]: unknown;
}

export default function UserBadgeManagement(): JSX.Element {
  const [userBadges, setUserBadges] = useState<UserBadge[]>(
    MOCK_USER_BADGES.map((u) => ({ ...u }))
  );

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserBadge | null>(null);
  const availableBadges = MOCK_BADGES.map((b) => ({
    badgeId: b.badgeId,
    badgeName: b.badgeName,
    iconUrl: b.iconUrl,
  }));
  const [selectedBadgeId, setSelectedBadgeId] = useState<number | null>(null);

  const handleOpenDialog = (user: UserBadge): void => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
    setSelectedUser(null);
    setSelectedBadgeId(null);
  };

  const handleAssignBadge = (): void => {
    if (!selectedUser || !selectedBadgeId) return;

    const badge = availableBadges.find((b) => b.badgeId === selectedBadgeId);
    if (!badge) return;

    setUserBadges(
      userBadges.map((u) =>
        u.userId === selectedUser.userId
          ? {
              ...u,
              badges: [
                ...u.badges,
                {
                  ...badge,
                  earnedDate: new Date().toISOString().split('T')[0],
                },
              ],
            }
          : u
      )
    );
    handleCloseDialog();
  };

  const handleRemoveBadge = (userId: number, badgeId: number): void => {
    if (
      window.confirm('Bạn có chắc chắn muốn thu hồi badge này khỏi người dùng?')
    ) {
      setUserBadges(
        userBadges.map((u) =>
          u.userId === userId
            ? {
                ...u,
                badges: u.badges.filter((b) => b.badgeId !== badgeId),
              }
            : u
        )
      );
    }
  };

  const columns = [
    {
      key: 'userId',
      label: 'ID',
      sx: { width: '80px' },
    },
    {
      key: 'userAvatar',
      label: 'Avatar',
      sx: { width: '80px' },
      render: (
        value: unknown,
        row: Record<string, unknown>
      ): React.ReactNode => (
        <Avatar
          src={(value as string) ?? ''}
          alt={String(row.userName)}
          sx={{
            width: 40,
            height: 40,
            bgcolor: 'var(--color-primary-100)',
          }}
        />
      ),
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
            {String(row.userEmail)}
          </div>
        </div>
      ),
    },
    {
      key: 'badges',
      label: 'Badges',
      render: (value: unknown): React.ReactNode => {
        const badges = value as UserBadge['badges'];
        return (
          <div className="flex flex-wrap gap-1">
            {badges.length === 0 ? (
              <span className="text-xs text-[var(--color-table-text-secondary)]">
                Chưa có badge
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
                    sx={{ width: 16, height: 16 }}
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
      key: 'totalPoints',
      label: 'Tổng điểm',
      sx: { width: '120px' },
      render: (value: unknown): React.ReactNode => (
        <Chip
          label={`${String(value)} điểm`}
          size="small"
          sx={{
            bgcolor: 'var(--color-admin-active-bg)',
            color: 'var(--color-admin-active-text)',
            fontWeight: 600,
            fontFamily: 'var(--font-nunito)',
          }}
        />
      ),
    },
  ];

  const actions = [
    {
      label: (
        <div className="flex items-center gap-1">
          <AddIcon fontSize="small" />
          <span>Thêm Badge</span>
        </div>
      ),
      onClick: (row: Record<string, unknown>): void =>
        handleOpenDialog(row as unknown as UserBadge),
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
        data={userBadges}
        rowKey="userId"
        actions={actions}
        emptyMessage="Chưa có người dùng nào"
      />

      {/* Modal Form */}
      {openDialog && selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={handleCloseDialog}
        >
          <div
            className="mx-4 w-full max-w-2xl rounded-lg bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-bold text-[var(--color-table-text-primary)]">
                Quản lý Badges - {selectedUser.userName}
              </h2>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-4">
              {/* Current Badges */}
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-semibold text-[var(--color-table-text-primary)]">
                  Badges hiện tại ({selectedUser.badges.length})
                </h3>
                <div className="space-y-2">
                  {selectedUser.badges.length === 0 ? (
                    <p className="text-sm text-[var(--color-table-text-secondary)] italic">
                      Người dùng chưa có badge nào
                    </p>
                  ) : (
                    selectedUser.badges.map((badge) => (
                      <div
                        key={badge.badgeId}
                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={badge.iconUrl}
                            alt={badge.badgeName}
                            sx={{ width: 40, height: 40 }}
                          />
                          <div>
                            <div className="font-medium text-[var(--color-table-text-primary)]">
                              {badge.badgeName}
                            </div>
                            <div className="text-xs text-[var(--color-table-text-secondary)]">
                              Nhận ngày: {badge.earnedDate}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            handleRemoveBadge(
                              selectedUser.userId,
                              badge.badgeId
                            )
                          }
                          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-red-600 transition-colors hover:bg-red-50"
                        >
                          <RemoveIcon fontSize="small" />
                          <span className="text-sm font-medium">Thu hồi</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Select Badge to Assign */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-[var(--color-table-text-primary)]">
                  Thêm Badge mới
                </h3>
                <div className="space-y-2">
                  {availableBadges
                    .filter(
                      (badge) =>
                        !selectedUser.badges.some(
                          (b) => b.badgeId === badge.badgeId
                        )
                    )
                    .map((badge) => (
                      <label
                        key={badge.badgeId}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition-all ${
                          selectedBadgeId === badge.badgeId
                            ? 'border-[var(--color-primary-600)] bg-[var(--color-primary-100)]'
                            : 'border-gray-200 bg-white hover:border-[var(--color-primary-400)]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="badge"
                          value={badge.badgeId}
                          checked={selectedBadgeId === badge.badgeId}
                          onChange={() => setSelectedBadgeId(badge.badgeId)}
                          className="h-4 w-4 text-[var(--color-primary-600)]"
                        />
                        <Avatar
                          src={badge.iconUrl}
                          alt={badge.badgeName}
                          sx={{ width: 40, height: 40 }}
                        />
                        <span className="font-medium text-[var(--color-table-text-primary)]">
                          {badge.badgeName}
                        </span>
                      </label>
                    ))}
                  {availableBadges.filter(
                    (badge) =>
                      !selectedUser.badges.some(
                        (b) => b.badgeId === badge.badgeId
                      )
                  ).length === 0 && (
                    <p className="text-sm text-[var(--color-table-text-secondary)] italic">
                      Người dùng đã có tất cả badges có sẵn
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                onClick={handleCloseDialog}
                className="rounded-lg px-4 py-2 text-[var(--color-table-text-secondary)] transition-colors hover:bg-gray-100"
              >
                Đóng
              </button>
              <button
                onClick={handleAssignBadge}
                disabled={!selectedBadgeId}
                className="rounded-lg bg-[var(--color-primary-600)] px-4 py-2 font-semibold text-white transition-colors hover:bg-[var(--color-primary-700)] disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                Thêm Badge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
