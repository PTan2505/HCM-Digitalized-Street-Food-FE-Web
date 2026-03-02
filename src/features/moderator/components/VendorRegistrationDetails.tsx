import type { JSX } from 'react';
import type { BranchRegisterRequest } from '@features/moderator/types/branch';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

interface VendorRegistrationDetailsProps {
    isOpen: boolean;
    onClose: () => void;
    registration: BranchRegisterRequest | null;
}

export default function VendorRegistrationDetails({
    isOpen,
    onClose,
    registration,
}: VendorRegistrationDetailsProps): JSX.Element | null {
    if (!isOpen || !registration) return null;

    const { branch } = registration;

    // const getStatusLabel = (status: number): string => {
    //     const map: Record<number, string> = {
    //         0: 'Chờ duyệt',
    //         1: 'Đã xác minh',
    //         2: 'Từ chối',
    //     };
    //     return map[status] ?? String(status);
    // };

    // const getStatusColor = (status: number): string => {
    //     const map: Record<number, string> = {
    //         0: 'bg-yellow-100 text-yellow-800',
    //         1: 'bg-green-100 text-green-800',
    //         2: 'bg-red-100 text-red-800',
    //     };
    //     return map[status] ?? 'bg-gray-100 text-gray-800';
    // };

    const formatDate = (date: string | null): string => {
        if (!date) return '-';
        return new Date(date).toLocaleString('vi-VN');
    };

    const infoRows: { label: string; value: string | JSX.Element }[] = [
        { label: 'Mã yêu cầu', value: String(registration.branchRegisterRequestId) },
        { label: 'Mã chi nhánh', value: String(registration.branchId) },
        // {
        //     label: 'Trạng thái',
        //     value: (
        //         <span
        //             className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(registration.status)}`}
        //         >
        //             {getStatusLabel(registration.status)}
        //         </span>
        //     ),
        // },
        ...(registration.rejectReason
            ? [{ label: 'Lý do từ chối', value: registration.rejectReason }]
            : []),
        { label: 'Ngày tạo yêu cầu', value: formatDate(registration.createdAt) },
        { label: 'Ngày cập nhật yêu cầu', value: formatDate(registration.updatedAt) },
    ];

    const branchRows: { label: string; value: string }[] = [
        { label: 'Tên chi nhánh', value: branch.name },
        { label: 'Email', value: branch.email },
        { label: 'Số điện thoại', value: branch.phoneNumber },
        { label: 'Địa chỉ chi tiết', value: branch.addressDetail },
        { label: 'Tòa nhà', value: branch.buildingName },
        { label: 'Phường/Xã', value: branch.ward },
        { label: 'Thành phố', value: branch.city },
        { label: 'Vĩ độ', value: String(branch.lat) },
        { label: 'Kinh độ', value: String(branch.long) },
        // { label: 'Đánh giá TB', value: String(branch.avgRating) },
        { label: 'Đã xác minh', value: branch.isVerified ? 'Có' : 'Chưa' },
        { label: 'Đang hoạt động', value: branch.isActive ? 'Có' : 'Không' },
        { label: 'Đã đăng ký gói', value: branch.isSubscribed ? 'Có' : 'Không' },
        { label: 'Ngày tạo', value: formatDate(branch.createdAt) },
    ];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={onClose}
        >
            <div
                className="mx-4 w-full max-w-2xl rounded-lg bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <h2 className="text-xl font-bold text-[var(--color-table-text-primary)]">
                        Chi tiết yêu cầu đăng ký
                    </h2>
                    <IconButton size="small" onClick={onClose}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </div>

                {/* Modal Content */}
                <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
                    {/* Registration Info */}
                    <h3 className="mb-3 text-base font-semibold text-[var(--color-table-text-primary)]">
                        Thông tin yêu cầu
                    </h3>
                    <div className="mb-6 overflow-hidden rounded-lg border border-gray-200">
                        <table className="w-full text-sm">
                            <tbody>
                                {infoRows.map((row, i) => (
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

                    {/* Branch Info */}
                    <h3 className="mb-3 text-base font-semibold text-[var(--color-table-text-primary)]">
                        Thông tin chi nhánh
                    </h3>
                    <div className="overflow-hidden rounded-lg border border-gray-200">
                        <table className="w-full text-sm">
                            <tbody>
                                {branchRows.map((row, i) => (
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
                </div>

                {/* Modal Actions */}
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
