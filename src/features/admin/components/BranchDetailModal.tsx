import type { JSX } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import type { BranchAdmin } from '@features/admin/types/branch';

interface BranchDetailModalProps {
  open: boolean;
  onClose: () => void;
  branchDetail: BranchAdmin | null;
}

export default function BranchDetailModal({
  open,
  onClose,
  branchDetail,
}: BranchDetailModalProps): JSX.Element {
  if (!branchDetail) return <></>;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="text-primary-800 border-b border-gray-200 bg-gray-50 pb-4 font-bold">
        Chi tiết chi nhánh
      </DialogTitle>
      <DialogContent className="p-6">
        <Box className="mt-4 flex flex-col gap-6">
          {/* General Info */}
          <Box>
            <Typography
              variant="h6"
              className="text-primary-700 mb-2 font-semibold"
            >
              Thông tin chung
            </Typography>
            <Divider className="mb-3" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Typography variant="body2" color="textSecondary">
                  Tên chi nhánh
                </Typography>
                <Typography variant="body1" className="font-medium">
                  {branchDetail.name}
                </Typography>
              </div>
              <div>
                <Typography variant="body2" color="textSecondary">
                  Trạng thái hoạt động
                </Typography>
                <Typography variant="body1" className="font-medium">
                  {branchDetail.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                </Typography>
              </div>
              <div>
                <Typography variant="body2" color="textSecondary">
                  Đã xác minh
                </Typography>
                <Typography variant="body1" className="font-medium">
                  {branchDetail.isVerified ? 'Có' : 'Không'}
                </Typography>
              </div>
              <div>
                <Typography variant="body2" color="textSecondary">
                  Người xác minh
                </Typography>
                <Typography variant="body1" className="font-medium">
                  {branchDetail.verifiedByUserName ?? 'Không có'}
                </Typography>
              </div>
            </div>
          </Box>

          {/* Contact & Location */}
          <Box>
            <Typography
              variant="h6"
              className="text-primary-700 mt-2 mb-2 font-semibold"
            >
              Liên hệ & Địa chỉ
            </Typography>
            <Divider className="mb-3" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Typography variant="body2" color="textSecondary">
                  Số điện thoại
                </Typography>
                <Typography variant="body1" className="font-medium">
                  {branchDetail.phoneNumber ?? 'Không có'}
                </Typography>
              </div>
              <div>
                <Typography variant="body2" color="textSecondary">
                  Email
                </Typography>
                <Typography variant="body1" className="font-medium">
                  {branchDetail.email ?? 'Không có'}
                </Typography>
              </div>
              <div className="sm:col-span-2">
                <Typography variant="body2" color="textSecondary">
                  Địa chỉ chi tiết
                </Typography>
                <Typography variant="body1" className="font-medium">
                  {`${branchDetail.addressDetail}, ${branchDetail.ward}, ${branchDetail.city}`}
                </Typography>
              </div>
              <div>
                <Typography variant="body2" color="textSecondary">
                  Tọa độ
                </Typography>
                <Typography variant="body1" className="font-medium">
                  {branchDetail.lat}, {branchDetail.long}
                </Typography>
              </div>
            </div>
          </Box>

          {/* Timestamps & Extra Info */}
          <Box>
            <Typography
              variant="h6"
              className="text-primary-700 mt-2 mb-2 font-semibold"
            >
              Thông tin khác
            </Typography>
            <Divider className="mb-3" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Typography variant="body2" color="textSecondary">
                  Ngày tạo
                </Typography>
                <Typography variant="body1" className="font-medium">
                  {new Date(branchDetail.createdAt).toLocaleString('vi-VN')}
                </Typography>
              </div>
              <div>
                <Typography variant="body2" color="textSecondary">
                  Đánh giá trung bình
                </Typography>
                <Typography variant="body1" className="font-medium">
                  {branchDetail.avgRating || 0} ({branchDetail.totalReviewCount}{' '}
                  lượt)
                </Typography>
              </div>
              <div>
                <Typography variant="body2" color="textSecondary">
                  Hạng
                </Typography>
                <Typography variant="body1" className="font-medium">
                  {branchDetail.tierName ?? 'Không có'}
                </Typography>
              </div>
            </div>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions className="border-t border-gray-200 bg-gray-50 p-4">
        <Button onClick={onClose} color="primary" variant="contained">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}
