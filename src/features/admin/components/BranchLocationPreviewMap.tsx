import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import maplibregl from '@openmapvn/openmapvn-gl';
import '@openmapvn/openmapvn-gl/dist/maplibre-gl.css';
import { ENV } from '@config/env';

interface BranchLocationPreviewMapProps {
  lat: number;
  lng: number;
  height?: number;
}

const MAP_INIT_INTERVAL_MS = 1000;
let mapInitQueue: Promise<void> = Promise.resolve();
let lastMapInitAt = 0;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

const enqueueMapInit = (task: () => void): Promise<void> => {
  const queuedTask = mapInitQueue.then(async (): Promise<void> => {
    const now = Date.now();
    const elapsed = now - lastMapInitAt;
    const waitMs = Math.max(0, MAP_INIT_INTERVAL_MS - elapsed);

    if (waitMs > 0) {
      await sleep(waitMs);
    }

    lastMapInitAt = Date.now();
    task();
  });

  // Keep queue alive even if one task fails.
  mapInitQueue = queuedTask.catch((): void => undefined);
  return queuedTask;
};

export default function BranchLocationPreviewMap({
  lat,
  lng,
  height = 220,
}: BranchLocationPreviewMapProps): JSX.Element {
  const [isMapReady, setIsMapReady] = useState<boolean>(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const apiKey = ENV.maps.openMapApiKey;
    if (!apiKey || apiKey === 'YOUR_API_KEY') return;

    let isDisposed = false;
    setIsMapReady(false);

    void enqueueMapInit((): void => {
      if (isDisposed || !mapContainerRef.current || mapRef.current) return;

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: `https://maptiles.openmap.vn/styles/day-v1/style.json?apikey=${apiKey}`,
        center: [lng, lat],
        zoom: 15,
        maplibreLogo: true,
        dragRotate: false,
        touchZoomRotate: false,
      });

      map.on('load', (): void => {
        if (!isDisposed) {
          setIsMapReady(true);
        }
      });

      mapRef.current = map;
      markerRef.current = new maplibregl.Marker({ draggable: false })
        .setLngLat([lng, lat])
        .addTo(map);
    });

    return (): void => {
      isDisposed = true;
      markerRef.current?.remove();
      markerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      setIsMapReady(false);
    };
  }, [lat, lng]);

  useEffect(() => {
    if (!mapRef.current) return;

    markerRef.current?.setLngLat([lng, lat]);
    mapRef.current.flyTo({
      center: [lng, lat],
      zoom: 15,
      duration: 500,
    });
  }, [lat, lng]);

  return (
    <div
      style={{
        width: '100%',
        height: `${height}px`,
        borderRadius: '10px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {!isMapReady && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8fafc',
            color: '#64748b',
            fontSize: '14px',
            zIndex: 1,
          }}
        >
          Đang tải bản đồ...
        </div>
      )}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
          visibility: isMapReady ? 'visible' : 'hidden',
        }}
      />
    </div>
  );
}
