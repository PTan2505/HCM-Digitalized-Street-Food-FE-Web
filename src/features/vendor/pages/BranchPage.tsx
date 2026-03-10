import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import {
  Box,
  IconButton,
  Tooltip as MuiTooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ImageIcon from '@mui/icons-material/Image';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import Table from '@features/vendor/components/Table';
import type { Branch } from '@features/vendor/types/vendor';
import useVendor from '@features/vendor/hooks/useVendor';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectMyVendor, selectVendorStatus } from '@slices/vendor';
import BranchDetailsModal from '@features/vendor/components/BranchDetailsModal';
import BranchFormModal from '@features/vendor/components/BranchFormModal';
import type { BranchFormMode } from '@features/vendor/components/BranchFormModal';
import ImagesDetailsModal from '@features/vendor/components/ImagesDetailsModal';
import WorkScheduleModal from '@features/vendor/components/WorkScheduleModal';
import DayOffModal from '@features/vendor/components/DayOffModal';

const StatusBadge = ({
  label,
  type,
}: {
  label: string;
  type: 'success' | 'error' | 'warning' | 'default';
}): JSX.Element => {
  const colors = {
    success: 'bg-green-100 text-green-700 border-green-200',
    error: 'bg-red-100 text-red-700 border-red-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    default: 'bg-slate-100 text-slate-700 border-slate-200',
  };
  return (
    <span
      className={`inline-flex min-w-[100px] items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-bold shadow-sm ${colors[type]}`}
    >
      {label}
    </span>
  );
};

function BranchPage(): JSX.Element {
  const myVendor = useAppSelector(selectMyVendor);
  const status = useAppSelector(selectVendorStatus);
  const { onGetMyVendor, onUpdateVendorName, onDeleteBranch } = useVendor();
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<BranchFormMode>({
    type: 'createVendor',
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [imagesBranch, setImagesBranch] = useState<Branch | null>(null);
  const [scheduleBranch, setScheduleBranch] = useState<Branch | null>(null);
  const [dayOffBranch, setDayOffBranch] = useState<Branch | null>(null);

  const handleStartEditName = (): void => {
    setEditedName(myVendor?.name ?? '');
    setIsEditingName(true);
    setTimeout(() => nameInputRef.current?.select(), 0);
  };

  const handleSaveName = (): void => {
    const trimmed = editedName.trim();
    if (trimmed && trimmed !== myVendor?.name) {
      void onUpdateVendorName({ name: trimmed });
    }
    setIsEditingName(false);
  };

  const handleCancelEditName = (): void => {
    setIsEditingName(false);
  };

  const handleDeleteBranch = (branch: Branch): void => {
    setDeletingBranch(branch);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (deletingBranch) {
      await onDeleteBranch(deletingBranch.branchId);
      setOpenDeleteDialog(false);
      setDeletingBranch(null);
    }
  };

  const handleCancelDelete = (): void => {
    setOpenDeleteDialog(false);
    setDeletingBranch(null);
  };

  useEffect(() => {
    void onGetMyVendor();
  }, [onGetMyVendor]);

  const branches: Branch[] = myVendor?.branches ?? [];
  const verifiedBranches: Branch[] = branches.filter(
    (b) => b.licenseStatus === 'Accept'
  );
  // const pendingBranches = branches.filter((b) => b.licenseStatus === 'Pending');
  // const hasSinglePending = pendingBranches.length === 1;
  // const vendorId: number | undefined = myVendor?.vendorId;

  // const handleOpenCreateModal = (): void => {
  //   if (branches.length === 0) {
  //     setFormMode({ type: 'createVendor' });
  //   } else if (vendorId !== undefined) {
  //     setFormMode({ type: 'addBranch', vendorId });
  //   }
  //   setFormModalOpen(true);
  // };

  const handleOpenEditModal = (branch: Branch): void => {
    setFormMode({ type: 'editBranch', branch });
    setFormModalOpen(true);
  };

  const handleFormSuccess = (): void => {
    // Slice already handles branch update/create
  };

  const columns = [
    {
      key: 'branchId',
      label: 'ID',
      style: { width: '80px' },
    },
    {
      key: 'name',
      label: 'Tên chi nhánh',
      render: (value: unknown): React.ReactNode => (
        <Box className="text-table-text-primary font-semibold">
          {String(value)}
        </Box>
      ),
    },
    {
      key: 'addressDetail',
      label: 'Địa chỉ',
      render: (value: unknown): React.ReactNode => (
        <Box className="text-table-text-secondary block max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap">
          {typeof value === 'string' ? value : '-'}
        </Box>
      ),
    },
    {
      key: 'ward',
      label: 'Phường/Xã',
      style: { width: '140px' },
    },
    {
      key: 'city',
      label: 'Thành phố',
      style: { width: '140px' },
    },
    {
      key: 'isVerified',
      label: 'Xác thực',
      style: { width: '120px' },
      render: (value: unknown): React.ReactNode => (
        <StatusBadge
          label={value ? 'Đã xác thực' : 'Chưa xác thực'}
          type={value ? 'success' : 'default'}
        />
      ),
    },
    {
      key: 'isActive',
      label: 'Tình trạng hoạt động',
      style: { width: '120px' },
      render: (value: unknown): React.ReactNode => (
        <StatusBadge
          label={value ? 'Đang hoạt động' : 'Không hoạt động'}
          type={value ? 'success' : 'error'}
        />
      ),
    },
    {
      key: 'isSubscribed',
      label: 'Tình trạng đăng ký',
      style: { width: '120px' },
      render: (value: unknown, row: Branch): React.ReactNode => {
        const days = row.daysRemaining;
        const isExpiringSoon =
          value === true && days !== null && days !== undefined && days <= 7;
        return (
          <Box className="flex items-center gap-1">
            <StatusBadge
              label={value ? 'Đã thanh toán' : 'Chưa thanh toán'}
              type={value ? 'success' : 'error'}
            />
            {isExpiringSoon && (
              <MuiTooltip title={`Còn ${days} ngày hết hạn`} arrow>
                <Box className="flex items-center">
                  <WarningAmberIcon
                    fontSize="small"
                    sx={{ color: '#f59e0b' }}
                  />
                </Box>
              </MuiTooltip>
            )}
          </Box>
        );
      },
    },
  ];

  const actions = [
    {
      label: <VisibilityIcon fontSize="small" />,
      menuLabel: 'Xem chi tiết',
      onClick: (branch: Branch): void => {
        setSelectedBranch(branch);
      },
      color: 'primary' as const,
    },
    {
      label: <EditIcon fontSize="small" />,
      menuLabel: 'Cập nhật chi nhánh',
      onClick: (branch: Branch): void => {
        handleOpenEditModal(branch);
      },
      color: 'primary' as const,
    },
    {
      label: <DeleteIcon fontSize="small" />,
      menuLabel: 'Xóa chi nhánh',
      onClick: (branch: Branch): void => {
        handleDeleteBranch(branch);
      },
      color: 'error' as const,
    },
    {
      label: <RestaurantMenuIcon fontSize="small" />,
      menuLabel: 'Quản lý menu',
      onClick: (): void => {
        // Handle menu management for the selected branch
        // KHI BẤM VÀO SẼ MỞ MODAL ĐỂ CRUD MENU
      },
      color: 'primary' as const,
    },
    {
      label: <ImageIcon fontSize="small" />,
      menuLabel: 'Xem ảnh',
      onClick: (branch: Branch): void => {
        setImagesBranch(branch);
      },
      color: 'primary' as const,
    },
    {
      label: <ScheduleIcon fontSize="small" />,
      menuLabel: 'Quản lý lịch làm việc',
      onClick: (branch: Branch): void => {
        setScheduleBranch(branch);
      },
      color: 'primary' as const,
    },
    {
      label: <ScheduleIcon fontSize="small" />,
      menuLabel: 'Quản lý ngày nghỉ',
      onClick: (branch: Branch): void => {
        setDayOffBranch(branch);
      },
      color: 'error' as const,
    },
  ];

  return (
    <div className="font-[var(--font-nunito)]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-bold text-[var(--color-table-text-primary)]">
            Quản lý chi nhánh
          </h1>
          <p className="text-sm text-[var(--color-table-text-secondary)]">
            Tên cửa hàng:{' '}
            {isEditingName ? (
              <span className="inline-flex items-center gap-1">
                <input
                  ref={nameInputRef}
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') handleCancelEditName();
                  }}
                  className="rounded border border-[var(--color-primary-400)] px-1.5 py-0.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-[var(--color-primary-300)]"
                  autoFocus
                />
                <IconButton
                  size="small"
                  onClick={handleSaveName}
                  color="success"
                  title="Lưu"
                >
                  <CheckIcon sx={{ fontSize: 16 }} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={handleCancelEditName}
                  color="error"
                  title="Hủy"
                >
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold">
                {myVendor?.name ?? 'Chưa có tên cửa hàng'}
                {myVendor?.name && (
                  <EditIcon
                    sx={{
                      fontSize: 15,
                      cursor: 'pointer',
                      '&:hover': { color: 'var(--color-primary-600)' },
                    }}
                    onClick={handleStartEditName}
                    titleAccess="Nhấn để chỉnh sửa tên cửa hàng"
                  />
                )}
              </span>
            )}
          </p>
        </div>
        {/* {!hasSinglePending && (
          <button
            // onClick={() => handleOpenDialog()}
            className="flex items-center gap-2 rounded-lg bg-[var(--color-primary-600)] px-4 py-2 font-semibold text-white transition-colors hover:bg-[var(--color-primary-700)]"
          >
            <AddIcon fontSize="small" />
            {verifiedBranches.length === 0
              ? 'Tạo cửa hàng mới'
              : 'Thêm chi nhánh'}
          </button>
        )} */}
      </div>

      <Table
        columns={columns}
        data={verifiedBranches}
        rowKey="branchId"
        loading={status === 'pending'}
        emptyMessage="Chưa có chi nhánh đã xác thực (Vui lòng đăng ký chi nhánh ở tab Lịch sử đăng ký)"
        actions={actions}
      />

      <BranchDetailsModal
        isOpen={selectedBranch !== null}
        onClose={() => setSelectedBranch(null)}
        branch={selectedBranch}
      />

      <BranchFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        mode={formMode}
        onSuccess={handleFormSuccess}
      />

      <ImagesDetailsModal
        isOpen={imagesBranch !== null}
        onClose={() => setImagesBranch(null)}
        branch={imagesBranch}
      />

      <WorkScheduleModal
        isOpen={scheduleBranch !== null}
        onClose={() => setScheduleBranch(null)}
        branch={scheduleBranch}
      />

      <DayOffModal
        isOpen={dayOffBranch !== null}
        onClose={() => setDayOffBranch(null)}
        branch={dayOffBranch}
      />

      <Dialog
        open={openDeleteDialog}
        onClose={handleCancelDelete}
        aria-labelledby="delete-branch-dialog-title"
        aria-describedby="delete-branch-dialog-description"
      >
        <DialogTitle id="delete-branch-dialog-title">
          Xác nhận xóa chi nhánh
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-branch-dialog-description">
            Bạn có chắc chắn muốn xóa chi nhánh &quot;
            {deletingBranch?.name}&quot;? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Hủy
          </Button>
          <Button
            onClick={() => void handleConfirmDelete()}
            color="error"
            variant="contained"
            autoFocus
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default BranchPage;
