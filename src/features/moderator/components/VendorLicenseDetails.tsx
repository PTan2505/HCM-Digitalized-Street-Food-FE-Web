import type { JSX } from 'react';
import type { BranchRegisterRequest } from '@features/moderator/types/branch';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

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

  const apiBase = import.meta.env.VITE_API_URL as string;
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-3xl rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-[var(--color-table-text-primary)]">
            Giấy phép kinh doanh
          </h2>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>

        {/* Modal Content */}
        <div className="max-h-[75vh] overflow-y-auto px-6 py-4">
          {urls.length === 0 ? (
            <p className="py-8 text-center text-[var(--color-table-text-secondary)]">
              Không có giấy phép nào được tải lên
            </p>
          ) : (
            <div className="space-y-4">
              {urls.map((url, i) => {
                const fullUrl = toFullUrl(url);
                return (
                  <div
                    key={i}
                    className="overflow-hidden rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center justify-between bg-gray-50 px-4 py-2">
                      <span className="text-sm font-medium text-[var(--color-table-text-primary)]">
                        Giấy phép {urls.length > 1 ? i + 1 : ''}
                      </span>
                      <a
                        href={fullUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Mở trong tab mới
                      </a>
                    </div>
                    <div className="flex items-center justify-center bg-white p-4">
                      {isImage(url) ? (
                        <img
                          src={fullUrl}
                          alt={`Giấy phép ${i + 1}`}
                          className="max-h-[500px] max-w-full rounded object-contain"
                        />
                      ) : (
                        <iframe
                          src={fullUrl}
                          title={`Giấy phép ${i + 1}`}
                          className="h-[500px] w-full rounded border-0"
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
