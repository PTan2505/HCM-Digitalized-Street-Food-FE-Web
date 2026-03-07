import type { JSX } from 'react';
import {
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Card,
  CardContent,
  Typography,
  Divider,
  Rating,
} from '@mui/material';
import {
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import type { VendorDetail } from '@features/admin/types/vendor';

interface VendorDetailModalProps {
  open: boolean;
  onClose: () => void;
  vendorDetail: VendorDetail | null;
}

export default function VendorDetailModal({
  open,
  onClose,
  vendorDetail,
}: VendorDetailModalProps): JSX.Element {
  const getBranchVerificationStatus = (isVerified: boolean): JSX.Element => {
    return isVerified ? (
      <Chip
        icon={<CheckCircleIcon />}
        label="Đã duyệt"
        size="small"
        color="success"
        className="font-semibold"
      />
    ) : (
      <Chip
        icon={<CancelIcon />}
        label="Chưa duyệt"
        size="small"
        color="warning"
        className="font-semibold"
      />
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle className="border-b">
        <Typography variant="h5" component="div" className="font-bold">
          Chi tiết cửa hàng
        </Typography>
      </DialogTitle>
      <DialogContent className="mt-4">
        {vendorDetail && (
          <Box>
            {/* Vendor Info */}
            <Card className="mb-4 shadow-sm">
              <CardContent>
                <Typography variant="h6" className="mb-3 font-semibold">
                  Thông tin chung
                </Typography>
                <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Tên cửa hàng
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {vendorDetail.name}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Chủ cửa hàng
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {vendorDetail.vendorOwnerName}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Ngày tạo
                    </Typography>
                    <Typography variant="body1">
                      {new Date(vendorDetail.createdAt).toLocaleDateString(
                        'vi-VN'
                      )}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Trạng thái
                    </Typography>
                    <Box className="mt-1">
                      <Chip
                        label={
                          vendorDetail.isActive ? 'Đang hoạt động' : 'Tạm ngưng'
                        }
                        size="small"
                        className={
                          vendorDetail.isActive
                            ? 'bg-green-100 font-semibold text-green-800'
                            : 'bg-red-100 font-semibold text-red-800'
                        }
                      />
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Branches */}
            <Typography variant="h6" className="mb-3 font-semibold">
              Chi nhánh ({vendorDetail.branches.length})
            </Typography>
            {vendorDetail.branches.map((branch, index) => (
              <Card key={branch.branchId} className="mb-3 shadow-sm">
                <CardContent>
                  <Box className="mb-3 flex items-start justify-between">
                    <Typography variant="h6" className="font-semibold">
                      Chi nhánh #{index + 1}: {branch.name}
                    </Typography>
                    {getBranchVerificationStatus(branch.isVerified)}
                  </Box>

                  <Divider className="my-3" />

                  <Box className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Contact Info */}
                    <Box>
                      <Typography
                        variant="subtitle2"
                        className="mb-2 font-semibold"
                      >
                        Thông tin liên hệ
                      </Typography>
                      <Box className="mb-2 flex items-center gap-2">
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {branch.phoneNumber}
                        </Typography>
                      </Box>
                      <Box className="flex items-center gap-2">
                        <EmailIcon fontSize="small" color="action" />
                        <Typography variant="body2">{branch.email}</Typography>
                      </Box>
                    </Box>

                    {/* Address */}
                    <Box>
                      <Typography
                        variant="subtitle2"
                        className="mb-2 font-semibold"
                      >
                        Địa chỉ
                      </Typography>
                      <Box className="flex items-start gap-2">
                        <LocationOnIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {branch.addressDetail}, {branch.branchName},{' '}
                          {branch.ward}, {branch.city}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Rating */}
                    <Box>
                      <Typography
                        variant="subtitle2"
                        className="mb-2 font-semibold"
                      >
                        Đánh giá
                      </Typography>
                      <Box className="flex items-center gap-2">
                        <Rating
                          value={branch.avgRating}
                          precision={0.1}
                          readOnly
                          size="small"
                        />
                        <Typography variant="body2" color="text.secondary">
                          ({branch.avgRating.toFixed(1)})
                        </Typography>
                      </Box>
                    </Box>

                    {/* Status */}
                    <Box>
                      <Typography
                        variant="subtitle2"
                        className="mb-2 font-semibold"
                      >
                        Trạng thái hoạt động
                      </Typography>
                      <Box className="flex gap-2">
                        <Chip
                          label={branch.isActive ? 'Hoạt động' : 'Tạm ngưng'}
                          size="small"
                          color={branch.isActive ? 'success' : 'default'}
                        />
                        <Chip
                          label={
                            branch.isSubscribed ? 'Đã đăng ký' : 'Chưa đăng ký'
                          }
                          size="small"
                          color={branch.isSubscribed ? 'primary' : 'default'}
                        />
                      </Box>
                    </Box>

                    {/* Map */}
                    <Box className="md:col-span-2">
                      <Typography
                        variant="subtitle2"
                        className="mb-2 font-semibold"
                      >
                        Vị trí trên bản đồ
                      </Typography>
                      <Box className="overflow-hidden rounded-lg border">
                        <iframe
                          width="100%"
                          height="250"
                          frameBorder="0"
                          style={{ border: 0 }}
                          src={`https://www.google.com/maps?q=${branch.lat},${branch.long}&hl=vi&z=15&output=embed`}
                          allowFullScreen
                        />
                      </Box>
                    </Box>

                    {/* License */}
                    {branch.licenseUrls && branch.licenseUrls.length > 0 && (
                      <Box className="md:col-span-2">
                        <Typography
                          variant="subtitle2"
                          className="mb-2 font-semibold"
                        >
                          Giấy phép kinh doanh
                        </Typography>
                        <Box className="flex gap-2">
                          <Chip
                            label={branch.licenseStatus ?? 'Chưa xác định'}
                            size="small"
                            color={
                              branch.licenseStatus === 'Approved'
                                ? 'success'
                                : branch.licenseStatus === 'Rejected'
                                  ? 'error'
                                  : 'warning'
                            }
                          />
                        </Box>
                        <Box className="mt-2 flex flex-wrap gap-2">
                          {branch.licenseUrls.map((url, idx) => (
                            <Box
                              key={idx}
                              className="overflow-hidden rounded border"
                            >
                              <img
                                src={url}
                                alt={`Giấy phép ${idx + 1}`}
                                className="h-32 w-auto cursor-pointer object-cover transition-transform hover:scale-105"
                                onClick={() => window.open(url, '_blank')}
                              />
                            </Box>
                          ))}
                        </Box>
                        {branch.licenseRejectReason && (
                          <Box className="mt-2 rounded bg-red-50 p-2">
                            <Typography
                              variant="body2"
                              color="error"
                              className="font-medium"
                            >
                              Lý do từ chối: {branch.licenseRejectReason}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions className="border-t">
        <Button
          onClick={onClose}
          color="primary"
          variant="contained"
          className="font-semibold"
        >
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}
