import type { JSX } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  confirmationMessage?: React.ReactNode;
  confirmButtonLabel?: string;
  confirmButtonColor?:
    | 'primary'
    | 'secondary'
    | 'error'
    | 'warning'
    | 'info'
    | 'success';
}

export default function DeleteConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  confirmationMessage,
  confirmButtonLabel = 'Xóa',
  confirmButtonColor = 'error',
}: DeleteConfirmationDialogProps): JSX.Element {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      <DialogTitle id="delete-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-dialog-description">
          {confirmationMessage ??
            'Bạn có chắc chắn muốn xóa mục này? Hành động này không thể hoàn tác.'}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          color="primary"
          variant="outlined"
          className="font-[var(--font-nunito)] font-semibold"
        >
          Hủy
        </Button>
        <Button
          onClick={() => void onConfirm()}
          color={confirmButtonColor}
          variant="outlined"
          className="font-[var(--font-nunito)] font-semibold"
          autoFocus
        >
          {confirmButtonLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
