import { useState, useEffect, useMemo } from 'react';
import type { JSX } from 'react';
import { Avatar, Box, Chip } from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  HelpOutline as HelpOutlineIcon,
} from '@mui/icons-material';
import {
  type Controls,
  EVENTS,
  Joyride,
  STATUS,
  type EventData,
} from 'react-joyride';
import Table from '@features/admin/components/Table';
import BadgeFormModal from '@features/admin/components/BadgeFormModal';
import DeleteConfirmationDialog from '@components/ui/DeleteConfirmationDialog';
import type { Badge } from '@features/admin/types/badge';
import useBadge from '@features/admin/hooks/useBadge';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectBadges, selectBadgeStatus } from '@slices/badge';
import { getBadgeManagementTourSteps } from '@features/admin/utils/badgeManagementTourSteps';

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
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [tourInstanceKey, setTourInstanceKey] = useState(0);

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

  const startBadgeTour = (): void => {
    setTourInstanceKey((prev) => prev + 1);
    setIsTourRunning(true);
  };

  const handleJoyrideEvent = (data: EventData, controls: Controls): void => {
    if (data.type === EVENTS.TARGET_NOT_FOUND) {
      controls.next();
      return;
    }

    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
      setIsTourRunning(false);
    }
  };

  const tourSteps = useMemo(() => {
    return getBadgeManagementTourSteps({
      hasRows: badges.length > 0,
    });
  }, [badges.length]);

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
          className="bg-primary-100 h-10 w-10"
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
          className="bg-primary-100 text-primary-800 font-semibold"
        />
      ),
    },
    {
      key: 'description',
      label: 'Mô tả',
      render: (value: unknown): React.ReactNode => (
        <Box className="text-table-text-secondary block max-w-75 overflow-hidden text-ellipsis whitespace-nowrap">
          {String(value)}
        </Box>
      ),
    },
  ];

  const actions = [
    {
      id: 'edit',
      label: <EditIcon fontSize="small" />,
      onClick: (row: Badge): void => handleOpenDialog(row),
      tooltip: 'Chỉnh sửa huy hiệu',
      color: 'primary' as const,
      variant: 'outlined' as const,
    },
    {
      id: 'delete',
      label: <DeleteIcon fontSize="small" />,
      onClick: (row: Badge): void => handleDelete(row),
      tooltip: 'Xóa huy hiệu',
      color: 'error' as const,
      variant: 'outlined' as const,
    },
  ];

  return (
    <div className="font-(--font-nunito)">
      <Joyride
        key={tourInstanceKey}
        run={isTourRunning}
        steps={tourSteps}
        continuous
        scrollToFirstStep
        onEvent={handleJoyrideEvent}
        options={{
          showProgress: true,
          scrollDuration: 350,
          scrollOffset: 80,
          spotlightPadding: 8,
          overlayColor: 'rgba(15, 23, 42, 0.5)',
          primaryColor: '#7ab82d',
          textColor: '#1f2937',
          zIndex: 1700,
          buttons: ['back', 'skip', 'primary'],
        }}
        locale={{
          back: 'Quay lại',
          close: 'Đóng',
          last: 'Hoàn tất',
          next: 'Tiếp theo',
          nextWithProgress: 'Tiếp theo ({current}/{total})',
          skip: 'Bỏ qua',
        }}
      />

      {/* Header */}
      <div
        className="mb-6 flex items-center justify-between"
        data-tour="badge-page-header"
      >
        <div>
          <div className="mb-1 flex items-start gap-2">
            <h1 className="text-table-text-primary text-3xl font-bold">
              Quản lý huy hiệu
            </h1>
            <button
              type="button"
              onClick={startBadgeTour}
              aria-label="Mở hướng dẫn quản lý huy hiệu"
              title="Hướng dẫn"
              className="text-primary-700 hover:text-primary-800 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
            >
              <HelpOutlineIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
          <p className="text-table-text-secondary text-sm">
            Quản lý danh hiệu và phần thưởng cho người dùng
          </p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          data-tour="badge-create-button"
          className="bg-primary-600 hover:bg-primary-700 flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white transition-colors"
        >
          <AddIcon fontSize="small" />
          Thêm huy hiệu
        </button>
      </div>

      {/* Table */}
      <div data-tour="badge-table-wrapper">
        <Table
          columns={columns}
          data={badges}
          rowKey="badgeId"
          actions={actions}
          loading={status === 'pending'}
          emptyMessage="Chưa có badge nào"
          tourId="admin-badge"
        />
      </div>

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
