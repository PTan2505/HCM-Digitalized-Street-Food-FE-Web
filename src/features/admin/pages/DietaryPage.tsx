import { useState } from 'react';
import type { JSX } from 'react';
import { Box, Chip } from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Restaurant as RestaurantIcon,
} from '@mui/icons-material';
import Table from '@features/admin/components/Table';
import DietaryFormModal from '@features/admin/components/DietaryFormModal';
import {
  MOCK_DIETARY,
  type DietaryDefinition,
} from '@features/admin/data/mockDietaryData';

interface Dietary extends DietaryDefinition {
  [key: string]: unknown;
}

export default function DietaryPage(): JSX.Element {
  const [dietaries, setDietaries] = useState<Dietary[]>(
    MOCK_DIETARY.map((d) => ({ ...d }))
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDietary, setEditingDietary] = useState<Dietary | null>(null);
  const [formData, setFormData] = useState<Partial<Dietary>>({
    name: '',
    description: '',
  });

  const handleOpenDialog = (dietary?: Dietary): void => {
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

  const handleSave = (): void => {
    if (editingDietary) {
      // Cập nhật dietary
      setDietaries(
        dietaries.map((d) =>
          d.dietaryId === editingDietary.dietaryId
            ? { ...(formData as Dietary), dietaryId: editingDietary.dietaryId }
            : d
        )
      );
    } else {
      // Thêm mới dietary
      const newDietary: Dietary = {
        ...(formData as Dietary),
        dietaryId: Math.max(0, ...dietaries.map((d) => d.dietaryId)) + 1,
      };
      setDietaries([...dietaries, newDietary]);
    }
    handleCloseDialog();
  };

  const handleDelete = (dietary: Dietary): void => {
    const dietaryName = String(dietary.name);
    if (
      window.confirm(`Bạn có chắc chắn muốn xóa chế độ ăn "${dietaryName}"?`)
    ) {
      setDietaries(dietaries.filter((d) => d.dietaryId !== dietary.dietaryId));
    }
  };

  const columns = [
    {
      key: 'dietaryId',
      label: 'ID',
      sx: { width: '80px' },
    },
    {
      key: 'name',
      label: 'Tên chế độ ăn',
      render: (value: unknown): React.ReactNode => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <RestaurantIcon
            fontSize="small"
            sx={{ color: 'var(--color-primary-600)' }}
          />
          <Box
            sx={{
              fontWeight: 600,
              color: 'var(--color-table-text-primary)',
              fontFamily: 'var(--font-nunito)',
            }}
          >
            {String(value)}
          </Box>
        </Box>
      ),
    },
    {
      key: 'description',
      label: 'Mô tả',
      render: (value: unknown): React.ReactNode => (
        <Box
          sx={{
            maxWidth: '500px',
            color: 'var(--color-table-text-secondary)',
            fontFamily: 'var(--font-nunito)',
          }}
        >
          {String(value)}
        </Box>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      sx: { width: '120px' },
      render: (): React.ReactNode => (
        <Chip
          label="Hoạt động"
          size="small"
          sx={{
            bgcolor: 'var(--color-success-100)',
            color: 'var(--color-success-800)',
            fontWeight: 600,
            fontFamily: 'var(--font-nunito)',
          }}
        />
      ),
    },
  ];

  const actions = [
    {
      label: <EditIcon fontSize="small" />,
      onClick: (row: Record<string, unknown>): void =>
        handleOpenDialog(row as unknown as Dietary),
      color: 'primary' as const,
      variant: 'outlined' as const,
    },
    {
      label: <DeleteIcon fontSize="small" />,
      onClick: (row: Record<string, unknown>): void =>
        handleDelete(row as unknown as Dietary),
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
        rowKey="dietaryId"
        actions={actions}
        emptyMessage="Chưa có chế độ ăn nào"
      />

      {/* Modal Form */}
      <DietaryFormModal
        isOpen={openDialog}
        isEditMode={!!editingDietary}
        formData={formData}
        onClose={handleCloseDialog}
        onSave={handleSave}
        onChange={(data) => setFormData(data as Partial<Dietary>)}
      />
    </div>
  );
}
