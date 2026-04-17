import { useState, useEffect, useMemo } from 'react';
import type { JSX } from 'react';
import { Box, Chip } from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Restaurant as RestaurantIcon,
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
import DietaryFormModal from '@features/admin/components/DietaryFormModal';
import DeleteConfirmationDialog from '@components/ui/DeleteConfirmationDialog';
import type { UserDietaryPreference } from '@features/admin/types/userDietaryPreference';
import useDietary from '@features/admin/hooks/useDietary';
import { useAppSelector } from '@hooks/reduxHooks';
import {
  selectUserDietaryPreferences,
  selectUserDietaryPreferenceStatus,
} from '@slices/userPreferenceDietary';
import { getDietaryManagementTourSteps } from '@features/admin/utils/dietaryManagementTourSteps';

export default function DietaryPage(): JSX.Element {
  const dietaries = useAppSelector(selectUserDietaryPreferences);
  const status = useAppSelector(selectUserDietaryPreferenceStatus);
  const {
    onGetAllUserDietaryPreferences,
    onCreateUserDietaryPreference,
    onUpdateUserDietaryPreference,
    onDeleteUserDietaryPreference,
  } = useDietary();
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletingDietary, setDeletingDietary] =
    useState<UserDietaryPreference | null>(null);
  const [editingDietary, setEditingDietary] =
    useState<UserDietaryPreference | null>(null);
  const [formData, setFormData] = useState<Partial<UserDietaryPreference>>({
    name: '',
    description: '',
  });
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [tourInstanceKey, setTourInstanceKey] = useState(0);

  useEffect(() => {
    void onGetAllUserDietaryPreferences();
  }, [onGetAllUserDietaryPreferences]);

  const handleOpenDialog = (dietary?: UserDietaryPreference): void => {
    if (dietary) {
      setEditingDietary(dietary);
      setFormData(dietary);
    } else {
      setEditingDietary(null);
      setFormData({
        name: '',
        description: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
    setEditingDietary(null);
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

      if (editingDietary) {
        await onUpdateUserDietaryPreference({
          id: editingDietary.dietaryPreferenceId,
          ...payload,
        });
      } else {
        await onCreateUserDietaryPreference(payload);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save dietary preference:', error);
    }
  };

  const handleDelete = (dietary: UserDietaryPreference): void => {
    setDeletingDietary(dietary);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (deletingDietary) {
      try {
        await onDeleteUserDietaryPreference(
          deletingDietary.dietaryPreferenceId
        );
        setOpenDeleteDialog(false);
        setDeletingDietary(null);
      } catch (error) {
        console.error('Failed to delete dietary preference:', error);
      }
    }
  };

  const handleCancelDelete = (): void => {
    setOpenDeleteDialog(false);
    setDeletingDietary(null);
  };

  const startDietaryTour = (): void => {
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
    return getDietaryManagementTourSteps({
      hasRows: dietaries.length > 0,
    });
  }, [dietaries.length]);

  const columns = [
    // {
    //   key: 'dietaryPreferenceId',
    //   label: 'ID',
    //   style: { width: '80px' },
    // },
    {
      key: 'name',
      label: 'Tên chế độ ăn',
      render: (value: unknown): React.ReactNode => (
        <Box className="flex items-center gap-2">
          <RestaurantIcon fontSize="small" className="text-primary-600" />
          <Box className="text-table-text-primary font-semibold">
            {String(value)}
          </Box>
        </Box>
      ),
    },
    {
      key: 'description',
      label: 'Mô tả',
      render: (value: unknown): React.ReactNode => (
        <Box className="text-table-text-secondary block max-w-125">
          {String(value)}
        </Box>
      ),
    },
    {
      key: 'isActive',
      label: 'Trạng thái',
      style: { width: '140px' },
      render: (value: unknown): React.ReactNode => {
        const isActive = Boolean(value);
        return (
          <Chip
            label={isActive ? 'Đang hoạt động' : 'Đã đóng'}
            size="small"
            className={
              isActive
                ? 'bg-green-100 font-semibold text-green-800'
                : 'bg-red-100 font-semibold text-red-800'
            }
          />
        );
      },
    },
  ];

  const actions = [
    {
      id: 'edit',
      label: <EditIcon fontSize="small" />,
      onClick: (row: UserDietaryPreference): void => handleOpenDialog(row),
      tooltip: 'Chỉnh sửa chế độ ăn',
      color: 'primary' as const,
      variant: 'outlined' as const,
    },
    {
      id: 'close',
      label: 'Đóng',
      onClick: (row: UserDietaryPreference): void => handleDelete(row),
      tooltip: 'Đóng chế độ ăn',
      color: 'warning' as const,
      variant: 'outlined' as const,
      show: (row: UserDietaryPreference): boolean => row.isActive ?? false,
    },
    {
      id: 'activate',
      label: 'Kích hoạt',
      onClick: (row: UserDietaryPreference): void => handleDelete(row),
      tooltip: 'Kích hoạt chế độ ăn',
      color: 'success' as const,
      variant: 'outlined' as const,
      show: (row: UserDietaryPreference): boolean => !(row.isActive ?? false),
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
        data-tour="dietary-page-header"
      >
        <div>
          <div className="mb-1 flex items-start gap-2">
            <h1 className="text-table-text-primary text-3xl font-bold">
              Quản lý chế độ ăn
            </h1>
            <button
              type="button"
              onClick={startDietaryTour}
              aria-label="Mở hướng dẫn quản lý chế độ ăn"
              title="Hướng dẫn"
              className="text-primary-700 hover:text-primary-800 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
            >
              <HelpOutlineIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
          <p className="text-table-text-secondary text-sm">
            Quản lý các loại chế độ ăn uống đặc biệt cho người dùng
          </p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          data-tour="dietary-create-button"
          className="bg-primary-600 hover:bg-primary-700 flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white transition-colors"
        >
          <AddIcon fontSize="small" />
          Thêm chế độ ăn
        </button>
      </div>

      {/* Table */}
      <div data-tour="dietary-table-wrapper">
        <Table
          columns={columns}
          data={dietaries}
          rowKey="dietaryPreferenceId"
          actions={actions}
          loading={status === 'pending'}
          emptyMessage="Chưa có chế độ ăn nào"
          tourId="admin-dietary"
        />
      </div>

      {/* Modal Form */}
      <DietaryFormModal
        isOpen={openDialog}
        isEditMode={!!editingDietary}
        formData={formData}
        onClose={handleCloseDialog}
        onSave={handleSave}
        onChange={(data) => setFormData(data as Partial<UserDietaryPreference>)}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={openDeleteDialog}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={
          deletingDietary?.isActive
            ? 'Xác nhận đóng chế độ ăn'
            : 'Xác nhận kích hoạt chế độ ăn'
        }
        confirmButtonLabel={deletingDietary?.isActive ? 'Đóng' : 'Kích hoạt'}
        confirmButtonColor={deletingDietary?.isActive ? 'warning' : 'success'}
        confirmationMessage={
          <>
            Bạn có chắc chắn muốn{' '}
            {deletingDietary?.isActive ? 'đóng' : 'kích hoạt'} chế độ ăn &quot;
            {deletingDietary?.name}&quot;?
          </>
        }
      />
    </div>
  );
}
