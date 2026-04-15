import { useState, useEffect, useMemo } from 'react';
import type { JSX } from 'react';
import { Box } from '@mui/material';
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
import TasteFormModal from '@features/admin/components/TasteFormModal';
import DeleteConfirmationDialog from '@components/ui/DeleteConfirmationDialog';
import type { Taste } from '@features/admin/types/taste';
import useTaste from '@features/admin/hooks/useTaste';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectTastes, selectTasteStatus } from '@slices/taste';
import { getTasteManagementTourSteps } from '@features/admin/utils/tasteManagementTourSteps';

export default function TastePage(): JSX.Element {
  const tastes = useAppSelector(selectTastes);
  const status = useAppSelector(selectTasteStatus);
  const { onGetAllTastes, onCreateTaste, onUpdateTaste, onDeleteTaste } =
    useTaste();
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletingTaste, setDeletingTaste] = useState<Taste | null>(null);
  const [editingTaste, setEditingTaste] = useState<Taste | null>(null);
  const [formData, setFormData] = useState<Partial<Taste>>({
    name: '',
    description: '',
  });
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [tourInstanceKey, setTourInstanceKey] = useState(0);

  useEffect(() => {
    void onGetAllTastes();
  }, [onGetAllTastes]);

  const handleOpenDialog = (taste?: Taste): void => {
    if (taste) {
      setEditingTaste(taste);
      setFormData(taste);
    } else {
      setEditingTaste(null);
      setFormData({
        name: '',
        description: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
    setEditingTaste(null);
    setFormData({
      name: '',
      description: '',
    });
  };

  const handleSave = async (data: {
    name: string;
    description: string;
  }): Promise<void> => {
    try {
      const payload = {
        name: data.name,
        description: data.description,
      };

      if (editingTaste) {
        await onUpdateTaste({ id: editingTaste.tasteId, ...payload });
      } else {
        await onCreateTaste(payload);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save taste:', error);
    }
  };

  const handleDelete = (taste: Taste): void => {
    setDeletingTaste(taste);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (deletingTaste) {
      try {
        await onDeleteTaste(deletingTaste.tasteId);
        setOpenDeleteDialog(false);
        setDeletingTaste(null);
      } catch (error) {
        console.error('Failed to delete taste:', error);
      }
    }
  };

  const handleCancelDelete = (): void => {
    setOpenDeleteDialog(false);
    setDeletingTaste(null);
  };

  const startTasteTour = (): void => {
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
    return getTasteManagementTourSteps({
      hasRows: tastes.length > 0,
    });
  }, [tastes.length]);

  const columns = [
    // {
    //   key: 'tasteId',
    //   label: 'ID',
    //   style: { width: '80px' },
    // },
    {
      key: 'name',
      label: 'Tên Khẩu vị',
      render: (value: unknown): React.ReactNode => (
        <Box className="text-table-text-primary font-semibold">
          {String(value)}
        </Box>
      ),
    },
    {
      key: 'description',
      label: 'Mô tả',
      render: (value: unknown): React.ReactNode => (
        <Box className="text-table-text-secondary block max-w-75 overflow-hidden text-ellipsis whitespace-nowrap">
          {(value as string | null | undefined) ?? '-'}
        </Box>
      ),
    },
  ];

  const actions = [
    {
      id: 'edit',
      label: <EditIcon fontSize="small" />,
      onClick: (row: Taste): void => handleOpenDialog(row),
      tooltip: 'Chỉnh sửa khẩu vị',
      color: 'primary' as const,
      variant: 'outlined' as const,
    },
    {
      id: 'delete',
      label: <DeleteIcon fontSize="small" />,
      onClick: (row: Taste): void => handleDelete(row),
      tooltip: 'Xóa khẩu vị',
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
        data-tour="taste-page-header"
      >
        <div>
          <div className="mb-1 flex items-start gap-2">
            <h1 className="text-table-text-primary text-3xl font-bold">
              Quản lý khẩu vị
            </h1>
            <button
              type="button"
              onClick={startTasteTour}
              aria-label="Mở hướng dẫn quản lý khẩu vị"
              title="Hướng dẫn"
              className="text-primary-700 hover:text-primary-800 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
            >
              <HelpOutlineIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
          <p className="text-table-text-secondary text-sm">
            Quản lý các loại khẩu vị cho món ăn
          </p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          data-tour="taste-create-button"
          className="bg-primary-600 hover:bg-primary-700 flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white transition-colors"
        >
          <AddIcon fontSize="small" />
          Thêm khẩu vị
        </button>
      </div>

      {/* Table */}
      <div data-tour="taste-table-wrapper">
        <Table
          columns={columns}
          data={tastes}
          rowKey="tasteId"
          actions={actions}
          loading={status === 'pending'}
          emptyMessage="Chưa có khẩu vị nào"
          tourId="admin-taste"
        />
      </div>

      {/* Modal Form */}
      <TasteFormModal
        isOpen={openDialog}
        isEditMode={!!editingTaste}
        formData={formData}
        onClose={handleCloseDialog}
        onSave={handleSave}
        onChange={(data) => setFormData(data as Partial<Taste>)}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={openDeleteDialog}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa khẩu vị"
        confirmationMessage={
          <>
            Bạn có chắc chắn muốn xóa khẩu vị &quot;{deletingTaste?.name}&quot;?
            Hành động này không thể hoàn tác.
          </>
        }
      />
    </div>
  );
}
