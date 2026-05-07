import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  CircularProgress,
} from '@mui/material';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import MapLocationPicker from '@features/vendor/components/MapLocationPicker';
import type { BranchRegisterRequest } from '@features/moderator/types/branch';
import AppModalHeader from '@components/AppModalHeader';

interface BranchLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: BranchRegisterRequest | null;
  onClaim?: (registration: BranchRegisterRequest) => Promise<void>;
  isClaiming?: boolean;
}

const BranchLocationModal: React.FC<BranchLocationModalProps> = ({
  isOpen,
  onClose,
  registration,
  onClaim,
  isClaiming = false,
}) => {
  if (!registration) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        },
      }}
    >
      <AppModalHeader
        title="Vị trí chi nhánh"
        subtitle={registration.branch.name}
        icon={<LocationOnOutlinedIcon />}
        iconTone="category"
        onClose={onClose}
      />
      <DialogContent sx={{ p: 4 }}>
        {/* Info Card */}
        <Box
          sx={{
            mb: 4,
            p: 3,
            borderRadius: '16px',
            bgcolor: '#f8fafc',
            border: '1px solid #f1f5f9',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="caption"
              sx={{
                textTransform: 'uppercase',
                fontWeight: 800,
                letterSpacing: '0.05em',
                color: '#64748b',
                mb: 0.5,
                display: 'block',
              }}
            >
              Địa chỉ
            </Typography>
            <Typography
              variant="body1"
              sx={{ fontWeight: 600, color: '#1e293b' }}
            >
              {registration.branch.addressDetail}
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="caption"
                sx={{
                  textTransform: 'uppercase',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  color: '#64748b',
                  mb: 0.5,
                  display: 'block',
                }}
              >
                Phường / Xã
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontWeight: 500, color: '#1e293b' }}
              >
                {registration.branch.ward}
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="caption"
                sx={{
                  textTransform: 'uppercase',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  color: '#64748b',
                  mb: 0.5,
                  display: 'block',
                }}
              >
                Thành Phố
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontWeight: 500, color: '#1e293b' }}
              >
                {registration.branch.city}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Map Section */}
        <Box
          sx={{
            borderRadius: '20px',
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            position: 'relative',
          }}
        >
          <MapLocationPicker
            address={`${registration.branch.addressDetail}, ${registration.branch.ward}, ${registration.branch.city}`}
            latitude={registration.branch.lat}
            longitude={registration.branch.long}
            onLocationChange={() => {}}
            hideWarnings={true}
            readonly={true}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(4px)',
              px: 2,
              py: 1,
              borderRadius: '12px',
              border: '1px solid #f1f5f9',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: '#64748b' }}
            >
              Tọa độ: {registration.branch.lat.toFixed(6)},{' '}
              {registration.branch.long.toFixed(6)}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #f1f5f9' }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            px: 3,
            color: '#64748b',
            borderColor: '#e2e8f0',
            '&:hover': { bgcolor: '#f1f5f9', borderColor: '#cbd5e1' },
          }}
        >
          Đóng
        </Button>
        {onClaim && (
          <Button
            onClick={() => onClaim(registration)}
            variant="contained"
            disabled={isClaiming}
            color="warning"
            startIcon={
              isClaiming ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <AssignmentIndIcon />
              )
            }
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              px: 3,
              boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.3)',
              '&:hover': {
                boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.4)',
              },
            }}
          >
            Nhận đơn
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BranchLocationModal;
