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
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import type { UserWithBadges, Badge } from '@features/admin/types/badge';
import AppModalHeader from '@components/AppModalHeader';

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

  const formatDateTime = (dateValue?: string | null): string => {
    if (!dateValue) return '-';
    return new Date(dateValue).toLocaleString('vi-VN', { hour12: false });
  };

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
        className="mx-4 flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <AppModalHeader
          title="Quản lý huy hiệu"
          subtitle={user.userName}
          icon={<EmojiEventsIcon />}
          iconTone="admin"
          onClose={handleClose}
        />

        {/* Modal Content */}
        <div className="flex-1 px-6 py-4">
          {/* Current Badges */}
          <div className="mb-6">
            <h3 className="text-table-text-primary mb-3 text-sm font-semibold">
              Huy hiệu hiện tại ({user.badges.length})
            </h3>
            <div className="max-h-[30vh] space-y-2 overflow-y-auto pr-2">
              {user.badges.length === 0 ? (
                <p className="text-table-text-secondary text-sm italic">
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
                        <div className="text-table-text-primary font-medium">
                          {badge.badgeName}
                        </div>
                        {badge.earnedAt && (
                          <div className="text-table-text-secondary text-xs">
                            Nhận ngày: {formatDateTime(badge.earnedAt)}
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
            <h3 className="text-table-text-primary mb-3 text-sm font-semibold">
              Thêm huy hiệu mới
            </h3>
            <div className="max-h-[35vh] space-y-2 overflow-y-auto pr-2">
              {filteredBadges.map((badge) => (
                <label
                  key={badge.badgeId}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition-all ${
                    selectedBadgeId === badge.badgeId
                      ? 'border-primary-600 bg-primary-100'
                      : 'hover:border-primary-400 border-gray-200 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="badge"
                    value={badge.badgeId}
                    checked={selectedBadgeId === badge.badgeId}
                    onChange={() => setSelectedBadgeId(badge.badgeId)}
                    className="text-primary-600 h-4 w-4"
                  />
                  <Avatar
                    src={badge.iconUrl}
                    alt={badge.badgeName}
                    className="h-10 w-10"
                  />
                  <span className="text-table-text-primary font-medium">
                    {badge.badgeName}
                  </span>
                </label>
              ))}
              {filteredBadges.length === 0 && (
                <p className="text-table-text-secondary text-sm italic">
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
            className="text-table-text-secondary rounded-lg px-4 py-2 transition-colors hover:bg-gray-100"
          >
            Đóng
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedBadgeId}
            className="bg-primary-600 hover:bg-primary-700 rounded-lg px-4 py-2 font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:bg-gray-300"
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
            className="font-(--font-nunito)"
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmRemove}
            color="error"
            variant="outlined"
            className="font-(--font-nunito)"
            autoFocus
          >
            Thu hồi
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
