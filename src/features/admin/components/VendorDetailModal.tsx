import type { VendorDetail } from '@features/admin/types/vendor';
import {
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Rating,
  Typography,
} from '@mui/material';
import BranchLocationPreviewMap from '@features/admin/components/BranchLocationPreviewMap';
import type { JSX } from 'react';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AppModalHeader from '@components/AppModalHeader';

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
  const ownerDisplayName = vendorDetail?.vendorOwner
    ? `${vendorDetail.vendorOwner.firstName ?? ''} ${vendorDetail.vendorOwner.lastName ?? ''}`.trim()
    : (vendorDetail?.vendorOwnerName ?? '-');

  const branches = Array.isArray(vendorDetail?.branches)
    ? vendorDetail.branches
    : [];
  const dietaryPreferences = Array.isArray(vendorDetail?.dietaryPreferences)
    ? vendorDetail.dietaryPreferences
    : [];

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
      <AppModalHeader
        title="Chi tiết cửa hàng"
        subtitle={vendorDetail?.name ?? ''}
        icon={<StorefrontIcon />}
        iconTone="admin"
        onClose={onClose}
      />
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
                      {ownerDisplayName}
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
                      Cập nhật gần nhất
                    </Typography>
                    <Typography variant="body1">
                      {vendorDetail.updatedAt
                        ? new Date(vendorDetail.updatedAt).toLocaleDateString(
                            'vi-VN'
                          )
                        : '-'}
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
                  <Box className="sm:col-span-2">
                    <Typography variant="body2" color="text.secondary">
                      Khẩu vị cửa hàng
                    </Typography>
                    <Box className="mt-1 flex flex-wrap gap-2">
                      {dietaryPreferences.length > 0 ? (
                        dietaryPreferences.map((item, index) => (
                          <Chip
                            key={`${item.dietaryId ?? index}`}
                            label={item.name ?? 'Không xác định'}
                            size="small"
                            color="default"
                          />
                        ))
                      ) : (
                        <Typography variant="body2">Chưa thiết lập</Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Branches */}
            <Typography variant="h6" className="mb-3 font-semibold">
              Chi nhánh ({branches.length})
            </Typography>
            {branches.map((branch, index) => (
              <Card key={branch.branchId} className="mb-3 shadow-sm">
                <CardContent>
                  <Box className="mb-3 flex items-start justify-between">
                    <Typography variant="h6" className="font-semibold">
                      Chi nhánh #{index + 1}: {branch.name}
                    </Typography>
                    <Box className="flex items-center gap-2">
                      {branch.tierName && (
                        <Chip
                          label={branch.tierName}
                          size="small"
                          color="info"
                        />
                      )}
                      {getBranchVerificationStatus(branch.isVerified)}
                    </Box>
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
                          {branch.addressDetail}, {branch.ward}, {branch.city}
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
                          ({Number(branch.avgRating ?? 0).toFixed(1)})
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {branch.totalReviewCount ?? 0} đánh giá
                      </Typography>
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
                        {branch.daysRemaining !== null &&
                          branch.daysRemaining !== undefined && (
                            <Chip
                              label={`Còn ${branch.daysRemaining} ngày`}
                              size="small"
                              color="warning"
                            />
                          )}
                      </Box>
                    </Box>

                    {/* Subscription */}
                    <Box>
                      <Typography
                        variant="subtitle2"
                        className="mb-2 font-semibold"
                      >
                        Gói đăng ký
                      </Typography>
                      <Typography variant="body2">
                        Tier: {branch.tierName ?? '-'}
                      </Typography>
                      <Typography variant="body2">
                        Hết hạn: {branch.subscriptionExpiresAt ?? '-'}
                      </Typography>
                    </Box>

                    {/* Map */}
                    <Box className="md:col-span-2">
                      <Typography
                        variant="subtitle2"
                        className="mb-2 font-semibold"
                      >
                        Vị trí trên bản đồ
                      </Typography>
                      <BranchLocationPreviewMap
                        lat={branch.lat}
                        lng={branch.long}
                      />
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
      <DialogActions className="border-t border-gray-300">
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
