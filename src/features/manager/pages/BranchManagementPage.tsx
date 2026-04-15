import { Box } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import BranchAddressMapSection from '@features/manager/components/BranchAddressMapSection';
import BranchImagesSection from '@features/manager/components/BranchImagesSection';
import type { AddressDraft } from '@features/manager/components/BranchAddressMapSection';
import BranchDetailRow from '@features/manager/components/BranchDetailRow';
import type { EditableField } from '@features/manager/components/BranchDetailRow';
import type { Branch } from '@features/vendor/types/vendor';
import type { VendorRegistrationRequest } from '@features/vendor/types/vendor';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectUser } from '@slices/auth';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { JSX } from 'react';
import useBranchManagement from '@features/manager/hooks/useBranchManagement';
import useVendor from '@features/vendor/hooks/useVendor';
import {
  type Controls,
  EVENTS,
  Joyride,
  STATUS,
  type EventData,
} from 'react-joyride';
import { getManagerBranchManagementTourSteps } from '@features/manager/utils/branchManagementTourSteps';

export default function BranchManagementPage(): JSX.Element {
  const user = useAppSelector(selectUser);
  const { onGetManagerMyBranch } = useBranchManagement();
  const { onUpdateBranch } = useVendor();

  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [editValue, setEditValue] = useState('');
  const [savingField, setSavingField] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressDraft, setAddressDraft] = useState<AddressDraft>({
    detailAddress: '',
    ward: '',
    city: '',
    lat: null,
    long: null,
  });
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [tourInstanceKey, setTourInstanceKey] = useState(0);

  const managerIdRef = useRef<number | null>(null);

  managerIdRef.current = ((): number | null => {
    const candidate =
      (user as { id?: unknown; userId?: unknown } | null)?.id ??
      (user as { id?: unknown; userId?: unknown } | null)?.userId;
    if (typeof candidate === 'number' && Number.isInteger(candidate)) {
      return candidate;
    }
    return null;
  })();

  const fetchManagerBranch = async (): Promise<void> => {
    setLoading(true);
    try {
      console.log('[ManagerBranch] GET /api/Branch/manager/my-branch');
      const response = await onGetManagerMyBranch();
      console.log('[ManagerBranch] response:', response);
      setBranch(response);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[ManagerBranch] logged in user:', user);
    void fetchManagerBranch();
  }, [onGetManagerMyBranch, user]);

  const managedBranchesRef = useRef<Branch[]>([]);

  managedBranchesRef.current = ((): Branch[] => {
    if (!branch) {
      return [];
    }

    // Endpoint already returns manager-owned branch. Keep UI visible even if
    // auth payload doesn't expose a numeric id field.
    if (managerIdRef.current === null) {
      return [branch];
    }

    return branch.managerId === managerIdRef.current ? [branch] : [];
  })();

  const currentBranch = managedBranchesRef.current[0] ?? null;

  const buildUpdatePayload = (
    targetBranch: Branch
  ): VendorRegistrationRequest => {
    return {
      name: targetBranch.name,
      phoneNumber: targetBranch.phoneNumber,
      email: targetBranch.email,
      addressDetail: targetBranch.addressDetail,
      ward: targetBranch.ward,
      city: targetBranch.city,
      lat: targetBranch.lat,
      long: targetBranch.long,
      dietaryPreferenceIds: [],
      isActive: targetBranch.isActive,
    };
  };

  const handleStartEdit = (field: EditableField, value: string): void => {
    if (isEditingAddress) {
      return;
    }
    setEditingField(field);
    setEditValue(value);
  };

  const handleCancelEdit = (): void => {
    setEditingField(null);
    setEditValue('');
  };

  const handleStartAddressEdit = (): void => {
    if (!currentBranch || editingField !== null) {
      return;
    }

    setAddressDraft({
      detailAddress: currentBranch.addressDetail,
      ward: currentBranch.ward,
      city: currentBranch.city,
      lat: currentBranch.lat,
      long: currentBranch.long,
    });
    setIsEditingAddress(true);
  };

  const handleCancelAddressEdit = (): void => {
    setIsEditingAddress(false);
    setAddressDraft({
      detailAddress: '',
      ward: '',
      city: '',
      lat: null,
      long: null,
    });
  };

  const handleSaveEdit = async (): Promise<void> => {
    if (!currentBranch || !editingField) {
      return;
    }

    const trimmedValue = editValue.trim();
    if (trimmedValue.length === 0) {
      return;
    }

    setSavingField(true);
    try {
      const payload = buildUpdatePayload(currentBranch);

      switch (editingField) {
        case 'name':
          payload.name = trimmedValue;
          break;
        case 'phoneNumber':
          payload.phoneNumber = trimmedValue;
          break;
        case 'email':
          payload.email = trimmedValue;
          break;
        default:
          break;
      }

      const updatedBranch = await onUpdateBranch({
        branchId: currentBranch.branchId,
        data: payload,
      });

      setBranch((prev) => {
        if (!prev) {
          return prev;
        }
        return {
          ...prev,
          ...updatedBranch,
        };
      });
      setEditingField(null);
      setEditValue('');
    } finally {
      setSavingField(false);
    }
  };

  const handleSaveAddressEdit = async (): Promise<void> => {
    if (!currentBranch) {
      return;
    }

    const trimmedAddress = addressDraft.detailAddress.trim();
    if (trimmedAddress.length === 0) {
      return;
    }

    if (addressDraft.lat === null || addressDraft.long === null) {
      return;
    }

    setSavingField(true);
    try {
      const payload = buildUpdatePayload(currentBranch);
      payload.addressDetail = trimmedAddress;
      payload.ward = addressDraft.ward || currentBranch.ward;
      payload.city = addressDraft.city || currentBranch.city;
      payload.lat = addressDraft.lat;
      payload.long = addressDraft.long;

      const updatedBranch = await onUpdateBranch({
        branchId: currentBranch.branchId,
        data: payload,
      });

      setBranch((prev) => {
        if (!prev) {
          return prev;
        }
        return {
          ...prev,
          ...updatedBranch,
        };
      });
      handleCancelAddressEdit();
    } finally {
      setSavingField(false);
    }
  };

  const editableInfoRows: Array<{
    label: string;
    value: string;
    field?: EditableField;
  }> = currentBranch
    ? [
        {
          label: 'Tên chi nhánh',
          value: currentBranch.name,
          field: 'name',
        },
        {
          label: 'Số điện thoại',
          value: currentBranch.phoneNumber,
          field: 'phoneNumber',
        },
        { label: 'Email', value: currentBranch.email, field: 'email' },
      ]
    : [];

  const statusInfoRows: Array<{
    label: string;
    value: React.ReactNode;
  }> = currentBranch
    ? [
        {
          label: 'Trạng thái xác thực',
          value: currentBranch.isVerified ? 'Đã xác thực' : 'Chưa xác thực',
        },
        {
          label: 'Tình trạng hoạt động',
          value: currentBranch.isActive ? 'Đang hoạt động' : 'Không hoạt động',
        },
        {
          label: 'Tình trạng đăng ký',
          value: currentBranch.isSubscribed
            ? 'Đã thanh toán'
            : 'Chưa thanh toán',
        },
        {
          label: 'Đánh giá trung bình',
          value: ((): React.ReactNode => {
            const averageRating = currentBranch.avgRating ?? 0;
            const filledStars = Math.max(
              0,
              Math.min(5, Math.round(averageRating))
            );

            return (
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-flex items-center">
                  {Array.from({ length: 5 }, (_, index) => (
                    <StarIcon
                      key={`rating-star-${index}`}
                      sx={{
                        fontSize: 16,
                        color: index < filledStars ? '#f59e0b' : '#d1d5db',
                      }}
                    />
                  ))}
                </span>
                <span>{averageRating.toFixed(1)}</span>
              </span>
            );
          })(),
        },
        {
          label: 'Tổng lượt đánh giá',
          value: String(currentBranch.totalReviewCount ?? 0),
        },
        {
          label: 'Tổng điểm đánh giá',
          value: String(currentBranch.totalRatingSum ?? 0),
        },
        {
          label: 'Hạng gói',
          value: currentBranch.tierName ?? '-',
        },
      ]
    : [];

  const startBranchTour = (): void => {
    setTourInstanceKey((prev) => prev + 1);
    setIsTourRunning(true);
  };

  const handleJoyrideEvent = (data: EventData, controls: Controls): void => {
    if (data.type === EVENTS.TARGET_NOT_FOUND) {
      controls.next();
      return;
    }

    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
      setIsTourRunning(false);
    }
  };

  const tourSteps = useMemo(() => {
    return getManagerBranchManagementTourSteps({
      hasBranch: currentBranch !== null,
    });
  }, [currentBranch]);

  return (
    <div className="font-(--font-nunito)">
      <Joyride
        key={tourInstanceKey}
        run={isTourRunning}
        steps={tourSteps}
        continuous
        scrollToFirstStep
        onEvent={handleJoyrideEvent}
        options={{
          showProgress: true,
          scrollDuration: 350,
          scrollOffset: 80,
          spotlightPadding: 8,
          overlayColor: 'rgba(15, 23, 42, 0.5)',
          primaryColor: '#7ab82d',
          textColor: '#1f2937',
          zIndex: 1700,
          buttons: ['back', 'skip', 'primary'],
        }}
        locale={{
          back: 'Quay lại',
          close: 'Đóng',
          last: 'Hoàn tất',
          next: 'Tiếp theo',
          nextWithProgress: 'Tiếp theo ({current}/{total})',
          skip: 'Bỏ qua',
        }}
      />

      <div className="mb-6" data-tour="manager-branch-header">
        <div className="mb-1 flex items-start gap-2">
          <h1 className="text-table-text-primary text-3xl font-bold">
            Quản lý chi nhánh
          </h1>
          <button
            type="button"
            onClick={startBranchTour}
            aria-label="Mở hướng dẫn quản lý chi nhánh"
            title="Hướng dẫn"
            className="text-primary-700 hover:text-primary-800 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
          >
            <HelpOutlineIcon sx={{ fontSize: 18 }} />
          </button>
        </div>
        <p className="text-table-text-secondary text-sm">
          Xem và cập nhật thông tin của {branch?.name ?? 'chi nhánh'} cũng như
          theo dõi tình trạng xác thực, đăng ký và đánh giá của chi nhánh
        </p>
      </div>

      {loading ? (
        <Box className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-600">
          Đang tải thông tin chi nhánh...
        </Box>
      ) : currentBranch ? (
        <Box className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div data-tour="manager-branch-summary">
            {editableInfoRows.map((row) => (
              <BranchDetailRow
                key={row.label}
                label={row.label}
                value={row.value}
                field={row.field}
                editingField={editingField}
                editValue={editValue}
                onStartEdit={handleStartEdit}
                onChangeEditValue={setEditValue}
                onSaveEdit={() => {
                  void handleSaveEdit();
                }}
                onCancelEdit={handleCancelEdit}
                isSaving={savingField}
                disableEditButton={
                  isEditingAddress ||
                  (editingField !== null && editingField !== row.field)
                }
              />
            ))}
          </div>

          <div data-tour="manager-branch-address">
            <BranchAddressMapSection
              currentBranch={currentBranch}
              isEditingAddress={isEditingAddress}
              savingField={savingField}
              addressDraft={addressDraft}
              onAddressDraftChange={setAddressDraft}
              onStartAddressEdit={handleStartAddressEdit}
              onCancelAddressEdit={handleCancelAddressEdit}
              onSaveAddressEdit={() => {
                void handleSaveAddressEdit();
              }}
              disableEditButton={editingField !== null}
            />
          </div>

          <div data-tour="manager-branch-images">
            <BranchImagesSection branch={currentBranch} />
          </div>

          <div data-tour="manager-branch-status">
            {statusInfoRows.map((row) => (
              <BranchDetailRow
                key={row.label}
                label={row.label}
                value={row.value}
                editingField={null}
                editValue=""
                onStartEdit={() => {}}
                onChangeEditValue={() => {}}
                onSaveEdit={() => {}}
                onCancelEdit={() => {}}
                isSaving={false}
              />
            ))}
          </div>
        </Box>
      ) : (
        <Box
          className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-600"
          data-tour="manager-branch-empty"
        >
          Không có chi nhánh nào được phân công cho bạn.
        </Box>
      )}
    </div>
  );
}
