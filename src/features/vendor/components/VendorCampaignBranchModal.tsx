import { useEffect, useMemo, useState, useCallback } from 'react';
import type { JSX } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Checkbox,
  Chip,
  Box,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StorefrontIcon from '@mui/icons-material/Storefront';
import Table from '@features/vendor/components/Table';
import type { VendorCampaign } from '@features/vendor/types/campaign';
import type { Branch } from '@features/vendor/types/vendor';
import useVendorCampaign from '@features/vendor/hooks/useVendorCampaign';

interface VendorCampaignBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: VendorCampaign | null;
  branches: Branch[];
}

export default function VendorCampaignBranchModal({
  isOpen,
  onClose,
  campaign,
  branches,
}: VendorCampaignBranchModalProps): JSX.Element | null {
  const {
    onGetBranchesOfACampaign,
    onAddBranchesToACampaign,
    onRemoveBranchesFromACampaign,
  } = useVendorCampaign();

  const subscribedBranches = useMemo(
    () =>
      branches.filter(
        (branch) => branch.isSubscribed && branch.tierName !== 'Warning'
      ),
    [branches]
  );

  const [initialIds, setInitialIds] = useState<number[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const initialIdSet = useMemo(() => new Set(initialIds), [initialIds]);

  const isDirty = useMemo(() => {
    if (selectedIds.length !== initialIds.length) return true;
    return selectedIds.some((id) => !initialIdSet.has(id));
  }, [initialIds, initialIdSet, selectedIds]);

  const fetchBranches = useCallback(async () => {
    if (!campaign) return;
    setIsLoading(true);
    try {
      const res = await onGetBranchesOfACampaign(campaign.campaignId);
      setInitialIds(res.branchIds ?? []);
      setSelectedIds(res.branchIds ?? []);
    } catch (err) {
      console.error(err);
      setInitialIds([]);
      setSelectedIds([]);
    } finally {
      setIsLoading(false);
    }
  }, [campaign, onGetBranchesOfACampaign]);

  useEffect(() => {
    if (isOpen && campaign) {
      void fetchBranches();
    } else {
      setInitialIds([]);
      setSelectedIds([]);
    }
  }, [isOpen, campaign, fetchBranches]);

  const handleToggle = (branchId: number): void => {
    setSelectedIds((prev) => {
      if (prev.includes(branchId)) {
        if (prev.length === 1) {
          // Bắt buộc phải có ít nhất 1 chi nhánh tham gia
          return prev;
        }
        return prev.filter((id) => id !== branchId);
      }
      return [...prev, branchId];
    });
  };

  const handleSave = async (): Promise<void> => {
    if (!campaign || !isDirty || isSaving) return;
    setIsSaving(true);
    try {
      const addedIds = selectedIds.filter((id) => !initialIdSet.has(id));
      const removedIds = initialIds.filter((id) => !selectedIdSet.has(id));

      const promises = [];
      if (addedIds.length > 0) {
        promises.push(onAddBranchesToACampaign(campaign.campaignId, addedIds));
      }
      if (removedIds.length > 0) {
        promises.push(
          onRemoveBranchesFromACampaign(campaign.campaignId, removedIds)
        );
      }

      await Promise.all(promises);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const columns = [
    {
      key: 'select',
      label: '',
      style: { width: '56px', textAlign: 'center' as const },
      render: (_: unknown, row: Branch): React.ReactNode => (
        <Checkbox
          checked={selectedIdSet.has(row.branchId)}
          onChange={() => handleToggle(row.branchId)}
          size="small"
          sx={{
            color: '#d1d5db',
            '&.Mui-checked': {
              color: 'var(--color-primary-600)',
            },
          }}
        />
      ),
    },
    {
      key: 'name',
      label: 'Tên chi nhánh',
      render: (value: unknown): React.ReactNode => (
        <Box className="flex items-center gap-2">
          <StorefrontIcon fontSize="small" className="text-primary-600" />
          <Box className="text-table-text-primary font-semibold">
            {String(value)}
          </Box>
        </Box>
      ),
    },
    {
      key: 'address',
      label: 'Địa chỉ',
      render: (value: unknown): React.ReactNode => (
        <Box className="text-table-text-secondary block max-w-[400px] truncate">
          {typeof value === 'string' && value.trim() !== '' ? value : '-'}
        </Box>
      ),
    },
    {
      key: 'status',
      label: 'Áp dụng',
      style: { width: '150px' },
      render: (_: unknown, row: Branch): React.ReactNode => {
        const isSelected = selectedIdSet.has(row.branchId);
        return (
          <Chip
            label={isSelected ? 'Đang tham gia' : 'Chưa tham gia'}
            size="small"
            className={
              isSelected
                ? 'border border-green-200 bg-green-50 font-bold text-green-700'
                : 'border border-gray-200 bg-gray-100 font-bold text-gray-500'
            }
          />
        );
      },
    },
  ];

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '85vh',
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, fontWeight: 'bold' }}>
        Quản lý chi nhánh tham gia
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 4 }}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              Chiến dịch:{' '}
              <span className="font-semibold text-gray-800">
                {campaign?.name}
              </span>
            </p>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Tổng chi nhánh: {subscribedBranches.length}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Đang tham gia: {selectedIds.length}
          </span>
        </div>

        <Table
          columns={columns}
          data={subscribedBranches}
          rowKey="branchId"
          loading={isLoading}
          emptyMessage="Không có chi nhánh khả dụng (chưa đăng ký gói)"
          maxHeight="calc(85vh - 280px)"
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Hủy
        </Button>
        <Button
          onClick={() => void handleSave()}
          variant="contained"
          disabled={!isDirty || isSaving || isLoading}
          startIcon={
            isSaving ? (
              <CircularProgress size={20} color="inherit" />
            ) : undefined
          }
          className={
            !isDirty || isSaving || isLoading
              ? 'bg-gray-300 text-gray-500'
              : 'bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)]'
          }
        >
          {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
