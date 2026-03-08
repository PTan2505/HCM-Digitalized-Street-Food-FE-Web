import type { JSX } from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';
import type { GetImagesResponse } from '@features/vendor/types/vendor';

function resolveImageUrl(url: string): string {
  const apiBase = import.meta.env.VITE_API_URL as string;
  const origin = apiBase.replace(/\/api$/, '');
  return url.startsWith('http') ? url : `${origin}${url}`;
}

interface ImageStatusBannerProps {
  data: GetImagesResponse;
}

export default function ImageStatusBanner({
  data,
}: ImageStatusBannerProps): JSX.Element {
  return (
    <div className="mb-8 rounded-2xl border-2 border-blue-200 bg-blue-50 p-6">
      <div className="flex items-center gap-3">
        <PhotoIcon className="h-6 w-6 text-blue-500" />
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Hình ảnh cửa hàng
          </h3>
          <p className="text-sm font-medium text-blue-700">
            Đã tải lên {data.totalCount} ảnh
          </p>
        </div>
      </div>

      {data.items.length > 0 && (
        <div className="mt-3 pl-9">
          <p className="mb-2 text-sm font-medium text-gray-700">
            Ảnh cửa hàng đã tải lên:
          </p>
          <div className="flex flex-wrap gap-3">
            {data.items.map((item, index) => {
              const fullUrl = resolveImageUrl(item.imageUrl);
              return (
                <figure key={item.branchImageId} className="group mx-auto my-2">
                  <div className="overflow-hidden rounded-lg shadow-md">
                    <a href={fullUrl} target="_blank" rel="noopener noreferrer">
                      <img
                        src={fullUrl}
                        alt={`Ảnh cửa hàng ${index + 1}`}
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
      )}
    </div>
  );
}
