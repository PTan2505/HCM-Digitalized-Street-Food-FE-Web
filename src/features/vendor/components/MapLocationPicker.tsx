import React, { useState, useEffect, useRef, useCallback } from 'react';
import maplibregl from '@openmapvn/openmapvn-gl';
import '@openmapvn/openmapvn-gl/dist/maplibre-gl.css';
import type { JSX } from 'react';
import { ENV } from '@config/env';

const defaultCenter = {
  lat: 10.762622,
  lng: 106.660172,
};

interface MapLocationPickerProps {
  address: string; // Địa chỉ đầy đủ từ form
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (lat: number, lng: number) => void;
  onAddressResolved?: (data: {
    detailAddress: string;
    ward: string;
    city: string;
  }) => void;
}

export default function MapLocationPicker({
  address,
  latitude,
  longitude,
  onLocationChange,
  onAddressResolved,
}: MapLocationPickerProps): JSX.Element {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);
  const reverseRequestIdRef = useRef(0);
  const updateSourceRef = useRef<'map' | 'external'>('external');
  const onLocationChangeRef = useRef(onLocationChange);
  const onAddressResolvedRef = useRef(onAddressResolved);
  const [inputLat, setInputLat] = useState<string>('');
  const [inputLng, setInputLng] = useState<string>('');

  const apiKey = ENV.maps.openMapApiKey;

  const WARD_PREFIXES = ['phường', 'xã', 'thị trấn'];
  const CITY_PREFIXES = ['thành phố', 'tỉnh'];

  const findByPrefix = (
    values: string[],
    prefixes: string[]
  ): string | undefined => {
    const lowerPrefixes = prefixes.map((p) => p.toLowerCase());
    return values.find((value) => {
      const lower = value.toLowerCase();
      return lowerPrefixes.some((prefix) => lower.startsWith(prefix));
    });
  };

  const reverseGeocodeAndSync = useCallback(
    async (lat: number, lng: number): Promise<void> => {
      if (!onAddressResolvedRef.current) return;

      reverseRequestIdRef.current += 1;
      const requestId = reverseRequestIdRef.current;

      try {
        const params = new URLSearchParams({
          latlng: `${lat},${lng}`,
          admin_v2: 'true',
        });
        if (apiKey) {
          params.append('apikey', apiKey);
        }

        const res = await fetch(
          `/openmap/v1/geocode/reverse?${params.toString()}`
        );
        if (!res.ok) return;

        const data = (await res.json()) as {
          status?: string;
          results?: Array<{
            formatted_address?: string;
            name?: string;
            address?: string;
            address_components?: Array<{
              long_name?: string;
            }>;
          }>;
        };

        if (requestId !== reverseRequestIdRef.current) return;
        if (data.status !== 'OK' || !data.results?.[0]) return;

        const first = data.results[0];
        const componentValues = (first.address_components ?? [])
          .map((item) => item.long_name?.trim() ?? '')
          .filter(Boolean);

        const ward = findByPrefix(componentValues, WARD_PREFIXES) ?? '';
        const city =
          findByPrefix(componentValues, CITY_PREFIXES) ??
          'Thành phố Hồ Chí Minh';

        const detailAddress =
          first.formatted_address ?? first.name ?? first.address ?? '';

        if (!detailAddress) return;

        onAddressResolvedRef.current({
          detailAddress,
          ward,
          city,
        });
      } catch {
        // Ignore reverse geocode errors and keep manual position.
      }
    },
    [apiKey]
  );

  useEffect(() => {
    onLocationChangeRef.current = onLocationChange;
  }, [onLocationChange]);

  useEffect(() => {
    onAddressResolvedRef.current = onAddressResolved;
  }, [onAddressResolved]);

  // Sync input values khi props thay đổi
  useEffect(() => {
    if (latitude !== null) {
      setInputLat(latitude.toString());
    }
    if (longitude !== null) {
      setInputLng(longitude.toString());
    }
  }, [latitude, longitude]);

  // Khi coordinates được set từ bên ngoài (ví dụ: autocomplete geocoding thành công)
  // → di chuyển marker và fly map đến vị trí đó
  useEffect(() => {
    if (latitude === null || longitude === null) return;
    if (!map.current) return;

    if (marker.current) {
      marker.current.setLngLat([longitude, latitude]);
    } else {
      marker.current = new maplibregl.Marker({ draggable: true })
        .setLngLat([longitude, latitude])
        .addTo(map.current);

      marker.current.on('dragend', () => {
        if (marker.current) {
          const lngLat = marker.current.getLngLat();
          updateSourceRef.current = 'map';
          onLocationChangeRef.current(lngLat.lat, lngLat.lng);
          void reverseGeocodeAndSync(lngLat.lat, lngLat.lng);
        }
      });
    }

    if (updateSourceRef.current === 'map') {
      updateSourceRef.current = 'external';
      return;
    }

    map.current.flyTo({
      center: [longitude, latitude],
      zoom: 17,
      duration: 1000,
    });
  }, [latitude, longitude, reverseGeocodeAndSync]);

  // Hàm cập nhật marker từ input tọa độ
  // const handleApplyCoordinates = (): void => {
  //   const lat = parseFloat(inputLat);
  //   const lng = parseFloat(inputLng);

  //   if (isNaN(lat) || isNaN(lng)) {
  //     alert('Vui lòng nhập tọa độ hợp lệ');
  //     return;
  //   }

  //   // Kiểm tra tọa độ trong phạm vi TP.HCM
  //   if (lat < 10.3 || lat > 11.2 || lng < 106.3 || lng > 107.1) {
  //     const confirm = window.confirm(
  //       'Tọa độ này có vẻ nằm ngoài TP. Hồ Chí Minh. Bạn có chắc muốn tiếp tục?'
  //     );
  //     if (!confirm) return;
  //   }

  //   updateSourceRef.current = 'map';
  //   onLocationChangeRef.current(lat, lng);
  //   void reverseGeocodeAndSync(lat, lng);

  //   // Cập nhật marker trên map
  //   if (map.current) {
  //     if (marker.current) {
  //       marker.current.setLngLat([lng, lat]);
  //     } else {
  //       marker.current = new maplibregl.Marker({ draggable: true })
  //         .setLngLat([lng, lat])
  //         .addTo(map.current);

  //       marker.current.on('dragend', () => {
  //         if (marker.current) {
  //           const lngLat = marker.current.getLngLat();
  //           updateSourceRef.current = 'map';
  //           onLocationChangeRef.current(lngLat.lat, lngLat.lng);
  //           void reverseGeocodeAndSync(lngLat.lat, lngLat.lng);
  //         }
  //       });
  //     }

  //     // Di chuyển map đến vị trí mới
  //     map.current.flyTo({
  //       center: [lng, lat],
  //       zoom: 17,
  //       duration: 1000,
  //     });
  //   }
  // };

  // Khởi tạo map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    if (!apiKey || apiKey === 'YOUR_API_KEY') {
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
      if (latitude !== null && longitude !== null) {
        marker.current = new maplibregl.Marker({ draggable: true })
          .setLngLat([longitude, latitude])
          .addTo(map.current);

        // Xử lý khi kéo marker
        marker.current.on('dragend', () => {
          if (marker.current) {
            const lngLat = marker.current.getLngLat();
            updateSourceRef.current = 'map';
            onLocationChangeRef.current(lngLat.lat, lngLat.lng);
            void reverseGeocodeAndSync(lngLat.lat, lngLat.lng);
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
              updateSourceRef.current = 'map';
              onLocationChangeRef.current(lngLat.lat, lngLat.lng);
              void reverseGeocodeAndSync(lngLat.lat, lngLat.lng);
            }
          });
        }

        updateSourceRef.current = 'map';
        onLocationChangeRef.current(lat, lng);
        void reverseGeocodeAndSync(lat, lng);
      });
    } catch {
      // map failed to load
    }

    return (): void => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [apiKey, reverseGeocodeAndSync]);

  // Geocoding khi địa chỉ thay đổi (với debounce)
  useEffect(() => {
    // Chỉ geocode khi có ít nhất số nhà/tên đường trong địa chỉ
    // Kiểm tra xem có ít nhất 10 ký tự (tránh geocode khi chỉ có "TP. Hồ Chí Minh")
    if (!address || address.trim() === '' || address.length < 20) {
      return;
    }

    // Debounce: chỉ gọi API sau khi người dùng dừng nhập 1.5 giây
    const timeoutId = setTimeout(() => {
      // Geocoding logic intentionally disabled
    }, 1500);

    return (): void => {
      clearTimeout(timeoutId);
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
      {/* {isGeocoding && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            Đang tìm kiếm vị trí trên bản đồ...
          </p>
        </div>
      )} */}

      {/* Hiển thị lỗi */}
      {/* {mapError && (
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
      )} */}

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
      {/* GPS coordinate input — hidden from UI but lat/lng still captured via map click/drag */}
      {/* <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
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
      </div> */}
    </div>
  );
}
