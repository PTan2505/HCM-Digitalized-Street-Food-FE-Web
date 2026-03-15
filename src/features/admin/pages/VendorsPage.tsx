import { useState, useEffect } from 'react';
import type { JSX } from 'react';
import {
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Block as BlockIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import Table from '@features/admin/components/Table';
import Pagination from '@features/admin/components/Pagination';
import VendorDetailModal from '@features/admin/components/VendorDetailModal';
import type { AdminVendor } from '@features/admin/types/vendor';
import useVendor from '@features/admin/hooks/useVendor';
import { useAppSelector } from '@hooks/reduxHooks';
import {
  selectAdminVendors,
  selectAdminVendorsPagination,
  selectAdminVendorStatus,
  selectAdminVendorDetail,
} from '@slices/vendor';

export default function VendorsPage(): JSX.Element {
  const vendors = useAppSelector(selectAdminVendors);
  const pagination = useAppSelector(selectAdminVendorsPagination);
  const status = useAppSelector(selectAdminVendorStatus);
  const vendorDetail = useAppSelector(selectAdminVendorDetail);
  const {
    onGetAllVendors,
    onGetVendorDetail,
    onDeleteVendor,
    onSuspendVendor,
    onReactivateVendor,
  } = useVendor();

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openSuspendDialog, setOpenSuspendDialog] = useState(false);
  const [openReactivateDialog, setOpenReactivateDialog] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<AdminVendor | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    void onGetAllVendors({ pageNumber: currentPage, pageSize });
  }, [onGetAllVendors, currentPage, pageSize]);

  const handleViewDetail = async (vendor: AdminVendor): Promise<void> => {
    try {
      await onGetVendorDetail(vendor.vendorId);
      setOpenDetailModal(true);
    } catch (error) {
      console.error('Failed to fetch vendor detail:', error);
    }
  };

  const handleDelete = (vendor: AdminVendor): void => {
    setSelectedVendor(vendor);
    setOpenDeleteDialog(true);
  };

  const handleSuspend = (vendor: AdminVendor): void => {
    setSelectedVendor(vendor);
    setOpenSuspendDialog(true);
  };

  const handleReactivate = (vendor: AdminVendor): void => {
    setSelectedVendor(vendor);
    setOpenReactivateDialog(true);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (selectedVendor) {
      try {
        await onDeleteVendor(selectedVendor.vendorId);
        setOpenDeleteDialog(false);
        setSelectedVendor(null);
      } catch (error) {
        console.error('Failed to delete vendor:', error);
      }
    }
  };

  const handleConfirmSuspend = async (): Promise<void> => {
    if (selectedVendor) {
      try {
        await onSuspendVendor(selectedVendor.vendorId);
        setOpenSuspendDialog(false);
        setSelectedVendor(null);
      } catch (error) {
        console.error('Failed to suspend vendor:', error);
      }
    }
  };

  const handleConfirmReactivate = async (): Promise<void> => {
    if (selectedVendor) {
      try {
        await onReactivateVendor(selectedVendor.vendorId);
        setOpenReactivateDialog(false);
        setSelectedVendor(null);
      } catch (error) {
        console.error('Failed to reactivate vendor:', error);
      }
    }
  };

  const handleCancelDialog = (): void => {
    setOpenDeleteDialog(false);
    setOpenSuspendDialog(false);
    setOpenReactivateDialog(false);
    setSelectedVendor(null);
  };

  const handleCloseDetailModal = (): void => {
    setOpenDetailModal(false);
  };

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number): void => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const columns = [
    {
      key: 'vendorId',
      label: 'ID',
      style: { width: '60px', maxWidth: '60px' },
      render: (value: unknown): React.ReactNode => (
        <Box className="text-table-text-primary font-medium">
          {String(value)}
        </Box>
      ),
    },
    {
      key: 'name',
      label: 'Tên cửa hàng',
      render: (value: unknown): React.ReactNode => (
        <Box className="text-table-text-primary font-semibold">
          {String(value)}
        </Box>
      ),
    },
    {
      key: 'vendorOwnerName',
      label: 'Chủ cửa hàng',
      render: (value: unknown): React.ReactNode => (
        <Box className="text-table-text-secondary">{String(value)}</Box>
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
            label={isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
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
    {
      key: 'createdAt',
      label: 'Ngày tạo',
      style: { width: '120px' },
      render: (value: unknown): React.ReactNode => {
        const date = new Date(String(value));
        return (
          <Box className="text-table-text-secondary text-sm">
            {date.toLocaleDateString('vi-VN')}
          </Box>
        );
      },
    },
  ];

  const actions = [
    {
      label: <VisibilityIcon fontSize="small" />,
      onClick: (row: AdminVendor): void => {
        void handleViewDetail(row);
      },
      color: 'primary' as const,
      variant: 'outlined' as const,
    },
    {
      label: <BlockIcon fontSize="small" />,
      onClick: (row: AdminVendor): void => {
        if (row.isActive) {
          handleSuspend(row);
        } else {
          handleReactivate(row);
        }
      },
      color: 'warning' as const,
      variant: 'outlined' as const,
    },
    {
      label: <DeleteIcon fontSize="small" />,
      onClick: (row: AdminVendor): void => handleDelete(row),
      color: 'error' as const,
      variant: 'outlined' as const,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-table-text-primary mb-1 text-3xl font-bold">
            Quản lý cửa hàng
          </h1>
          <p className="text-table-text-secondary text-sm">
            Quản lý danh sách các cửa hàng đăng ký trong hệ thống
          </p>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={vendors}
        rowKey="vendorId"
        actions={actions}
        loading={status === 'pending'}
        emptyMessage="Chưa có cửa hàng nào"
        maxHeight="none"
      />

      {/* Pagination */}
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalCount={pagination.totalCount}
        pageSize={pagination.pageSize}
        hasPrevious={pagination.hasPrevious}
        hasNext={pagination.hasNext}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCancelDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Xác nhận xóa cửa hàng
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Bạn có chắc chắn muốn xóa cửa hàng &quot;{selectedVendor?.name}
            &quot;? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancelDialog}
            color="primary"
            className="font-semibold"
          >
            Hủy
          </Button>
          <Button
            onClick={() => void handleConfirmDelete()}
            color="error"
            variant="contained"
            className="font-semibold"
            autoFocus
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Suspend Confirmation Dialog */}
      <Dialog
        open={openSuspendDialog}
        onClose={handleCancelDialog}
        aria-labelledby="suspend-dialog-title"
        aria-describedby="suspend-dialog-description"
      >
        <DialogTitle id="suspend-dialog-title">
          Xác nhận tạm ngưng cửa hàng
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="suspend-dialog-description">
            Bạn có chắc chắn muốn tạm ngưng hoạt động của cửa hàng &quot;
            {selectedVendor?.name}&quot;?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancelDialog}
            color="primary"
            className="font-semibold"
          >
            Hủy
          </Button>
          <Button
            onClick={() => void handleConfirmSuspend()}
            color="warning"
            variant="contained"
            className="font-semibold"
            autoFocus
          >
            Tạm ngưng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reactivate Confirmation Dialog */}
      <Dialog
        open={openReactivateDialog}
        onClose={handleCancelDialog}
        aria-labelledby="reactivate-dialog-title"
        aria-describedby="reactivate-dialog-description"
      >
        <DialogTitle id="reactivate-dialog-title">
          Xác nhận kích hoạt lại cửa hàng
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="reactivate-dialog-description">
            Bạn có chắc chắn muốn kích hoạt lại cửa hàng &quot;
            {selectedVendor?.name}&quot;?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancelDialog}
            color="primary"
            className="font-semibold"
          >
            Hủy
          </Button>
          <Button
            onClick={() => void handleConfirmReactivate()}
            color="success"
            variant="contained"
            className="font-semibold"
            autoFocus
          >
            Kích hoạt
          </Button>
        </DialogActions>
      </Dialog>

      {/* Vendor Detail Modal */}
      <VendorDetailModal
        open={openDetailModal}
        onClose={handleCloseDetailModal}
        vendorDetail={vendorDetail}
      />
    </div>
  );
}
