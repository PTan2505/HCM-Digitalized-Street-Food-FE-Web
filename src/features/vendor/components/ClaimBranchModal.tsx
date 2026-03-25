import type { JSX } from 'react';
import { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LicenseUploadSection from './LicenseUploadSection';
import useVendor from '../hooks/useVendor';
import type { GhostPin } from '../types/vendor';

interface ClaimBranchModalProps {
  open: boolean;
  onClose: () => void;
  branch: GhostPin | null;
}

export default function ClaimBranchModal({
  open,
  onClose,
  branch,
}: ClaimBranchModalProps): JSX.Element | null {
  const [licenseImages, setLicenseImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { onClaimBranch } = useVendor();

  const handleFileChange = (files: FileList | null): void => {
    if (files) {
      setLicenseImages(Array.from(files));
    } else {
      setLicenseImages([]);
    }
  };

  const handleClose = (): void => {
    setLicenseImages([]);
    onClose();
  };

  const handleSubmit = async (): Promise<void> => {
    if (!branch) return;
    setSubmitting(true);
    try {
      await onClaimBranch({
        branchId: branch.branchId,
        licenseImages,
      });
      handleClose();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <Box
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 transition-opacity"
      onClick={submitting ? undefined : handleClose}
    >
      <Box
        className="mx-4 flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <Box className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-8 py-5">
          <Box className="flex items-center gap-3">
            <Box className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <StorefrontIcon />
            </Box>
            <Box>
              <Typography
                variant="h2"
                className="text-xl font-bold text-[var(--color-table-text-primary)] md:text-2xl"
              >
                Nhận quán: {branch?.name}
              </Typography>
              <Typography className="mt-0.5 text-sm font-medium text-[var(--color-table-text-secondary)]">
                Vui lòng cung cấp hình ảnh giấy phép kinh doanh để xác thực chủ
                sở hữu
              </Typography>
            </Box>
          </Box>

          <IconButton
            size="small"
            onClick={handleClose}
            disabled={submitting}
            sx={{
              bgcolor: 'white',
              border: '1px solid #e5e7eb',
              '&:hover': { bgcolor: '#f3f4f6' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Modal Content */}
        <Box className="flex-1 overflow-y-auto px-8 py-6">
          <LicenseUploadSection
            licenseImages={licenseImages}
            onFileChange={handleFileChange}
            title="Giấy phép kinh doanh"
            required={true}
          />
        </Box>

        {/* Modal Actions */}
        <Box className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/80 px-8 py-5">
          <Button
            onClick={handleClose}
            disabled={submitting}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: 'text.secondary',
              paddingX: 3,
              bgcolor: 'white',
              border: '1px solid #e5e7eb',
              '&:hover': { bgcolor: '#f9fafb', borderColor: '#d1d5db' },
            }}
          >
            Hủy bỏ
          </Button>

          <Button
            onClick={() => void handleSubmit()}
            disabled={submitting || licenseImages.length === 0}
            variant="contained"
            color="primary"
            startIcon={
              submitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              paddingX: 4,
              boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)',
              '&:hover': {
                boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
              },
            }}
          >
            {submitting ? 'Đang xử lý...' : 'Xác nhận nhận quán'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
