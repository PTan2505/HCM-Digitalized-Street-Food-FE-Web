import type { BranchRegisterRequest } from '@features/moderator/types/branch';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import type { JSX } from 'react';

interface VendorOwnerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string | null;
}

interface VendorRegistrationDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  registration: BranchRegisterRequest | null;
  vendorDetail?: { name: string; vendorOwner: VendorOwnerInfo } | null;
}

export default function VendorRegistrationDetails({
  isOpen,
  onClose,
  registration,
  vendorDetail,
}: VendorRegistrationDetailsProps): JSX.Element | null {
  if (!isOpen || !registration) return null;

  const { branch } = registration;
  const owner = vendorDetail?.vendorOwner ?? null;

  const formatDate = (date: string | null): string => {
    if (!date) return '-';
    return new Date(date).toLocaleString('vi-VN');
  };

  const infoRows: { label: string; value: string }[] = [
    {
      label: 'Mã yêu cầu',
      value: String(registration.branchRequestId),
    },
    { label: 'Mã chi nhánh', value: String(registration.branchId) },
    ...(registration.rejectReason
      ? [{ label: 'Lý do từ chối', value: registration.rejectReason }]
      : []),
    { label: 'Ngày tạo yêu cầu', value: formatDate(registration.createdAt) },
    {
      label: 'Ngày cập nhật yêu cầu',
      value: formatDate(registration.updatedAt),
    },
  ];

  const branchRows: { label: string; value: string }[] = [
    { label: 'Tên chi nhánh', value: branch.name },
    { label: 'Email', value: branch.email },
    { label: 'Số điện thoại', value: branch.phoneNumber },
    { label: 'Địa chỉ chi tiết', value: branch.addressDetail },
    { label: 'Phường/Xã', value: branch.ward },
    { label: 'Thành phố', value: branch.city },
    { label: 'Vĩ độ', value: String(branch.lat) },
    { label: 'Kinh độ', value: String(branch.long) },
    { label: 'Đã xác minh', value: branch.isVerified ? 'Có' : 'Chưa' },
    { label: 'Đang hoạt động', value: branch.isActive ? 'Có' : 'Không' },
    { label: 'Đã đăng ký gói', value: branch.isSubscribed ? 'Có' : 'Không' },
    { label: 'Ngày tạo', value: formatDate(branch.createdAt) },
  ];

  const renderTable = (
    rows: { label: string; value: string }[],
    className = ''
  ): JSX.Element => (
    <div
      className={`overflow-hidden rounded-lg border border-gray-200 ${className}`}
    >
      <table className="w-full text-sm">
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.label}
              className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
            >
              <td className="w-1/3 px-4 py-2.5 font-medium text-[var(--color-table-text-secondary)]">
                {row.label}
              </td>
              <td className="px-4 py-2.5 text-[var(--color-table-text-primary)]">
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-2xl rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-[var(--color-table-text-primary)]">
            Chi tiết yêu cầu đăng ký chi nhánh hoặc quán ăn do reviewer chia sẻ
            hoặc yêu cầu sỡ hữu quán
          </h2>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
          {/* Vendor + Owner Info */}
          {vendorDetail && owner && (
            <>
              <h3 className="mb-3 text-base font-semibold text-[var(--color-table-text-primary)]">
                Thông tin người bán
              </h3>
              <div className="mb-6 overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="bg-gray-50">
                      <td className="w-1/3 px-4 py-2.5 font-medium text-[var(--color-table-text-secondary)]">
                        Ảnh đại diện
                      </td>
                      <td className="px-4 py-2.5">
                        {owner.avatarUrl ? (
                          <img
                            src={owner.avatarUrl}
                            alt="avatar"
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-[var(--color-table-text-secondary)]">
                            -
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr className="bg-white">
                      <td className="w-1/3 px-4 py-2.5 font-medium text-[var(--color-table-text-secondary)]">
                        Tên cửa hàng
                      </td>
                      <td className="px-4 py-2.5 text-[var(--color-table-text-primary)]">
                        {vendorDetail.name}
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="w-1/3 px-4 py-2.5 font-medium text-[var(--color-table-text-secondary)]">
                        Tên chủ cửa hàng
                      </td>
                      <td className="px-4 py-2.5 text-[var(--color-table-text-primary)]">
                        {`${owner.firstName} ${owner.lastName}`.trim()}
                      </td>
                    </tr>
                    <tr className="bg-white">
                      <td className="w-1/3 px-4 py-2.5 font-medium text-[var(--color-table-text-secondary)]">
                        Email
                      </td>
                      <td className="px-4 py-2.5 text-[var(--color-table-text-primary)]">
                        {owner.email || '-'}
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="w-1/3 px-4 py-2.5 font-medium text-[var(--color-table-text-secondary)]">
                        Số điện thoại
                      </td>
                      <td className="px-4 py-2.5 text-[var(--color-table-text-primary)]">
                        {owner.phoneNumber || '-'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Registration Info */}
          <h3 className="mb-3 text-base font-semibold text-[var(--color-table-text-primary)]">
            Thông tin yêu cầu
          </h3>
          {renderTable(infoRows, 'mb-6')}

          {/* Branch Info */}
          <h3 className="mb-3 text-base font-semibold text-[var(--color-table-text-primary)]">
            Thông tin chi nhánh
          </h3>
          {renderTable(branchRows)}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg px-4 py-2 text-[var(--color-table-text-secondary)] transition-colors hover:bg-gray-100"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
