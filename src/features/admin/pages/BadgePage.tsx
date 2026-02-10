import { useState } from 'react';
import type { JSX } from 'react';
import { Avatar, Chip, Box } from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import Table from '@features/admin/components/Table';
import BadgeFormModal from '@features/admin/components/BadgeFormModal';
import {
  MOCK_BADGES,
  type BadgeDefinition,
} from '@features/admin/data/mockBadgeData';

interface Badge extends BadgeDefinition {
  [key: string]: unknown;
}

export default function BadgePage(): JSX.Element {
  const [badges, setBadges] = useState<Badge[]>(
    MOCK_BADGES.map((b) => ({ ...b }))
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [formData, setFormData] = useState<Partial<Badge>>({
    badgeName: '',
    pointToGet: 0,
    iconUrl: '',
    description: '',
  });

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

  const handleSave = (): void => {
    if (editingBadge) {
      // Cập nhật badge
      setBadges(
        badges.map((b) =>
          b.badgeId === editingBadge.badgeId
            ? { ...(formData as Badge), badgeId: editingBadge.badgeId }
            : b
        )
      );
    } else {
      // Thêm mới badge
      const newBadge: Badge = {
        ...(formData as Badge),
        badgeId: Math.max(0, ...badges.map((b) => b.badgeId)) + 1,
      };
      setBadges([...badges, newBadge]);
    }
    handleCloseDialog();
  };

  const handleDelete = (badge: Badge): void => {
    const badgeName = String(badge.badgeName);
    if (window.confirm(`Bạn có chắc chắn muốn xóa badge "${badgeName}"?`)) {
      setBadges(badges.filter((b) => b.badgeId !== badge.badgeId));
    }
  };

  const columns = [
    {
      key: 'badgeId',
      label: 'ID',
      sx: { width: '80px' },
    },
    {
      key: 'iconUrl',
      label: 'Icon',
      sx: { width: '100px' },
      render: (value: unknown): React.ReactNode => (
        <Avatar
          src={String(value)}
          alt="Badge Icon"
          sx={{
            width: 40,
            height: 40,
            bgcolor: 'var(--color-primary-100)',
          }}
        />
      ),
    },
    {
      key: 'badgeName',
      label: 'Tên Badge',
      render: (value: unknown): React.ReactNode => (
        <Box
          sx={{
            fontWeight: 600,
            color: 'var(--color-table-text-primary)',
            fontFamily: 'var(--font-nunito)',
          }}
        >
          {String(value)}
        </Box>
      ),
    },
    {
      key: 'pointToGet',
      label: 'Điểm yêu cầu',
      sx: { width: '140px' },
      render: (value: unknown): React.ReactNode => (
        <Chip
          label={`${String(value)} điểm`}
          size="small"
          sx={{
            bgcolor: 'var(--color-primary-100)',
            color: 'var(--color-primary-800)',
            fontWeight: 600,
            fontFamily: 'var(--font-nunito)',
          }}
        />
      ),
    },
    {
      key: 'description',
      label: 'Mô tả',
      render: (value: unknown): React.ReactNode => (
        <Box
          sx={{
            maxWidth: '300px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: 'var(--color-table-text-secondary)',
            fontFamily: 'var(--font-nunito)',
          }}
        >
          {String(value)}
        </Box>
      ),
    },
  ];

  const actions = [
    {
      label: <EditIcon fontSize="small" />,
      onClick: (row: Record<string, unknown>): void =>
        handleOpenDialog(row as unknown as Badge),
      color: 'primary' as const,
      variant: 'outlined' as const,
    },
    {
      label: <DeleteIcon fontSize="small" />,
      onClick: (row: Record<string, unknown>): void =>
        handleDelete(row as unknown as Badge),
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
            Quản lý Badge
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
          Thêm Badge
        </button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={badges}
        rowKey="badgeId"
        actions={actions}
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
    </div>
  );
}
