import type { BranchRegisterRequest } from '@features/moderator/types/branch';
import AppModalHeader from '@components/AppModalHeader';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
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
  title?: string;
  vendorDetail?: { name: string; vendorOwner: VendorOwnerInfo } | null;
}

export default function VendorRegistrationDetails({
  isOpen,
  onClose,
  registration,
  title,
  vendorDetail,
}: VendorRegistrationDetailsProps): JSX.Element | null {
  if (!isOpen || !registration) return null;

  const { branch } = registration;
  const owner = vendorDetail?.vendorOwner ?? null;
  const ownerFullName = owner
    ? `${owner.firstName} ${owner.lastName}`.trim()
    : '';

  const hasValue = (value?: string | null): boolean => {
    if (value === null || value === undefined) return false;
    return value.trim().length > 0;
  };

  const formatDate = (date: string | null): string => {
    if (!date) return '';
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
      className={`overflow-hidden rounded-xl border border-gray-100 shadow-sm ${className}`}
    >
      <table className="w-full text-sm">
        <tbody>
          {rows
            .filter((row) => hasValue(row.value))
            .map((row, i) => (
              <tr
                key={row.label}
                className={i % 2 === 0 ? 'bg-slate-50/70' : 'bg-white'}
              >
                <td className="w-1/3 px-4 py-3 text-xs font-bold tracking-wide text-[var(--color-table-text-secondary)] uppercase">
                  {row.label}
                </td>
                <td className="px-4 py-3 font-medium text-[var(--color-table-text-primary)]">
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity"
      onClick={onClose}
    >
      <div
        className="mx-4 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <AppModalHeader
          title={title ?? 'Chi tiết yêu cầu đăng ký chi nhánh'}
          subtitle={branch.name}
          icon={<AssignmentIndOutlinedIcon />}
          onClose={onClose}
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 sm:px-8">
          {/* Vendor + Owner Info */}
          {vendorDetail && owner && (
            <>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold tracking-wider text-gray-800 uppercase">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                Thông tin người bán
              </h3>
              <div className="mb-6 overflow-hidden rounded-xl border border-gray-100 shadow-sm">
                <table className="w-full text-sm">
                  <tbody>
                    {owner.avatarUrl ? (
                      <tr className="bg-slate-50/70">
                        <td className="w-1/3 px-4 py-3 text-xs font-bold tracking-wide text-[var(--color-table-text-secondary)] uppercase">
                          Ảnh đại diện
                        </td>
                        <td className="px-4 py-3">
                          <img
                            src={owner.avatarUrl}
                            alt="avatar"
                            className="h-11 w-11 rounded-full border border-gray-200 object-cover"
                          />
                        </td>
                      </tr>
                    ) : null}
                    {hasValue(vendorDetail.name) ? (
                      <tr className="bg-white">
                        <td className="w-1/3 px-4 py-3 text-xs font-bold tracking-wide text-[var(--color-table-text-secondary)] uppercase">
                          Tên cửa hàng
                        </td>
                        <td className="px-4 py-3 font-medium text-[var(--color-table-text-primary)]">
                          {vendorDetail.name}
                        </td>
                      </tr>
                    ) : null}
                    {hasValue(ownerFullName) ? (
                      <tr className="bg-slate-50/70">
                        <td className="w-1/3 px-4 py-3 text-xs font-bold tracking-wide text-[var(--color-table-text-secondary)] uppercase">
                          Tên chủ cửa hàng
                        </td>
                        <td className="px-4 py-3 font-medium text-[var(--color-table-text-primary)]">
                          {ownerFullName}
                        </td>
                      </tr>
                    ) : null}
                    {hasValue(owner.email) ? (
                      <tr className="bg-white">
                        <td className="w-1/3 px-4 py-3 text-xs font-bold tracking-wide text-[var(--color-table-text-secondary)] uppercase">
                          Email
                        </td>
                        <td className="px-4 py-3 font-medium text-[var(--color-table-text-primary)]">
                          {owner.email}
                        </td>
                      </tr>
                    ) : null}
                    {hasValue(owner.phoneNumber) ? (
                      <tr className="bg-slate-50/70">
                        <td className="w-1/3 px-4 py-3 text-xs font-bold tracking-wide text-[var(--color-table-text-secondary)] uppercase">
                          Số điện thoại
                        </td>
                        <td className="px-4 py-3 font-medium text-[var(--color-table-text-primary)]">
                          {owner.phoneNumber}
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Registration Info */}
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold tracking-wider text-gray-800 uppercase">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
            Thông tin yêu cầu
          </h3>
          {renderTable(infoRows, 'mb-6')}

          {/* Branch Info */}
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold tracking-wider text-gray-800 uppercase">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Thông tin chi nhánh
          </h3>
          {renderTable(branchRows)}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-gray-100 bg-gray-50/60 px-6 py-4 sm:px-8">
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-[var(--color-table-text-secondary)] transition-colors hover:bg-gray-100"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
