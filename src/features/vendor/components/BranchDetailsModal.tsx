import React, { useState } from 'react';
import type { JSX } from 'react';
import type { Branch } from '@features/vendor/types/vendor';
import CloseIcon from '@mui/icons-material/Close';
import PaymentIcon from '@mui/icons-material/Payment';
import IconButton from '@mui/material/IconButton';
import { Button, CircularProgress, Snackbar, Alert } from '@mui/material';
import usePayment from '@features/vendor/hooks/usePayment';

interface BranchDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: Branch | null;
}

interface InfoFieldProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

const InfoField = ({
  label,
  value,
  className = '',
}: InfoFieldProps): JSX.Element => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <span className="text-[11px] font-bold tracking-wider text-[var(--color-table-text-secondary)] uppercase opacity-80">
      {label}
    </span>
    <span className="text-sm font-semibold text-[var(--color-table-text-primary)]">
      {value ?? '-'}
    </span>
  </div>
);

const StatusBadge = ({
  label,
  type,
}: {
  label: string;
  type: 'success' | 'error' | 'warning' | 'default';
}): JSX.Element => {
  const colors = {
    success: 'bg-green-100 text-green-700 border-green-200',
    error: 'bg-red-100 text-red-700 border-red-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    default: 'bg-slate-100 text-slate-700 border-slate-200',
  };
  return (
    <span
      className={`inline-flex min-w-[110px] flex-shrink-0 items-center justify-center rounded-full border px-3 py-1 text-xs font-bold shadow-sm ${colors[type]}`}
    >
      {label}
    </span>
  );
};

export default function BranchDetailsModal({
  isOpen,
  onClose,
  branch,
}: BranchDetailsModalProps): JSX.Element | null {
  const { onCreatePaymentLink } = usePayment();
  const [paying, setPaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !branch) return null;

  const handlePayment = async (): Promise<void> => {
    setPaying(true);
    try {
      const res = await onCreatePaymentLink({ branchId: branch.branchId });
      if (res.success && res.paymentUrl) {
        window.location.href = res.paymentUrl;
      } else {
        setErrorMsg('Không thể tạo link thanh toán. Vui lòng thử lại.');
      }
    } catch {
      setErrorMsg('Đã xảy ra lỗi khi tạo link thanh toán.');
    } finally {
      setPaying(false);
    }
  };

  const formatDate = (date: string | null): string => {
    if (!date) return '-';
    return new Date(date).toLocaleString('vi-VN');
  };

  const getLicenseStatusLabel = (status: string | null): string => {
    if (!status) return '-';
    // Xử lý không phân biệt hoa thường và bao gồm cả trường hợp Accept/Reject
    const s = status.toLowerCase();
    if (['pending'].includes(s)) return 'Chờ duyệt';
    if (['approved', 'accept'].includes(s)) return 'Đã duyệt';
    if (['rejected', 'reject'].includes(s)) return 'Từ chối';
    return status;
  };

  const getLicenseStatusColor = (
    status: string | null
  ): 'default' | 'warning' | 'success' | 'error' => {
    if (!status) return 'default';
    const s = status.toLowerCase();
    if (['pending'].includes(s)) return 'warning';
    if (['approved', 'accept'].includes(s)) return 'success';
    if (['rejected', 'reject'].includes(s)) return 'error';
    return 'default';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="mx-4 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-8 py-5">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-table-text-primary)] md:text-2xl">
              Chi tiết chi nhánh
            </h2>
            <p className="mt-1 flex items-center gap-2 text-sm font-medium text-[var(--color-table-text-secondary)]">
              <span className="rounded-md bg-gray-200 px-2 py-0.5 text-xs text-gray-700">
                #{branch.branchId}
              </span>
              {branch.name}
            </p>
          </div>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              bgcolor: 'white',
              border: '1px solid #f3f4f6',
              '&:hover': { bgcolor: '#f3f4f6' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="flex flex-col gap-6">
            {/* Thông tin cơ bản */}
            <div className="rounded-xl border border-gray-100 bg-slate-50/50 p-6 shadow-sm">
              <h3 className="mb-5 flex items-center gap-2 text-sm font-bold tracking-wider text-gray-800 uppercase">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
                Thông tin cơ bản
              </h3>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                <InfoField
                  label="Email"
                  value={branch.email}
                  className="sm:col-span-2 lg:col-span-1"
                />
                <InfoField label="Số điện thoại" value={branch.phoneNumber} />
                <InfoField
                  label="Đánh giá"
                  value={
                    branch.avgRating
                      ? `${branch.avgRating} ⭐`
                      : 'Chưa có đánh giá'
                  }
                />

                <InfoField
                  label="Địa chỉ chi tiết"
                  value={branch.addressDetail}
                  className="sm:col-span-2 lg:col-span-3"
                />

                <InfoField label="Phường/Xã" value={branch.ward} />
                <InfoField label="Thành phố" value={branch.city} />
                <InfoField
                  label="Tọa độ"
                  value={
                    branch.lat && branch.long
                      ? `${branch.lat}, ${branch.long}`
                      : '-'
                  }
                />

                <InfoField
                  label="Ngày tạo"
                  value={formatDate(branch.createdAt)}
                />
                <InfoField
                  label="Cập nhật lần cuối"
                  value={formatDate(branch.updatedAt)}
                />
              </div>
            </div>

            {/* Trạng thái hoạt động */}
            <div className="rounded-xl border border-gray-100 bg-slate-50/50 p-6 shadow-sm">
              <h3 className="mb-5 flex items-center gap-2 text-sm font-bold tracking-wider text-gray-800 uppercase">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500"></span>
                Trạng thái hoạt động
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-lg border border-gray-200/60 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                  <span className="text-sm font-medium text-gray-600">
                    Xác thực hệ thống
                  </span>
                  <StatusBadge
                    label={branch.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                    type={branch.isVerified ? 'success' : 'default'}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200/60 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                  <span className="text-sm font-medium text-gray-600">
                    Trạng thái mở cửa
                  </span>
                  <StatusBadge
                    label={
                      branch.isActive ? 'Đang hoạt động' : 'Ngưng hoạt động'
                    }
                    type={branch.isActive ? 'success' : 'error'}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200/60 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                  <span className="text-sm font-medium text-gray-600">
                    Kiểm duyệt giấy phép
                  </span>
                  <StatusBadge
                    label={getLicenseStatusLabel(branch.licenseStatus)}
                    type={getLicenseStatusColor(branch.licenseStatus)}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200/60 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                  <span className="text-sm font-medium text-gray-600">
                    Gói đăng ký
                  </span>
                  <div className="flex items-center gap-2">
                    {branch.isSubscribed &&
                      branch.daysRemaining !== null &&
                      branch.daysRemaining !== undefined && (
                        <span
                          className={`text-xs font-bold ${branch.daysRemaining <= 7 ? 'text-amber-500' : 'text-gray-400'}`}
                        >
                          Còn {branch.daysRemaining} ngày
                        </span>
                      )}
                    <StatusBadge
                      label={
                        branch.isSubscribed
                          ? 'Đã thanh toán'
                          : 'Chưa thanh toán'
                      }
                      type={branch.isSubscribed ? 'success' : 'error'}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* License Reject Reason */}
            {branch.licenseRejectReason && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-red-700">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-200 pb-[1px] text-xs">
                    !
                  </span>
                  Lý do từ chối giấy phép
                </h3>
                <p className="pl-7 text-sm leading-relaxed font-medium text-red-600">
                  {branch.licenseRejectReason}
                </p>
              </div>
            )}

            {/* License Images */}
            {branch.licenseUrls && branch.licenseUrls.length > 0 && (
              <div className="rounded-xl border border-gray-100 bg-slate-50/50 p-6 shadow-sm">
                <h3 className="mb-5 flex items-center gap-2 text-sm font-bold tracking-wider text-gray-800 uppercase">
                  <span className="h-2.5 w-2.5 rounded-full bg-teal-500"></span>
                  Ảnh giấy phép
                </h3>
                <div className="flex flex-wrap gap-4">
                  {branch.licenseUrls.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-1 shadow-sm transition-all hover:shadow-md"
                    >
                      <img
                        src={url}
                        alt={`Giấy phép ${i + 1}`}
                        className="h-32 w-32 rounded-lg object-cover transition-transform duration-300 group-hover:scale-105 sm:h-40 sm:w-40"
                      />
                      <div className="absolute inset-0 rounded-xl bg-black/0 transition-colors group-hover:bg-black/10" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-8 py-5">
          <div>
            {!branch.isSubscribed && (
              <Button
                onClick={() => {
                  void handlePayment();
                }}
                type="button"
                disabled={paying}
                variant="outlined"
                color="primary"
                startIcon={
                  paying ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : (
                    <PaymentIcon fontSize="small" />
                  )
                }
              >
                Thanh toán
              </Button>
            )}
          </div>
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg px-4 py-2 text-[var(--color-table-text-secondary)] transition-colors hover:bg-gray-100"
          >
            Đóng
          </button>
        </div>
      </div>

      <Snackbar
        open={errorMsg !== null}
        autoHideDuration={4000}
        onClose={() => setErrorMsg(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setErrorMsg(null)}>
          {errorMsg}
        </Alert>
      </Snackbar>
    </div>
  );
}
