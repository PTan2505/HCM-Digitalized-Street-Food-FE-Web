import { useState, useEffect } from 'react';
import type { JSX } from 'react';
import { Box } from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Restaurant as RestaurantIcon,
} from '@mui/icons-material';
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
        <Box className="text-table-text-secondary block max-w-[500px]">
          {String(value)}
        </Box>
      ),
    },
  ];

  const actions = [
    {
      label: <EditIcon fontSize="small" />,
      onClick: (row: UserDietaryPreference): void => handleOpenDialog(row),
      tooltip: 'Chỉnh sửa chế độ ăn',
      color: 'primary' as const,
      variant: 'outlined' as const,
    },
    {
      label: <DeleteIcon fontSize="small" />,
      onClick: (row: UserDietaryPreference): void => handleDelete(row),
      tooltip: 'Xóa chế độ ăn',
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
            Quản lý chế độ ăn
          </h1>
          <p className="text-sm text-[var(--color-table-text-secondary)]">
            Quản lý các loại chế độ ăn uống đặc biệt cho người dùng
          </p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          className="flex items-center gap-2 rounded-lg bg-[var(--color-primary-600)] px-4 py-2 font-semibold text-white transition-colors hover:bg-[var(--color-primary-700)]"
        >
          <AddIcon fontSize="small" />
          Thêm chế độ ăn
        </button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={dietaries}
        rowKey="dietaryPreferenceId"
        actions={actions}
        loading={status === 'pending'}
        emptyMessage="Chưa có chế độ ăn nào"
      />

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
        title="Xác nhận xóa chế độ ăn"
        confirmationMessage={
          <>
            Bạn có chắc chắn muốn xóa chế độ ăn &quot;{deletingDietary?.name}
            &quot;? Hành động này không thể hoàn tác.
          </>
        }
      />
    </div>
  );
}
