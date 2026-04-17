import type { JSX } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

interface WorkScheduleDeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function WorkScheduleDeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
}: WorkScheduleDeleteConfirmDialogProps): JSX.Element {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Xác nhận xóa thời gian hoạt động</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Bạn có chắc chắn muốn xóa thời gian hoạt động này? Hành động này không
          thể hoàn tác.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Hủy
        </Button>
        <Button onClick={onConfirm} color="error" variant="outlined">
          Xóa
        </Button>
      </DialogActions>
    </Dialog>
  );
}
