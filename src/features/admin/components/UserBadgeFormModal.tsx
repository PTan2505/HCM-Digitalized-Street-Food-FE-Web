import { useState } from 'react';
import type { JSX } from 'react';
import {
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { Remove as RemoveIcon } from '@mui/icons-material';
import type { UserWithBadges, Badge } from '@features/admin/types/badge';

interface AvailableBadge {
  badgeId: number;
  badgeName: string;
  iconUrl: string;
}

interface UserBadgeFormModalProps {
  isOpen: boolean;
  user: UserWithBadges | null;
  availableBadges: AvailableBadge[];
  onClose: () => void;
  onAssignBadge: (userId: number, badgeId: number) => void | Promise<void>;
  onRemoveBadge: (userId: number, badgeId: number) => void | Promise<void>;
}

export default function UserBadgeFormModal({
  isOpen,
  user,
  availableBadges,
  onClose,
  onAssignBadge,
  onRemoveBadge,
}: UserBadgeFormModalProps): JSX.Element | null {
  const [selectedBadgeId, setSelectedBadgeId] = useState<number | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [removingBadge, setRemovingBadge] = useState<Badge | null>(null);

  const handleClose = (): void => {
    setSelectedBadgeId(null);
    onClose();
  };

  const handleAssign = (): void => {
    if (!user || !selectedBadgeId) return;
    void onAssignBadge(user.userId, selectedBadgeId);
    setSelectedBadgeId(null);
  };

  const handleRemoveClick = (badge: Badge): void => {
    setRemovingBadge(badge);
    setOpenDeleteDialog(true);
  };

  const handleConfirmRemove = (): void => {
    if (user && removingBadge) {
      void onRemoveBadge(user.userId, removingBadge.badgeId);
      setOpenDeleteDialog(false);
      setRemovingBadge(null);
    }
  };

  const handleCancelRemove = (): void => {
    setOpenDeleteDialog(false);
    setRemovingBadge(null);
  };

  if (!isOpen || !user) return null;

  const filteredBadges = availableBadges.filter(
    (badge) => !user.badges.some((b) => b.badgeId === badge.badgeId)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleClose}
    >
      <div
        className="mx-4 w-full max-w-2xl rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-[var(--color-table-text-primary)]">
            Quản lý huy hiệu của {user.userName}
          </h2>
        </div>

        {/* Modal Content */}
        <div className="px-6 py-4">
          {/* Current Badges */}
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-semibold text-[var(--color-table-text-primary)]">
              Huy hiệu hiện tại ({user.badges.length})
            </h3>
            <div className="space-y-2">
              {user.badges.length === 0 ? (
                <p className="text-sm text-[var(--color-table-text-secondary)] italic">
                  Người dùng chưa có huy hiệu nào
                </p>
              ) : (
                user.badges.map((badge: Badge) => (
                  <div
                    key={badge.badgeId}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={badge.iconUrl}
                        alt={badge.badgeName}
                        className="h-10 w-10"
                      />
                      <div>
                        <div className="font-medium text-[var(--color-table-text-primary)]">
                          {badge.badgeName}
                        </div>
                        {badge.earnedAt && (
                          <div className="text-xs text-[var(--color-table-text-secondary)]">
                            Nhận ngày: {badge.earnedAt}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveClick(badge)}
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
              Thêm huy hiệu mới
            </h3>
            <div className="space-y-2">
              {filteredBadges.map((badge) => (
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
                    className="h-10 w-10"
                  />
                  <span className="font-medium text-[var(--color-table-text-primary)]">
                    {badge.badgeName}
                  </span>
                </label>
              ))}
              {filteredBadges.length === 0 && (
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
            onClick={handleClose}
            className="rounded-lg px-4 py-2 text-[var(--color-table-text-secondary)] transition-colors hover:bg-gray-100"
          >
            Đóng
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedBadgeId}
            className="rounded-lg bg-[var(--color-primary-600)] px-4 py-2 font-semibold text-white transition-colors hover:bg-[var(--color-primary-700)] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Thêm huy hiệu
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCancelRemove}
        aria-labelledby="remove-badge-dialog-title"
        aria-describedby="remove-badge-dialog-description"
      >
        <DialogTitle id="remove-badge-dialog-title">
          Xác nhận thu hồi badge
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="remove-badge-dialog-description">
            Bạn có chắc chắn muốn thu hồi badge &quot;{removingBadge?.badgeName}
            &quot; khỏi người dùng &quot;{user.userName}&quot;? Hành động này
            không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancelRemove}
            color="primary"
            className="font-[var(--font-nunito)]"
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmRemove}
            color="error"
            variant="contained"
            className="font-[var(--font-nunito)]"
            autoFocus
          >
            Thu hồi
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
