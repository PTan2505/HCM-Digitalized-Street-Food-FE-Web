import type { JSX } from 'react';
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import type { CheckLicenseStatusResponse } from '@features/vendor/types/vendor';

// ─── Helpers ─────────────────────────────────────────────────────────
function resolveImageUrl(url: string): string {
  const apiBase = import.meta.env.VITE_API_URL as string;
  const origin = apiBase.replace(/\/api$/, '');
  return url.startsWith('http') ? url : `${origin}${url}`;
}

interface StatusMeta {
  label: string;
  color: string;
  bgColor: string;
  icon: JSX.Element;
}

function getStatusMeta(status: string): StatusMeta {
  switch (status) {
    case 'Accept':
      return {
        label: 'Đã duyệt',
        color: 'text-green-700',
        bgColor: 'bg-green-50 border-green-200',
        icon: <CheckCircleIcon className="h-6 w-6 text-green-500" />,
      };
    case 'Reject':
      return {
        label:
          'Bị từ chối (VUI LÒNG CẬP NHẬT LẠI THÔNG TIN (HOẶC) VÀ GIẤY PHÉP BÊN DƯỚI THEO YÊU CẦU)',
        color: 'text-red-700',
        bgColor: 'bg-red-50 border-red-200',
        icon: <XCircleIcon className="h-6 w-6 text-red-500" />,
      };
    case 'Pending':
    default:
      return {
        label:
          'Đang chờ duyệt (NẾU BẠN MUỐN TẠO THÊM CHI NHÁNH, VUI LÒNG CHỜ ĐẾN KHI ĐƠN ĐĂNG KÝ NÀY ĐƯỢC HỆ THỐNG DUYỆT)',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-50 border-yellow-200',
        icon: <ClockIcon className="h-6 w-6 text-yellow-500" />,
      };
  }
}

// ─── License images gallery (shared) ─────────────────────────────────
function LicenseImagesGallery({ urls }: { urls: string[] }): JSX.Element {
  return (
    <div className="mt-3 pl-9">
      <p className="mb-2 text-sm font-medium text-gray-700">
        Ảnh giấy phép đã nộp:
      </p>
      <div className="flex flex-wrap gap-3">
        {urls.map((url, index) => {
          const fullUrl = resolveImageUrl(url);
          return (
            <figure key={index} className="group mx-auto my-2">
              <div className="overflow-hidden rounded-lg shadow-md">
                <a href={fullUrl} target="_blank" rel="noopener noreferrer">
                  <img
                    src={fullUrl}
                    alt={`Ảnh ${index + 1}`}
                    className="block h-auto max-h-64 w-full max-w-xs transition-transform duration-700 group-hover:scale-105"
                  />
                </a>
              </div>
              <figcaption className="border-t border-gray-200 bg-transparent px-4 py-3 text-center text-sm text-gray-500 italic">
                Ảnh {index + 1}
              </figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────
interface LicenseStatusBannerProps {
  data: CheckLicenseStatusResponse;
}

export default function LicenseStatusBanner({
  data,
}: LicenseStatusBannerProps): JSX.Element {
  const statusInfo = getStatusMeta(data.status);
  const submittedDate = new Date(data.submittedAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className={`mb-8 rounded-2xl border-2 p-6 ${statusInfo.bgColor}`}>
      <div className="flex items-center gap-3">
        {statusInfo.icon}
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Trạng thái đơn đăng ký
          </h3>
          <p className={`text-sm font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            Ngày nộp: {submittedDate}
          </p>
        </div>
      </div>

      {data.rejectReason && data.status === 'Reject' && (
        <div className="mt-3 pl-9">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Lý do từ chối:</span>{' '}
            <span className="font-semibold text-red-700">
              {data.rejectReason}
            </span>
          </p>
        </div>
      )}

      {data.licenseUrls && data.licenseUrls.length > 0 && (
        <LicenseImagesGallery urls={data.licenseUrls} />
      )}
    </div>
  );
}
