import React, { useState, useEffect, useRef } from 'react';
import maplibregl from '@openmapvn/openmapvn-gl';
import '@openmapvn/openmapvn-gl/dist/maplibre-gl.css';
import type { JSX } from 'react';

const defaultCenter = {
  lat: 10.762622,
  lng: 106.660172,
};

interface MapLocationPickerProps {
  address: string; // Địa chỉ đầy đủ từ form
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (lat: number, lng: number) => void;
}

export default function MapLocationPicker({
  address,
  latitude,
  longitude,
  onLocationChange,
}: MapLocationPickerProps): JSX.Element {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [inputLat, setInputLat] = useState<string>('');
  const [inputLng, setInputLng] = useState<string>('');

  const apiKey = import.meta.env.VITE_OPENMAP_API_KEY;

  // Sync input values khi props thay đổi
  useEffect(() => {
    if (latitude !== null) {
      setInputLat(latitude.toString());
    }
    if (longitude !== null) {
      setInputLng(longitude.toString());
    }
  }, [latitude, longitude]);

  // Hàm cập nhật marker từ input tọa độ
  const handleApplyCoordinates = (): void => {
    const lat = parseFloat(inputLat);
    const lng = parseFloat(inputLng);

    if (isNaN(lat) || isNaN(lng)) {
      alert('Vui lòng nhập tọa độ hợp lệ');
      return;
    }

    // Kiểm tra tọa độ trong phạm vi TP.HCM
    if (lat < 10.3 || lat > 11.2 || lng < 106.3 || lng > 107.1) {
      const confirm = window.confirm(
        'Tọa độ này có vẻ nằm ngoài TP. Hồ Chí Minh. Bạn có chắc muốn tiếp tục?'
      );
      if (!confirm) return;
    }

    onLocationChange(lat, lng);

    // Cập nhật marker trên map
    if (map.current) {
      if (marker.current) {
        marker.current.setLngLat([lng, lat]);
      } else {
        marker.current = new maplibregl.Marker({ draggable: true })
          .setLngLat([lng, lat])
          .addTo(map.current);

        marker.current.on('dragend', () => {
          if (marker.current) {
            const lngLat = marker.current.getLngLat();
            onLocationChange(lngLat.lat, lngLat.lng);
          }
        });
      }

      // Di chuyển map đến vị trí mới
      map.current.flyTo({
        center: [lng, lat],
        zoom: 17,
        duration: 1000,
      });
    }
  };

  // Khởi tạo map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    if (!apiKey || apiKey === 'YOUR_API_KEY') {
      setMapError(
        'Chưa cấu hình OpenMap API Key. Vui lòng thêm VITE_OPENMAP_API_KEY vào file .env'
      );
      return;
    }

    try {
      const initialLng = longitude ?? defaultCenter.lng;
      const initialLat = latitude ?? defaultCenter.lat;

      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: `https://maptiles.openmap.vn/styles/day-v1/style.json?apikey=${apiKey}`,
        center: [initialLng, initialLat],
        zoom: latitude && longitude ? 17 : 13,
        maplibreLogo: true,
      });

      // Thêm marker nếu đã có tọa độ
      if (latitude && longitude) {
        marker.current = new maplibregl.Marker({ draggable: true })
          .setLngLat([longitude, latitude])
          .addTo(map.current);

        // Xử lý khi kéo marker
        marker.current.on('dragend', () => {
          if (marker.current) {
            const lngLat = marker.current.getLngLat();
            onLocationChange(lngLat.lat, lngLat.lng);
          }
        });
      }

      // Xử lý click vào map
      map.current.on('click', (e: maplibregl.MapMouseEvent) => {
        const { lng, lat } = e.lngLat;

        // Tạo hoặc di chuyển marker
        if (marker.current) {
          marker.current.setLngLat([lng, lat]);
        } else if (map.current) {
          marker.current = new maplibregl.Marker({ draggable: true })
            .setLngLat([lng, lat])
            .addTo(map.current);

          marker.current.on('dragend', () => {
            if (marker.current) {
              const lngLat = marker.current.getLngLat();
              onLocationChange(lngLat.lat, lngLat.lng);
            }
          });
        }

        onLocationChange(lat, lng);
      });
    } catch {
      setMapError('Không thể tải bản đồ');
    }

    return (): void => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Geocoding khi địa chỉ thay đổi (với debounce)
  useEffect(() => {
    // Chỉ geocode khi có ít nhất số nhà/tên đường trong địa chỉ
    // Kiểm tra xem có ít nhất 10 ký tự (tránh geocode khi chỉ có "TP. Hồ Chí Minh")
    if (!address || address.trim() === '' || address.length < 20) {
      return;
    }

    // Debounce: chỉ gọi API sau khi người dùng dừng nhập 1.5 giây
    const timeoutId = setTimeout(() => {
      setIsGeocoding(true);
      setMapError(null);

      const addressVariants = [
        address,
        address.replace(/Hồ Chí Minh/gi, 'Ho Chi Minh'),
      ];

      // Hàm thử geocode với một địa chỉ
      const tryGeocode = async (addressToTry: string): Promise<boolean> => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              addressToTry + ', Vietnam'
            )}&limit=5&bounded=1&viewbox=106.4,10.5,107.0,11.0`
          );
          const data = await response.json();

          if (data && data.length > 0) {
            // Lọc kết quả nằm trong khu vực TP.HCM (lat: 10.5-11.0, lng: 106.4-107.0)
            const hcmResults = data.filter((item: Record<string, unknown>) => {
              const itemLat = parseFloat(item.lat as string);
              const itemLng = parseFloat(item.lon as string);
              return (
                itemLat >= 10.5 &&
                itemLat <= 11.0 &&
                itemLng >= 106.4 &&
                itemLng <= 107.0
              );
            });

            const bestResult = hcmResults.length > 0 ? hcmResults[0] : data[0];
            const lat = parseFloat(bestResult.lat);
            const lng = parseFloat(bestResult.lon);

            if (!map.current) {
              setMapError('Bản đồ đang tải, vui lòng thử lại sau');
              return false;
            }

            if (marker.current) {
              marker.current.setLngLat([lng, lat]);
            } else {
              marker.current = new maplibregl.Marker({
                draggable: true,
                color: '#FF0000',
              })
                .setLngLat([lng, lat])
                .addTo(map.current);

              marker.current.on('dragend', () => {
                if (marker.current) {
                  const lngLat = marker.current.getLngLat();
                  onLocationChange(lngLat.lat, lngLat.lng);
                }
              });
            }

            // Di chuyển map đến vị trí
            map.current.flyTo({
              center: [lng, lat],
              zoom: 17,
              duration: 2000,
            });

            onLocationChange(lat, lng);
            setIsGeocoding(false);
            return true;
          }
          return false;
        } catch {
          return false;
        }
      };

      // Thử lần lượt các biến thể địa chỉ
      (async (): Promise<void> => {
        for (let i = 0; i < addressVariants.length; i++) {
          const success = await tryGeocode(addressVariants[i]);
          if (success) {
            return; // Thành công, dừng lại
          }
        }

        setIsGeocoding(false);
        setMapError(
          'Không thể định vị địa chỉ chính xác. Vui lòng click trực tiếp vào bản đồ để chọn vị trí.'
        );
      })();
    }, 1500); // Đợi 1.5 giây sau khi người dùng dừng gõ

    // Cleanup: hủy timeout nếu address thay đổi trước khi hết thời gian
    return (): void => {
      clearTimeout(timeoutId);
      setIsGeocoding(false);
    };
  }, [address]);

  return (
    <div>
      {/* Thông báo quan trọng về độ chính xác */}
      <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <p className="mb-2 text-sm font-medium text-yellow-800">
          Lưu ý về độ chính xác định vị
        </p>
        <ul className="ml-5 list-disc space-y-1 text-xs text-yellow-700">
          <li>
            Hệ thống tự động định vị có thể{' '}
            <strong>không chính xác 100%</strong>
          </li>
          <li>
            Vui lòng <strong>kiểm tra marker (chấm đỏ)</strong> trên bản đồ
          </li>
          <li>
            <strong>Kéo marker</strong> đến đúng vị trí cửa hàng của bạn nếu cần
          </li>
          <li>
            Hoặc <strong>click trực tiếp</strong> vào bản đồ để đánh dấu vị trí
            chính xác
          </li>
        </ul>
      </div>

      {/* Hiển thị trạng thái geocoding */}
      {isGeocoding && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            Đang tìm kiếm vị trí trên bản đồ...
          </p>
        </div>
      )}

      {/* Hiển thị lỗi */}
      {mapError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="mb-2 text-sm font-medium text-red-800">{mapError}</p>
          <div className="text-xs text-red-700">
            <p className="mb-2">Để sử dụng bản đồ OpenMap (miễn phí):</p>
            <ol className="ml-5 list-decimal space-y-1">
              <li>
                Truy cập{' '}
                <a
                  href="https://openmap.vn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline"
                >
                  openmap.vn
                </a>{' '}
                và đăng ký tài khoản
              </li>
              <li>Lấy API Key miễn phí (không cần thẻ tín dụng)</li>
              <li>
                Mở file <code className="rounded bg-red-100 px-1">.env</code> và
                thay{' '}
                <code className="rounded bg-red-100 px-1">YOUR_API_KEY</code>{' '}
                bằng API key của bạn
              </li>
              <li>Khởi động lại dev server</li>
            </ol>
          </div>
        </div>
      )}

      {!address && (
        <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <p className="text-sm text-gray-700">
            Vui lòng điền đầy đủ thông tin địa chỉ ở trên để bản đồ tự động định
            vị
          </p>
        </div>
      )}

      {address && address.length < 20 && (
        <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
          <p className="text-sm text-yellow-700">
            Vui lòng nhập đầy đủ địa chỉ chi tiết để hệ thống có thể định vị
            chính xác
          </p>
        </div>
      )}

      {/* Map Container */}
      <div
        ref={mapContainer}
        style={{
          width: '100%',
          height: '400px',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
        }}
      />

      {/* Tọa độ GPS - Chỉnh sửa thủ công */}
      <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="mb-3 text-sm font-semibold text-blue-900">Tọa độ GPS</p>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-blue-800">
              Vĩ độ (Latitude)
            </label>
            <input
              type="number"
              step="0.000001"
              value={inputLat}
              onChange={(e) => setInputLat(e.target.value)}
              placeholder="10.824707"
              className="w-full rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-blue-800">
              Kinh độ (Longitude)
            </label>
            <input
              type="number"
              step="0.000001"
              value={inputLng}
              onChange={(e) => setInputLng(e.target.value)}
              placeholder="106.629674"
              className="w-full rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleApplyCoordinates}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold whitespace-nowrap text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg active:scale-95"
            >
              Lấy tọa độ
            </button>
          </div>
        </div>
        <p className="mt-2 text-xs text-blue-700">
          Bạn có thể nhập tọa độ chính xác nếu biết hoặc chỉnh sửa để điều chỉnh
          vị trí marker
        </p>
      </div>
    </div>
  );
}
