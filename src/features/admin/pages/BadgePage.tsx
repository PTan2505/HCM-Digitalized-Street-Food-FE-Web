import { useState, useEffect } from 'react';
import type { JSX } from 'react';
import { Avatar, Box, Chip } from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import Table from '@features/admin/components/Table';
import BadgeFormModal from '@features/admin/components/BadgeFormModal';
import DeleteConfirmationDialog from '@components/ui/DeleteConfirmationDialog';
import type { Badge } from '@features/admin/types/badge';
import useBadge from '@features/admin/hooks/useBadge';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectBadges, selectBadgeStatus } from '@slices/badge';

export default function BadgePage(): JSX.Element {
  const badges = useAppSelector(selectBadges);
  const status = useAppSelector(selectBadgeStatus);
  const { onGetAllBadges, onCreateBadge, onUpdateBadge, onDeleteBadge } =
    useBadge();
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletingBadge, setDeletingBadge] = useState<Badge | null>(null);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [formData, setFormData] = useState<Partial<Badge>>({
    badgeName: '',
    pointToGet: 0,
    iconUrl: '',
    description: '',
  });

  useEffect(() => {
    void onGetAllBadges();
  }, [onGetAllBadges]);

  const handleOpenDialog = (badge?: Badge): void => {
    if (badge) {
      setEditingBadge(badge);
      setFormData(badge);
    } else {
      setEditingBadge(null);
      setFormData({
        badgeName: '',
        pointToGet: 0,
        iconUrl: '',
        description: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
    setEditingBadge(null);
    setFormData({
      badgeName: '',
      pointToGet: 0,
      iconUrl: '',
      description: '',
    });
  };

  const handleSave = async (data: {
    badgeName: string;
    pointToGet: string;
    imageFile?: File | null;
    description: string;
  }): Promise<void> => {
    try {
      const payload = {
        badgeName: data.badgeName,
        pointToGet: parseInt(data.pointToGet, 10),
        imageFile: data.imageFile,
        description: data.description,
      };

      if (editingBadge) {
        await onUpdateBadge({ id: editingBadge.badgeId, ...payload });
      } else {
        await onCreateBadge(payload);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save badge:', error);
    }
  };

  const handleDelete = (badge: Badge): void => {
    setDeletingBadge(badge);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (deletingBadge) {
      try {
        await onDeleteBadge(deletingBadge.badgeId);
        setOpenDeleteDialog(false);
        setDeletingBadge(null);
      } catch (error) {
        console.error('Failed to delete badge:', error);
      }
    }
  };

  const handleCancelDelete = (): void => {
    setOpenDeleteDialog(false);
    setDeletingBadge(null);
  };

  const columns = [
    // {
    //   key: 'badgeId',
    //   label: 'ID',
    //   style: { width: '80px' },
    // },
    {
      key: 'iconUrl',
      label: 'Icon',
      style: { width: '100px' },
      render: (value: unknown): React.ReactNode => (
        <Avatar
          src={String(value)}
          alt="Badge Icon"
          className="h-10 w-10 bg-[var(--color-primary-100)]"
        />
      ),
    },
    {
      key: 'badgeName',
      label: 'Tên Badge',
      render: (value: unknown): React.ReactNode => (
        <Box className="text-table-text-primary font-semibold">
          {String(value)}
        </Box>
      ),
    },
    {
      key: 'pointToGet',
      label: 'Điểm yêu cầu',
      style: { width: '140px' },
      render: (value: unknown): React.ReactNode => (
        <Chip
          label={`${String(value)} điểm`}
          size="small"
          className="bg-[var(--color-primary-100)] font-[var(--font-nunito)] font-semibold text-[var(--color-primary-800)]"
        />
      ),
    },
    {
      key: 'description',
      label: 'Mô tả',
      render: (value: unknown): React.ReactNode => (
        <Box className="text-table-text-secondary block max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap">
          {String(value)}
        </Box>
      ),
    },
  ];

  const actions = [
    {
      label: <EditIcon fontSize="small" />,
      onClick: (row: Badge): void => handleOpenDialog(row),
      tooltip: 'Chỉnh sửa huy hiệu',
      color: 'primary' as const,
      variant: 'outlined' as const,
    },
    {
      label: <DeleteIcon fontSize="small" />,
      onClick: (row: Badge): void => handleDelete(row),
      tooltip: 'Xóa huy hiệu',
      color: 'error' as const,
      variant: 'outlined' as const,
    },
  ];

  return (
    <div className="font-[var(--font-nunito)]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-bold text-[var(--color-table-text-primary)]">
            Quản lý huy hiệu
          </h1>
          <p className="text-sm text-[var(--color-table-text-secondary)]">
            Quản lý danh hiệu và phần thưởng cho người dùng
          </p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          className="flex items-center gap-2 rounded-lg bg-[var(--color-primary-600)] px-4 py-2 font-semibold text-white transition-colors hover:bg-[var(--color-primary-700)]"
        >
          <AddIcon fontSize="small" />
          Thêm huy hiệu
        </button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={badges}
        rowKey="badgeId"
        actions={actions}
        loading={status === 'pending'}
        emptyMessage="Chưa có badge nào"
      />

      {/* Modal Form */}
      <BadgeFormModal
        isOpen={openDialog}
        isEditMode={!!editingBadge}
        formData={formData}
        onClose={handleCloseDialog}
        onSave={handleSave}
        onChange={(data) => setFormData(data as Partial<Badge>)}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={openDeleteDialog}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa badge"
        confirmationMessage={
          <>
            Bạn có chắc chắn muốn xóa badge &quot;{deletingBadge?.badgeName}
            &quot;? Hành động này không thể hoàn tác.
          </>
        }
      />
    </div>
  );
}
