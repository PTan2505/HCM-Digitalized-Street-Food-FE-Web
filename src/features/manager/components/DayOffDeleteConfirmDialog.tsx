import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import type { JSX } from 'react';

interface DayOffDeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export default function DayOffDeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  isLoading,
}: DayOffDeleteConfirmDialogProps): JSX.Element {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="px-6 pt-5 pb-2">
        <Box className="flex items-center gap-3">
          <Box>
            <Typography className="text-base font-bold text-gray-900">
              Xác nhận xóa thời gian nghỉ
            </Typography>
            <Typography className="text-xs text-gray-500">
              Hành động này không thể hoàn tác
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent className="px-6 pt-2 pb-3">
        <Box className="rounded-lg border border-red-100 bg-red-50 px-4 py-3">
          <Typography className="text-sm text-red-800">
            Bạn chắc chắn muốn xóa đợt nghỉ này chứ? Sau khi xóa, chi nhánh có
            thể hiển thị là hoạt động trong khoảng thời gian đó.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions className="px-6 pb-5">
        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
          disabled={isLoading}
          sx={{ borderColor: '#d1d5db', color: '#374151' }}
        >
          Hủy
        </Button>
        <Button
          onClick={onConfirm}
          variant="outlined"
          color="error"
          disabled={isLoading}
          sx={{ borderColor: '#d1d5db', color: 'red' }}
        >
          Xóa ngay
        </Button>
      </DialogActions>
    </Dialog>
  );
}
