import { useState, useEffect, useMemo } from 'react';
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
  CheckCircleOutline as CheckCircleOutlineIcon,
  Visibility as VisibilityIcon,
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
import Pagination from '@features/admin/components/Pagination';
import VendorDetailModal from '@features/admin/components/VendorDetailModal';
import DeleteConfirmationDialog from '@components/ui/DeleteConfirmationDialog';
import type { AdminVendor } from '@features/admin/types/vendor';
import useVendor from '@features/admin/hooks/useVendor';
import { useAppSelector } from '@hooks/reduxHooks';
import {
  selectAdminVendors,
  selectAdminVendorsPagination,
  selectAdminVendorStatus,
  selectAdminVendorDetail,
} from '@slices/vendor';
import { getVendorsManagementTourSteps } from '@features/admin/utils/vendorsManagementTourSteps';

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
  const [pageSize, setPageSize] = useState(5);
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [tourInstanceKey, setTourInstanceKey] = useState(0);

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

  const startVendorsTour = (): void => {
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
    return getVendorsManagementTourSteps({
      hasRows: vendors.length > 0,
    });
  }, [vendors.length]);

  const columns = [
    // {
    //   key: 'vendorId',
    //   label: 'ID',
    //   style: { width: '60px', maxWidth: '60px' },
    //   render: (value: unknown): React.ReactNode => (
    //     <Box className="text-table-text-primary font-medium">
    //       {String(value)}
    //     </Box>
    //   ),
    // },
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
      id: 'view',
      label: <VisibilityIcon fontSize="small" />,
      onClick: (row: AdminVendor): void => {
        void handleViewDetail(row);
      },
      tooltip: 'Xem chi tiết cửa hàng',
      color: 'primary' as const,
      variant: 'outlined' as const,
    },
    {
      id: 'suspend',
      label: <BlockIcon fontSize="small" />,
      onClick: (row: AdminVendor): void => {
        handleSuspend(row);
      },
      tooltip: 'Tạm ngưng cửa hàng',
      color: 'warning' as const,
      variant: 'outlined' as const,
      show: (row: AdminVendor): boolean => row.isActive,
    },
    {
      id: 'reactivate',
      label: <CheckCircleOutlineIcon fontSize="small" />,
      onClick: (row: AdminVendor): void => {
        handleReactivate(row);
      },
      tooltip: 'Kích hoạt lại cửa hàng',
      color: 'success' as const,
      variant: 'outlined' as const,
      show: (row: AdminVendor): boolean => !row.isActive,
    },
    // {
    //   id: 'delete',
    //   label: <DeleteIcon fontSize="small" />,
    //   onClick: (row: AdminVendor): void => handleDelete(row),
    //   tooltip: 'Xóa cửa hàng',
    //   color: 'error' as const,
    //   variant: 'outlined' as const,
    // },
  ];

  return (
    <div>
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
        data-tour="vendors-page-header"
      >
        <div>
          <div className="mb-1 flex items-start gap-2">
            <h1 className="text-table-text-primary text-3xl font-bold">
              Quản lý cửa hàng
            </h1>
            <button
              type="button"
              onClick={startVendorsTour}
              aria-label="Mở hướng dẫn quản lý cửa hàng"
              title="Hướng dẫn"
              className="text-primary-700 hover:text-primary-800 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
            >
              <HelpOutlineIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
          <p className="text-table-text-secondary text-sm">
            Quản lý danh sách các cửa hàng đăng ký trong hệ thống
          </p>
        </div>
      </div>

      {/* Table */}
      <div data-tour="vendors-table-wrapper">
        <Table
          columns={columns}
          data={vendors}
          rowKey="vendorId"
          actions={actions}
          loading={status === 'pending'}
          emptyMessage="Chưa có cửa hàng nào"
          maxHeight="none"
          tourId="admin-vendors"
        />
      </div>

      {/* Pagination */}
      <div data-tour="vendors-pagination">
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
      </div>

      <DeleteConfirmationDialog
        open={openDeleteDialog}
        onClose={handleCancelDialog}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa cửa hàng"
        confirmationMessage={
          <>
            Bạn có chắc chắn muốn xóa cửa hàng &quot;{selectedVendor?.name}
            &quot;? Hành động này không thể hoàn tác.
          </>
        }
      />

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
