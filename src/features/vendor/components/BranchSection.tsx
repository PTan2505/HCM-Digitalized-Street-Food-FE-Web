import React, { useState, type JSX } from 'react';
import { type Branch } from '../types/branch';
import { type WorkSchedule, type DayOff } from '../types/workSchedule';
import AddressSection from './AddressSection';
import OperatingInfoSection from './OperatingInfoSection';
import DocumentsSection from './DocumentsSection';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

interface BranchSectionProps {
  branch: Branch;
  index: number;
  onBranchChange: (branchId: string, field: string, value: unknown) => void;
  onBranchRemove: (branchId: string) => void;
  showRemoveButton: boolean;
  onFileChange: (
    branchId: string,
    field: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
}

export default function BranchSection({
  branch,
  index,
  onBranchChange,
  onBranchRemove,
  showRemoveButton,
  onFileChange,
}: BranchSectionProps): JSX.Element {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const handleFieldChange = (field: string, value: unknown): void => {
    onBranchChange(branch.id, field, value);
  };

  const handleDeleteClick = (): void => {
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = (): void => {
    setOpenDeleteDialog(false);
    onBranchRemove(branch.id);
  };

  const handleDeleteCancel = (): void => {
    setOpenDeleteDialog(false);
  };

  return (
    <div className="mb-12">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">
          {index === 0
            ? '3. Thông tin cửa hàng chính'
            : `3.${index + 1} Chi nhánh ${index}`}
        </h2>
        {showRemoveButton && (
          <button
            type="button"
            onClick={handleDeleteClick}
            className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition-all hover:bg-red-100"
          >
            ✕ Xóa
          </button>
        )}
      </div>

      {/* Địa chỉ */}
      <AddressSection
        formData={{
          province: branch.province,
          district: branch.district,
          ward: branch.ward,
          detailAddress: branch.detailAddress,
          mapLocation: branch.mapLocation,
          latitude: branch.latitude,
          longitude: branch.longitude,
        }}
        onChange={handleFieldChange}
      />

      {/* Thông tin hoạt động */}
      <OperatingInfoSection
        branchId={null}
        formMode={true}
        workScheduleData={{
          weekdays: branch.workingDays.map((day) => parseInt(day, 10)),
          openTime: branch.openTime,
          closeTime: branch.closeTime,
        }}
        dayOffData={{
          startDate: branch.closedDates,
          endDate: branch.closedDates,
          startTime: null,
          endTime: null,
        }}
        onWorkScheduleChange={(data: WorkSchedule) => {
          handleFieldChange(
            'workingDays',
            data.weekdays.map((day) => day.toString())
          );
          handleFieldChange('openTime', data.openTime);
          handleFieldChange('closeTime', data.closeTime);
        }}
        onDayOffChange={(data: DayOff) => {
          handleFieldChange('closedDates', data.startDate);
        }}
      />

      {/* Hình ảnh & Giấy tờ */}
      <DocumentsSection
        formData={{
          storeAvatar: branch.storeAvatar,
          storeFrontImage: branch.storeFrontImage,
          businessLicense: branch.businessLicense,
          idCard: branch.idCard,
        }}
        onFileChange={(field, event) => onFileChange(branch.id, field, event)}
      />

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Xác nhận xóa chi nhánh
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Bạn có chắc chắn muốn xóa chi nhánh này không? Hành động này không
            thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="inherit">
            Hủy
          </Button>
          <Button
            onClick={handleDeleteConfirm}
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
