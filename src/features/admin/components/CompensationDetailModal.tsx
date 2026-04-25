import type { JSX } from 'react';
import { Dialog, DialogContent, DialogActions, Button } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AppModalHeader from '@components/AppModalHeader';
import Table from '@features/admin/components/Table';
import type { VendorCompensation } from '@features/admin/types/dashboard';

interface CompensationDetailModalProps {
  open: boolean;
  onClose: () => void;
  data: VendorCompensation[];
}

export default function CompensationDetailModal({
  open,
  onClose,
  data,
}: CompensationDetailModalProps): JSX.Element {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: '24px', overflow: 'hidden' },
      }}
    >
      <AppModalHeader
        title="Chi tiết bồi thường"
        subtitle="Danh sách bồi thường theo người bán"
        icon={<AssessmentIcon />}
        iconTone="admin"
        onClose={onClose}
      />
      <DialogContent className="p-6">
        <Table
          rowKey="vendorId"
          data={data}
          columns={[
            {
              key: 'vendorName',
              label: 'Người bán',
              style: { fontWeight: 600 },
            },
            {
              key: 'compensationAmount',
              label: 'Số tiền bồi thường',
              style: { textAlign: 'right' },
              render: (value) => (
                <span className="font-bold text-red-600">
                  {formatCurrency(Number(value))}
                </span>
              ),
            },
          ]}
          emptyMessage="Không có dữ liệu bồi thường trong khoảng thời gian này"
          maxHeight="400px"
        />
      </DialogContent>
      <DialogActions className="border-t border-gray-200 bg-gray-50 p-4">
        <Button onClick={onClose} color="primary" variant="contained">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}
