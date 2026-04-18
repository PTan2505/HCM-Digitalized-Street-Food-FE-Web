import type { JSX } from 'react';
import type { BranchRegisterRequest } from '@features/moderator/types/branch';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import { ENV } from '@config/env';

interface VendorLicenseDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  registration: BranchRegisterRequest | null;
}

export default function VendorLicenseDetails({
  isOpen,
  onClose,
  registration,
}: VendorLicenseDetailsProps): JSX.Element | null {
  if (!isOpen || !registration) return null;

  const apiBase = ENV.api.baseUrl;
  const origin = apiBase.replace(/\/api$/, '');

  const toFullUrl = (url: string): string =>
    url.startsWith('http://') || url.startsWith('https://')
      ? url
      : `${origin}${url}`;

  const urls: string[] = ((): string[] => {
    const { licenseUrl } = registration;
    if (Array.isArray(licenseUrl)) return licenseUrl as unknown as string[];
    if (typeof licenseUrl === 'string') {
      try {
        const parsed: unknown = JSON.parse(licenseUrl);
        if (Array.isArray(parsed)) return parsed as string[];
      } catch {
        // plain string url
      }
      return [licenseUrl];
    }
    return [];
  })();

  const isImage = (url: string): boolean => {
    const ext = url.split('.').pop()?.toLowerCase() ?? '';
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity"
      onClick={onClose}
    >
      <div
        className="mx-4 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/70 px-6 py-5 sm:px-8">
          <h2 className="text-lg font-bold text-[var(--color-table-text-primary)] sm:text-xl">
            Giấy phép kinh doanh
          </h2>
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
        <div className="flex-1 overflow-y-auto px-6 py-5 sm:px-8">
          {urls.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-10 text-center text-sm text-[var(--color-table-text-secondary)]">
              Không có giấy phép nào được tải lên
            </div>
          ) : (
            <div className="space-y-4">
              {urls.map((url, i) => {
                const fullUrl = toFullUrl(url);
                return (
                  <div
                    key={`${fullUrl}-${i}`}
                    className="overflow-hidden rounded-xl border border-gray-100 shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 bg-slate-50/80 px-4 py-2.5">
                      <span className="text-sm font-semibold text-[var(--color-table-text-primary)]">
                        Giấy phép {urls.length > 1 ? i + 1 : ''}
                      </span>
                      <a
                        href={fullUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-800 hover:underline"
                      >
                        Mở trong tab mới
                      </a>
                    </div>
                    <div className="flex items-center justify-center bg-slate-50/40 p-4">
                      {isImage(url) ? (
                        <img
                          src={fullUrl}
                          alt={`Giấy phép ${i + 1}`}
                          className="max-h-[500px] max-w-full rounded-lg border border-gray-100 bg-white object-contain"
                        />
                      ) : (
                        <iframe
                          src={fullUrl}
                          title={`Giấy phép ${i + 1}`}
                          className="h-[500px] w-full rounded-lg border-0 bg-white"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Actions */}
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
