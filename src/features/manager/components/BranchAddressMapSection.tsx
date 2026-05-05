import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { IconButton } from '@mui/material';
import AddressAutocomplete from '@features/vendor/components/AddressAutocomplete';
import MapLocationPicker from '@features/vendor/components/MapLocationPicker';
import type { Branch } from '@features/vendor/types/vendor';
import type { JSX } from 'react';

export type AddressDraft = {
  detailAddress: string;
  ward: string;
  city: string;
  lat: number | null;
  long: number | null;
};

type BranchAddressMapSectionProps = {
  currentBranch: Branch;
  isEditingAddress: boolean;
  savingField: boolean;
  addressDraft: AddressDraft;
  onAddressDraftChange: (next: AddressDraft) => void;
  onStartAddressEdit: () => void;
  onCancelAddressEdit: () => void;
  onSaveAddressEdit: () => void;
  disableEditButton?: boolean;
};

export default function BranchAddressMapSection({
  currentBranch,
  isEditingAddress,
  savingField,
  addressDraft,
  onAddressDraftChange,
  onStartAddressEdit,
  onCancelAddressEdit,
  onSaveAddressEdit,
  disableEditButton = false,
}: BranchAddressMapSectionProps): JSX.Element {
  return (
    <>
      <div className="grid grid-cols-12 items-start gap-3 border-b border-gray-100 py-3">
        <div className="col-span-12 text-sm font-semibold text-gray-600 md:col-span-4">
          Địa chỉ chi tiết
        </div>
        <div className="col-span-12 md:col-span-8">
          {isEditingAddress ? (
            <AddressAutocomplete
              value={addressDraft.detailAddress}
              onChange={(value) => {
                onAddressDraftChange({
                  ...addressDraft,
                  detailAddress: value,
                });
              }}
              onSelect={(data) => {
                onAddressDraftChange({
                  ...addressDraft,
                  detailAddress: data.addressDetail,
                  ward: data.ward,
                  city: data.city,
                  lat: data.latitude,
                  long: data.longitude,
                });
              }}
              placeholder="Tìm kiếm địa chỉ cửa hàng..."
            />
          ) : (
            <div className="flex items-center justify-between gap-2">
              <span className="text-table-text-primary text-sm font-medium">
                {currentBranch.addressDetail}
              </span>
              <IconButton
                size="small"
                color="primary"
                disabled={disableEditButton}
                onClick={onStartAddressEdit}
              >
                <EditIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 items-start gap-3 border-b border-gray-100 py-3">
        <div className="col-span-12 w-full">
          {isEditingAddress ? (
            <div className="space-y-2">
              <MapLocationPicker
                address={addressDraft.detailAddress}
                latitude={addressDraft.lat}
                longitude={addressDraft.long}
                onLocationChange={(lat, lng) => {
                  onAddressDraftChange({
                    ...addressDraft,
                    lat,
                    long: lng,
                  });
                }}
                onAddressResolved={(data) => {
                  onAddressDraftChange({
                    ...addressDraft,
                    detailAddress: data.detailAddress,
                    ward: data.ward,
                    city: data.city,
                  });
                }}
              />
              <div className="flex items-center justify-end gap-1">
                <IconButton
                  size="small"
                  color="success"
                  onClick={onSaveAddressEdit}
                  disabled={savingField}
                >
                  <CheckIcon sx={{ fontSize: 18, color: '#166534' }} />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={onCancelAddressEdit}
                  disabled={savingField}
                >
                  <CloseIcon sx={{ fontSize: 18, color: '#b91c1c' }} />
                </IconButton>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="pointer-events-none">
                <MapLocationPicker
                  address={currentBranch.addressDetail}
                  latitude={currentBranch.lat}
                  longitude={currentBranch.long}
                  onLocationChange={() => {}}
                  hideWarnings={true}
                />
              </div>
              <p className="text-xs text-gray-500">
                Tọa độ: {currentBranch.lat.toFixed(6)},
                {` ${currentBranch.long.toFixed(6)}`}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
