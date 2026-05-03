import type { BranchRegisterRequest } from '@features/moderator/types/branch';
import AppModalHeader from '@components/AppModalHeader';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import MapLocationPicker from '@features/vendor/components/MapLocationPicker';
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
  onVerify?: (registration: BranchRegisterRequest) => Promise<void> | void;
  onReject?: (registration: BranchRegisterRequest) => void;
}

export default function VendorRegistrationDetails({
  isOpen,
  onClose,
  registration,
  title,
  vendorDetail,
  onVerify,
  onReject,
}: VendorRegistrationDetailsProps): JSX.Element | null {
  if (!isOpen || !registration) return null;

  const { branch } = registration;
  const owner = vendorDetail?.vendorOwner ?? null;
  const ownerFullName = owner
    ? `${owner.firstName} ${owner.lastName}`.trim()
    : '';
  const isReviewerSharedDetail = title === 'Chi tiết quán reviewer chia sẻ';
  const isOwnershipRequestDetail = title === 'Chi tiết yêu cầu sở hữu quán';
  const shouldAlwaysShowContactSection =
    isReviewerSharedDetail || isOwnershipRequestDetail;

  const contactInfo = isReviewerSharedDetail
    ? {
        sectionTitle: 'Thông tin người chia sẻ',
        shopNameLabel: '',
        shopNameValue: '',
        nameLabel: 'Tên người chia sẻ',
        nameValue:
          branch.userShareName ??
          registration.userShareName ??
          branch.user?.username ??
          '-',
        emailValue:
          branch.userShareEmail ??
          registration.userShareEmail ??
          branch.user?.email ??
          '-',
        phoneValue:
          branch.userSharePhone ??
          registration.userSharePhone ??
          branch.user?.phoneNumber ??
          '-',
        avatarUrl: null,
      }
    : isOwnershipRequestDetail
      ? {
          sectionTitle: 'Thông tin người yêu cầu sở hữu',
          shopNameLabel: 'Tên cửa hàng',
          shopNameValue: registration.vendorName ?? branch.vendorName ?? '',
          nameLabel: 'Tên người yêu cầu sở hữu',
          nameValue:
            branch.vendorUserName ??
            registration.vendorUserName ??
            branch.user?.username ??
            '-',
          emailValue:
            branch.vendorUserEmail ??
            registration.vendorUserEmail ??
            branch.user?.email ??
            '-',
          phoneValue:
            branch.vendorUserPhone ??
            registration.vendorUserPhone ??
            branch.user?.phoneNumber ??
            '-',
          avatarUrl: null,
        }
      : {
          sectionTitle: 'Thông tin người bán',
          shopNameLabel: 'Tên cửa hàng',
          shopNameValue: vendorDetail?.name ?? '',
          nameLabel: 'Tên chủ cửa hàng',
          nameValue: ownerFullName,
          emailValue: owner?.email ?? '',
          phoneValue: owner?.phoneNumber ?? '',
          avatarUrl: owner?.avatarUrl ?? null,
        };

  const hasValue = (value?: string | null): boolean => {
    if (value === null || value === undefined) return false;
    return value.trim().length > 0;
  };

  const formatDate = (date: string | null): string => {
    if (!date) return '';
    return new Date(date).toLocaleString('vi-VN');
  };

  const infoRows: { label: string; value: string }[] = [
    // {
    //   label: 'Mã yêu cầu',
    //   value: String(registration.branchRequestId),
    // },
    // { label: 'Mã chi nhánh', value: String(registration.branchId) },
    // ...(registration.rejectReason
    //   ? [{ label: 'Lý do từ chối', value: registration.rejectReason }]
    //   : []),
    { label: 'Ngày tạo yêu cầu', value: formatDate(registration.createdAt) },
    {
      label: 'Ngày cập nhật yêu cầu',
      value: formatDate(registration.updatedAt),
    },
  ];

  const branchRows: { label: string; value: string }[] = [
    { label: 'Tên chi nhánh', value: branch.name },
    { label: 'Email', value: branch.email ?? '' },
    { label: 'Số điện thoại', value: branch.phoneNumber ?? '' },
    { label: 'Địa chỉ chi tiết', value: branch.addressDetail },
    { label: 'Phường/Xã', value: branch.ward },
    { label: 'Thành phố', value: branch.city },
    // { label: 'Vĩ độ', value: String(branch.lat) },
    // { label: 'Kinh độ', value: String(branch.long) },
    { label: 'Đã xác minh', value: branch.isVerified ? 'Có' : 'Chưa' },
    { label: 'Đang hoạt động', value: branch.isActive ? 'Có' : 'Không' },
    { label: 'Đã đăng ký gói', value: branch.isSubscribed ? 'Có' : 'Không' },
    // { label: 'Ngày tạo', value: formatDate(branch.createdAt) },
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

  const handleVerifyClick = (): void => {
    if (!onVerify) return;
    void onVerify(registration);
  };

  const handleRejectClick = (): void => {
    if (!onReject) return;
    onReject(registration);
  };

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
          {/* Contact Info */}
          {(shouldAlwaysShowContactSection ||
            hasValue(contactInfo.nameValue) ||
            hasValue(contactInfo.emailValue) ||
            hasValue(contactInfo.phoneValue) ||
            hasValue(contactInfo.shopNameValue) ||
            Boolean(contactInfo.avatarUrl)) && (
            <>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold tracking-wider text-gray-800 uppercase">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                {contactInfo.sectionTitle}
              </h3>
              <div className="mb-6 overflow-hidden rounded-xl border border-gray-100 shadow-sm">
                <table className="w-full text-sm">
                  <tbody>
                    {contactInfo.avatarUrl ? (
                      <tr className="bg-slate-50/70">
                        <td className="w-1/3 px-4 py-3 text-xs font-bold tracking-wide text-[var(--color-table-text-secondary)] uppercase">
                          Ảnh đại diện
                        </td>
                        <td className="px-4 py-3">
                          <img
                            src={contactInfo.avatarUrl}
                            alt="avatar"
                            className="h-11 w-11 rounded-full border border-gray-200 object-cover"
                          />
                        </td>
                      </tr>
                    ) : null}
                    {hasValue(contactInfo.shopNameValue) &&
                    hasValue(contactInfo.shopNameLabel) ? (
                      <tr className="bg-white">
                        <td className="w-1/3 px-4 py-3 text-xs font-bold tracking-wide text-[var(--color-table-text-secondary)] uppercase">
                          {contactInfo.shopNameLabel}
                        </td>
                        <td className="px-4 py-3 font-medium text-[var(--color-table-text-primary)]">
                          {contactInfo.shopNameValue}
                        </td>
                      </tr>
                    ) : null}
                    {hasValue(contactInfo.nameValue) ? (
                      <tr className="bg-slate-50/70">
                        <td className="w-1/3 px-4 py-3 text-xs font-bold tracking-wide text-[var(--color-table-text-secondary)] uppercase">
                          {contactInfo.nameLabel}
                        </td>
                        <td className="px-4 py-3 font-medium text-[var(--color-table-text-primary)]">
                          {contactInfo.nameValue}
                        </td>
                      </tr>
                    ) : null}
                    {hasValue(contactInfo.emailValue) ? (
                      <tr className="bg-white">
                        <td className="w-1/3 px-4 py-3 text-xs font-bold tracking-wide text-[var(--color-table-text-secondary)] uppercase">
                          Email
                        </td>
                        <td className="px-4 py-3 font-medium text-[var(--color-table-text-primary)]">
                          {contactInfo.emailValue}
                        </td>
                      </tr>
                    ) : null}
                    {hasValue(contactInfo.phoneValue) ? (
                      <tr className="bg-slate-50/70">
                        <td className="w-1/3 px-4 py-3 text-xs font-bold tracking-wide text-[var(--color-table-text-secondary)] uppercase">
                          Số điện thoại
                        </td>
                        <td className="px-4 py-3 font-medium text-[var(--color-table-text-primary)]">
                          {contactInfo.phoneValue}
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

          {/* Map Info */}
          {branch.lat != null && branch.long != null && (
            <>
              <h3 className="mt-6 mb-3 flex items-center gap-2 text-sm font-bold tracking-wider text-gray-800 uppercase">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                Vị trí trên bản đồ
              </h3>
              <div className="overflow-hidden rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                <div className="pointer-events-none">
                  <MapLocationPicker
                    address={branch.addressDetail ?? ''}
                    latitude={branch.lat}
                    longitude={branch.long}
                    onLocationChange={() => {}}
                    hideWarnings={true}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Tọa độ: {branch.lat.toFixed(6)}, {branch.long.toFixed(6)}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/60 px-6 py-4 sm:px-8">
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-[var(--color-table-text-secondary)] transition-colors hover:bg-gray-100"
          >
            Đóng
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRejectClick}
              type="button"
              className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 font-semibold text-rose-700 transition-colors hover:bg-rose-100"
            >
              Từ chối
            </button>
            <button
              onClick={handleVerifyClick}
              type="button"
              className="rounded-lg border border-emerald-200 bg-emerald-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-emerald-600"
            >
              Duyệt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
