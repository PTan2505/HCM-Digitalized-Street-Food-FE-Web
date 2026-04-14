import type { VendorDetail } from '@features/admin/types/vendor';
import {
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
  const formatDateTime = (dateValue?: string | null): string => {
    if (!dateValue) {
      return '-';
    }

    return new Date(dateValue).toLocaleString('vi-VN', {
      hour12: false,
    });
  };

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
        // icon={<CheckCircleIcon />}
        label="Đã duyệt"
        size="small"
        className="border border-emerald-200 bg-emerald-50 font-semibold text-emerald-700"
      />
    ) : (
      <Chip
        // icon={<CancelIcon />}
        label="Chưa duyệt"
        size="small"
        className="border border-amber-200 bg-amber-50 font-semibold text-amber-700"
      />
    );
  };

  const getLicenseStatusChip = (status?: string | null): JSX.Element => {
    const normalizedStatus = (status ?? '').toLowerCase();

    if (normalizedStatus === 'approved' || normalizedStatus === 'accept') {
      return (
        <Chip
          label={status ?? 'Chưa xác định'}
          size="small"
          className="border border-emerald-200 bg-emerald-50 font-semibold text-emerald-700"
        />
      );
    }

    if (normalizedStatus === 'rejected' || normalizedStatus === 'reject') {
      return (
        <Chip
          label={status ?? 'Chưa xác định'}
          size="small"
          className="border border-rose-200 bg-rose-50 font-semibold text-rose-700"
        />
      );
    }

    return (
      <Chip
        label={status ?? 'Chưa xác định'}
        size="small"
        className="border border-slate-200 bg-slate-50 font-semibold text-slate-700"
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
      <DialogContent className="mt-4 bg-slate-50/50">
        {vendorDetail && (
          <Box>
            {/* Vendor Info */}
            <Card className="mb-4 border border-slate-200 shadow-sm">
              <CardContent>
                <Typography variant="h6" className="mb-4 font-semibold">
                  Thông tin chung
                </Typography>
                <Box className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Box className="rounded-lg border border-slate-200 bg-white p-3">
                    <Typography variant="body2" color="text.secondary">
                      Tên cửa hàng
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {vendorDetail.name}
                    </Typography>
                  </Box>
                  <Box className="rounded-lg border border-slate-200 bg-white p-3">
                    <Typography variant="body2" color="text.secondary">
                      Chủ cửa hàng
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {ownerDisplayName}
                    </Typography>
                  </Box>

                  <Box className="rounded-lg border border-slate-200 bg-white p-3">
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
                            ? 'border border-emerald-200 bg-emerald-50 font-semibold text-emerald-700'
                            : 'border border-rose-200 bg-rose-50 font-semibold text-rose-700'
                        }
                      />
                    </Box>
                  </Box>
                  <Box className="rounded-lg border border-slate-200 bg-white p-3">
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
                            className="border border-slate-200 bg-slate-100 text-slate-700"
                          />
                        ))
                      ) : (
                        <Typography variant="body2">Chưa thiết lập</Typography>
                      )}
                    </Box>
                  </Box>
                  <Box className="rounded-lg border border-slate-200 bg-white p-3">
                    <Typography variant="body2" color="text.secondary">
                      Ngày tạo
                    </Typography>
                    <Typography variant="body1">
                      {formatDateTime(vendorDetail.createdAt)}
                    </Typography>
                  </Box>
                  <Box className="rounded-lg border border-slate-200 bg-white p-3">
                    <Typography variant="body2" color="text.secondary">
                      Cập nhật gần nhất
                    </Typography>
                    <Typography variant="body1">
                      {formatDateTime(vendorDetail.updatedAt)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Branches */}
            <Typography variant="h6" className="mb-3 font-semibold">
              Chi nhánh ({branches.length})
            </Typography>
            {branches.map((branch, index) => {
              const licenseUrls = branch.licenseUrls ?? [];

              return (
                <Card
                  key={branch.branchId}
                  className="mb-3 border border-slate-200 shadow-sm"
                >
                  <CardContent>
                    <Box className="mb-3 flex items-start justify-between">
                      <Typography variant="h6" className="font-semibold">
                        Chi nhánh #{index + 1}: {branch.name}
                      </Typography>
                      <Box className="flex items-center gap-2">
                        {branch.tierName && (
                          <Chip
                            label={`Tier ${branch.tierName}`}
                            size="small"
                            className="border border-blue-200 bg-blue-50 font-semibold text-blue-700"
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
                          <Typography variant="body2">
                            {branch.email}
                          </Typography>
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

                      {/* Branch Timeline */}
                      <Box>
                        <Typography
                          variant="subtitle2"
                          className="mb-2 font-semibold"
                        >
                          Thời gian
                        </Typography>
                        <Typography variant="body2">
                          Tạo: {formatDateTime(branch.createdAt)}
                        </Typography>
                        <Typography variant="body2">
                          Cập nhật: {formatDateTime(branch.updatedAt)}
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
                            className={
                              branch.isActive
                                ? 'border border-emerald-200 bg-emerald-50 font-semibold text-emerald-700'
                                : 'border border-slate-200 bg-slate-100 font-semibold text-slate-700'
                            }
                          />
                          <Chip
                            label={
                              branch.isSubscribed
                                ? 'Đã đăng ký'
                                : 'Chưa đăng ký'
                            }
                            size="small"
                            className={
                              branch.isSubscribed
                                ? 'border border-sky-200 bg-sky-50 font-semibold text-sky-700'
                                : 'border border-slate-200 bg-slate-100 font-semibold text-slate-700'
                            }
                          />
                          {branch.daysRemaining !== null &&
                            branch.daysRemaining !== undefined && (
                              <Chip
                                label={`Còn ${branch.daysRemaining} ngày`}
                                size="small"
                                className="border border-amber-200 bg-amber-50 font-semibold text-amber-700"
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
                          Hết hạn:{' '}
                          {formatDateTime(branch.subscriptionExpiresAt)}
                        </Typography>
                        <Typography variant="body2">
                          Người duyệt: {branch.verifiedByUserName ?? '-'}
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
                      <Box className="md:col-span-2">
                        <Typography
                          variant="subtitle2"
                          className="mb-2 font-semibold"
                        >
                          Giấy phép kinh doanh
                        </Typography>
                        <Box className="mb-2 flex gap-2">
                          {getLicenseStatusChip(branch.licenseStatus)}
                        </Box>
                        {licenseUrls.length > 0 ? (
                          <Box className="mt-2 flex flex-wrap gap-2">
                            {licenseUrls.map((url, idx) => (
                              <Box
                                key={idx}
                                className="overflow-hidden rounded-lg border border-slate-200 bg-white"
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
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Chưa có hình giấy phép.
                          </Typography>
                        )}
                        <Typography variant="body2" className="mt-2">
                          Lý do từ chối: {branch.licenseRejectReason ?? '-'}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
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
