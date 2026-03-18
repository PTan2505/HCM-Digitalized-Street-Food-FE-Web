import {
  ArrowTopRightOnSquareIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { MapPinIcon } from '@heroicons/react/24/solid';
import type { JSX } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface OpenMapAutocompletePrediction {
  description: string;
  place_id: string;
  structured_formatting?: {
    main_text?: string;
    secondary_text?: string;
  };
}

interface OpenMapAutocompleteResponse {
  status: string;
  predictions?: OpenMapAutocompletePrediction[];
}

interface OpenMapAddressComponent {
  long_name: string;
  short_name: string;
  types?: string[];
}

interface OpenMapPlaceResponse {
  status: string;
  result?: {
    formatted_address: string;
    name: string;
    address_components?: OpenMapAddressComponent[];
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  };
}

interface OpenMapForwardGeocodeResponse {
  status: string;
  results?: Array<{
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  }>;
}

interface AddressSuggestion {
  placeId: string;
  displayText: string;
  mainText: string;
  secondaryText: string;
}

export interface AddressSelectData {
  addressDetail: string;
  ward: string;
  city: string;
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

const OPENMAP_BASE = '/openmap/v1';
const DEFAULT_LOCATION = '10.762622,106.660172';

const WARD_TYPES = [
  'administrative_area_level_4',
  'administrative_area_level_3',
  'sublocality_level_1',
  'sublocality',
  'locality',
];

const CITY_TYPES = [
  'administrative_area_level_2',
  'administrative_area_level_1',
  'locality',
  'political',
];

const DEFAULT_CITY = 'Thành phố Hồ Chí Minh';

const VIETNAMESE_WARD_PREFIXES = ['phường', 'xã', 'thị trấn'];
const VIETNAMESE_CITY_PREFIXES = ['thành phố', 'tỉnh'];

const findAddressPart = (
  components: OpenMapAddressComponent[] | undefined,
  preferredTypes: string[]
): string => {
  if (!components?.length) return '';

  const component = components.find((item) =>
    preferredTypes.some((type) => item.types?.includes(type))
  );

  return component?.long_name ?? '';
};

const findAddressPartByPrefix = (
  components: OpenMapAddressComponent[] | undefined,
  prefixes: string[]
): string => {
  if (!components?.length) return '';

  const component = components.find((item) => {
    const value = item.long_name.toLowerCase();
    return prefixes.some((prefix) => value.startsWith(prefix));
  });

  return component?.long_name ?? '';
};

export default function AddressAutocomplete({
  value,
  onSelect,
  onChange,
  disabled = false,
  error,
  placeholder = 'Tìm kiếm địa chỉ cửa hàng...',
}: AddressAutocompleteProps): JSX.Element {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const justSelectedRef = useRef(false);
  const latestSelectionRef = useRef(0);
  const apiKey = import.meta.env.VITE_OPENMAP_API_KEY as string | undefined;

  useEffect(() => {
    if (!justSelectedRef.current) {
      setInputValue(value);
    }
    justSelectedRef.current = false;
  }, [value]);

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
        setSuggestions([]);
        setOpen(false);
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams({
          input: text.trim(),
          admin_v2: 'true',
          location: DEFAULT_LOCATION,
          radius: '50',
        });

        if (apiKey) params.append('apikey', apiKey);

        const res = await fetch(
          `${OPENMAP_BASE}/autocomplete?${params.toString()}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = (await res.json()) as OpenMapAutocompleteResponse;
        if (data.status !== 'OK') {
          setSuggestions([]);
          setOpen(false);
          return;
        }

        const nextSuggestions = (data.predictions ?? []).map((prediction) => ({
          placeId: prediction.place_id,
          displayText: prediction.description,
          mainText:
            prediction.structured_formatting?.main_text ??
            prediction.description,
          secondaryText: prediction.structured_formatting?.secondary_text ?? '',
        }));

        setSuggestions(nextSuggestions);
        setOpen(nextSuggestions.length > 0);
      } catch {
        setSuggestions([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    },
    [apiKey]
  );

  const getPlaceDetail = useCallback(
    async (
      placeId: string
    ): Promise<{
      lat: number;
      lng: number;
      formattedAddress: string;
      ward: string;
      city: string;
    } | null> => {
      try {
        const params = new URLSearchParams({
          ids: placeId,
          format: 'google',
          admin_v2: 'true',
        });
        if (apiKey) params.append('apikey', apiKey);

        const res = await fetch(`${OPENMAP_BASE}/place?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = (await res.json()) as OpenMapPlaceResponse;
        if (data.status !== 'OK' || !data.result) return null;

        const ward =
          findAddressPart(data.result.address_components, WARD_TYPES) ||
          findAddressPartByPrefix(
            data.result.address_components,
            VIETNAMESE_WARD_PREFIXES
          );

        const city =
          findAddressPart(data.result.address_components, CITY_TYPES) ||
          findAddressPartByPrefix(
            data.result.address_components,
            VIETNAMESE_CITY_PREFIXES
          ) ||
          DEFAULT_CITY;

        return {
          lat: data.result.geometry.location.lat,
          lng: data.result.geometry.location.lng,
          formattedAddress: data.result.formatted_address,
          ward,
          city,
        };
      } catch {
        return null;
      }
    },
    [apiKey]
  );

  const forwardGeocode = useCallback(
    async (address: string): Promise<{ lat: number; lng: number } | null> => {
      if (!address.trim()) return null;

      try {
        const params = new URLSearchParams({
          address,
          admin_v2: 'true',
        });
        if (apiKey) params.append('apikey', apiKey);

        const res = await fetch(
          `${OPENMAP_BASE}/geocode/forward?${params.toString()}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = (await res.json()) as OpenMapForwardGeocodeResponse;
        if (data.status !== 'OK' || !data.results?.[0]) return null;

        return {
          lat: data.results[0].geometry.location.lat,
          lng: data.results[0].geometry.location.lng,
        };
      } catch {
        return null;
      }
    },
    [apiKey]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const nextValue = e.target.value;
    setInputValue(nextValue);
    onChange?.(nextValue);

    // User is editing free text, so previous coordinates are no longer trusted.
    latestSelectionRef.current += 1;
    onSelect({
      addressDetail: nextValue,
      ward: '',
      city: DEFAULT_CITY,
      latitude: null,
      longitude: null,
    });

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void fetchSuggestions(nextValue);
    }, 400);
  };

  const handleSelectSuggestion = (suggestion: AddressSuggestion): void => {
    const selectionId = latestSelectionRef.current + 1;
    latestSelectionRef.current = selectionId;

    justSelectedRef.current = true;
    setInputValue(suggestion.displayText);
    setOpen(false);
    setSuggestions([]);

    const addressDetail = suggestion.mainText || suggestion.displayText;

    onSelect({
      addressDetail,
      ward: '',
      city: DEFAULT_CITY,
      latitude: null,
      longitude: null,
    });

    void getPlaceDetail(suggestion.placeId).then(async (detail) => {
      if (selectionId !== latestSelectionRef.current) return;

      if (detail) {
        onSelect({
          addressDetail: detail.formattedAddress,
          ward: detail.ward,
          city: detail.city,
          latitude: detail.lat,
          longitude: detail.lng,
        });
        return;
      }

      const fallback = await forwardGeocode(suggestion.displayText);
      if (selectionId !== latestSelectionRef.current) return;

      if (fallback) {
        onSelect({
          addressDetail,
          ward: '',
          city: DEFAULT_CITY,
          latitude: fallback.lat,
          longitude: fallback.lng,
        });
      }
    });
  };

  const handleClear = (): void => {
    setInputValue('');
    setSuggestions([]);
    setOpen(false);
    onChange?.('');
    latestSelectionRef.current += 1;
    onSelect({
      addressDetail: '',
      ward: '',
      city: DEFAULT_CITY,
      latitude: null,
      longitude: null,
    });
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
            if (suggestions.length > 0) setOpen(true);
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
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          {suggestions.map((suggestion) => {
            const subtitle = suggestion.secondaryText;

            return (
              <button
                key={suggestion.placeId}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelectSuggestion(suggestion);
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 active:bg-gray-100"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
                  <MapPinIcon className="h-4 w-4 text-gray-500" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {suggestion.mainText}
                  </p>
                  {subtitle && (
                    <p className="truncate text-xs text-gray-500">{subtitle}</p>
                  )}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-0.5">
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
