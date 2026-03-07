import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { MapPinIcon } from '@heroicons/react/24/solid';
import type { JSX } from 'react';

// ??? OpenMap GeoJSON (OSM) response format ?????????????????????????????
interface FeatureProperties {
  id: string;
  name: string;
  label: string; // full display address
  short_address: string; // → addressDetail sent to vendor API
  locality: string; // → ward  (e.g. "phường Bình Trưng Tây")
  county: string; // → district (e.g. "quận Tân Phú")
  region: string; // → city  (e.g. "thành phố Hồ Chí Minh")
  distance: number | null;
  housenumber: string | null;
  street: string | null;
}

interface GeoJsonFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  } | null;
  properties: FeatureProperties;
}

interface AutocompleteResponse {
  features: GeoJsonFeature[];
  errors: string | null;
}

interface NominatimResult {
  lat: string;
  lon: string;
}

// ??? Public types ??????????????????????????????????????????????????????
export interface AddressSelectData {
  addressDetail: string; // short_address (or label fallback)
  ward: string; // locality
  city: string; // region
  latitude: number | null;
  longitude: number | null;
}

interface AddressAutocompleteProps {
  value: string;
  onSelect: (data: AddressSelectData) => void;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
}

// Proxied via vite dev server to avoid CORS
const OPENMAP_BASE = '/openmap/v1';
const DEFAULT_LOCATION = '10.762622,106.660172';

export default function AddressAutocomplete({
  value,
  onSelect,
  onChange,
  disabled = false,
  error,
  placeholder = 'T?m ki?m �?a ch? c?a h�ng...',
}: AddressAutocompleteProps): JSX.Element {
  const [inputValue, setInputValue] = useState(value);
  const [features, setFeatures] = useState<GeoJsonFeature[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Prevents the value→inputValue sync effect from overriding the display label
  // right after the user picks a suggestion from the dropdown.
  const justSelectedRef = useRef(false);
  const apiKey = import.meta.env.VITE_OPENMAP_API_KEY as string | undefined;

  // Sync external value into input (skip immediately after a dropdown selection)
  useEffect(() => {
    if (!justSelectedRef.current) {
      setInputValue(value);
    }
    justSelectedRef.current = false;
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return (): void => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchSuggestions = useCallback(
    async (text: string): Promise<void> => {
      if (!text || text.trim().length < 3) {
        setFeatures([]);
        setOpen(false);
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams({
          text: text.trim(),
          location: DEFAULT_LOCATION,
          radius: '50',
        });
        if (apiKey) params.append('apikey', apiKey);

        const res = await fetch(
          `${OPENMAP_BASE}/autocomplete?${params.toString()}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = (await res.json()) as AutocompleteResponse;
        const list = data.features ?? [];
        setFeatures(list);
        setOpen(list.length > 0);
      } catch {
        setFeatures([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    },
    [apiKey]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const val = e.target.value;
    setInputValue(val);
    onChange?.(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void fetchSuggestions(val);
    }, 400);
  };

  /**
   * Geocode with Nominatim using two strategies:
   * 1. Structured (street + district + city) — most accurate, handles house-number ranges.
   * 2. Freeform query fallback.
   * OpenMap /autocomplete always returns geometry: null, so we must geocode ourselves.
   */
  const geocodeCleanAddress = useCallback(
    async (opts: {
      housenumber: string | null;
      street: string | null;
      locality: string;
      county: string;
      region: string;
    }): Promise<{ lat: number; lng: number } | null> => {
      // Strip administrative prefix ("quận", "huyện", ...) so Nominatim can match
      const stripPrefix = (s: string): string =>
        s.replace(/^(quận|huyện|thành phố|thị xã)\s+/i, '').trim();

      // --- Strategy 1: Nominatim structured geocoding ---
      if (opts.street) {
        // Take only the first number in a range like "156 - 158" so Nominatim can match
        const hn = opts.housenumber
          ? opts.housenumber.split(/[\s\-–,]+/)[0].trim()
          : '';
        const street = hn ? `${hn} ${opts.street}` : opts.street;
        const district = opts.county ? stripPrefix(opts.county) : '';
        const city = opts.region ? stripPrefix(opts.region) : 'Hồ Chí Minh';

        const params = new URLSearchParams({
          format: 'json',
          limit: '3',
          street,
          city,
          country: 'Vietnam',
          bounded: '1',
          viewbox: '106.4,10.5,107.0,11.0',
        });
        if (district) params.set('district', district);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?${params.toString()}`
          );
          if (res.ok) {
            const data = (await res.json()) as NominatimResult[];
            if (data.length > 0) {
              return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
              };
            }
          }
        } catch {
          /* fall through */
        }
      }

      // --- Strategy 2: Freeform query (short_address built from housenumber + street) ---
      const addrParts = [
        opts.housenumber && opts.street
          ? `${opts.housenumber} ${opts.street}`
          : null,
        opts.locality,
        opts.county,
        opts.region,
      ].filter(Boolean);

      if (addrParts.length > 0) {
        const query = addrParts.join(', ') + ', Vietnam';
        try {
          const params = new URLSearchParams({
            format: 'json',
            limit: '3',
            bounded: '1',
            viewbox: '106.4,10.5,107.0,11.0',
            q: query,
          });
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?${params.toString()}`
          );
          if (res.ok) {
            const data = (await res.json()) as NominatimResult[];
            if (data.length > 0) {
              return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
              };
            }
          }
        } catch {
          /* give up */
        }
      }

      return null;
    },
    []
  );

  const handleSelectFeature = (feature: GeoJsonFeature): void => {
    const p = feature.properties;
    const displayLabel = p.label || p.name;

    justSelectedRef.current = true;
    setInputValue(displayLabel);
    setOpen(false);
    setFeatures([]);

    // Build the addressDetail from the most specific available fields
    const addressDetail =
      p.short_address ||
      (p.housenumber && p.street ? `${p.housenumber} ${p.street}` : '') ||
      displayLabel;

    onSelect({
      addressDetail,
      ward: p.locality || '',
      city: p.region || 'Thành phố Hồ Chí Minh',
      latitude: null,
      longitude: null,
    });

    void geocodeCleanAddress({
      housenumber: p.housenumber,
      street: p.street,
      locality: p.locality,
      county: p.county,
      region: p.region,
    }).then((coords) => {
      if (coords) {
        onSelect({
          addressDetail,
          ward: p.locality || '',
          city: p.region || 'Thành phố Hồ Chí Minh',
          latitude: coords.lat,
          longitude: coords.lng,
        });
      }
    });
  };

  const handleClear = (): void => {
    setInputValue('');
    setFeatures([]);
    setOpen(false);
    onChange?.('');
  };

  const formatDistance = (meters: number | null): string | null => {
    if (meters === null || meters === 0) return null;
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  // Secondary text: label without leading "Name, " prefix
  const getSubtitle = (feature: GeoJsonFeature): string => {
    const { name, label } = feature.properties;
    if (!label) return '';
    const prefix = name + ', ';
    return label.startsWith(prefix) ? label.slice(prefix.length) : label;
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input wrapper */}
      <div
        className={`flex items-center gap-2 rounded-xl border px-4 py-3 transition-all duration-200 ${
          disabled
            ? 'cursor-not-allowed border-gray-200 bg-gray-100'
            : error
              ? 'border-red-500 bg-white ring-2 ring-red-200'
              : open
                ? 'border-2 border-[#06AA4C] bg-white shadow-sm'
                : 'border-gray-200 bg-gray-50 hover:border-gray-400 hover:bg-white'
        }`}
      >
        <MagnifyingGlassIcon className="h-5 w-5 shrink-0 text-gray-400" />

        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            if (features.length > 0) setOpen(true);
          }}
          disabled={disabled}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
          autoComplete="off"
        />

        {loading && (
          <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-gray-300 border-t-[#06AA4C]" />
        )}

        {inputValue && !disabled && !loading && (
          <button
            type="button"
            onClick={handleClear}
            className="shrink-0 rounded-full p-0.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown suggestions */}
      {open && features.length > 0 && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          {features.map((feature) => {
            const p = feature.properties;
            const subtitle = getSubtitle(feature);
            const distance = formatDistance(p.distance);

            return (
              <button
                key={p.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelectFeature(feature);
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 active:bg-gray-100"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
                  <MapPinIcon className="h-4 w-4 text-gray-500" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {p.name}
                  </p>
                  {subtitle && (
                    <p className="truncate text-xs text-gray-500">{subtitle}</p>
                  )}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-0.5">
                  {distance && (
                    <span className="text-xs text-gray-400">{distance}</span>
                  )}
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 text-gray-400" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
