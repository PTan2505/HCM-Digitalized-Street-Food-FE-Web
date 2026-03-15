import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
} from '@mui/material';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useNavigate, useSearchParams } from 'react-router';
import { ROUTES } from '@constants/routes';
import { axiosApi } from '@lib/api/apiInstance';

export default function PaymentCancel(): JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [confirming, setConfirming] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code') ?? undefined;
    const id = searchParams.get('id') ?? undefined;
    const status = searchParams.get('status') ?? undefined;
    const orderCodeRaw = searchParams.get('orderCode');
    const orderCode = orderCodeRaw ? Number(orderCodeRaw) : NaN;

    void (async (): Promise<void> => {
      try {
        if (!isNaN(orderCode)) {
          await axiosApi.paymentApi.confirmPayment({
            code,
            orderCode,
            status,
            transactionId: id,
          });
        }
        setConfirmed(true);
      } catch {
        setErrorMsg(
          'Không thể xác nhận trạng thái thanh toán. Vui lòng liên hệ hỗ trợ.'
        );
      } finally {
        setConfirming(false);
      }
    })();
  }, []);

  return (
    <Box
      className="flex min-h-screen items-center justify-center"
      sx={{ background: 'linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%)' }}
    >
      <Paper
        elevation={3}
        sx={{
          borderRadius: 4,
          p: { xs: 4, sm: 6 },
          maxWidth: 480,
          width: '100%',
          textAlign: 'center',
          mx: 2,
        }}
      >
        {confirming ? (
          <>
            <CircularProgress size={56} sx={{ color: '#f53425', mb: 3 }} />
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{ color: '#b91c1c', fontFamily: 'Nunito, sans-serif' }}
            >
              Đang xử lý...
            </Typography>
          </>
        ) : errorMsg ? (
          <>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 96,
                height: 96,
                borderRadius: '50%',
                bgcolor: '#ffe5e5',
                mb: 3,
              }}
            >
              <ErrorOutlineIcon sx={{ fontSize: 56, color: '#f53425' }} />
            </Box>
            <Typography
              variant="h5"
              fontWeight={700}
              gutterBottom
              sx={{ color: '#b91c1c', fontFamily: 'Nunito, sans-serif' }}
            >
              Xác nhận thất bại
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: '#6b7280', mb: 4, fontFamily: 'Nunito, sans-serif' }}
            >
              {errorMsg}
            </Typography>
          </>
        ) : (
          <>
            {/* Icon */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 96,
                height: 96,
                borderRadius: '50%',
                bgcolor: '#ffe5e5',
                mb: 3,
              }}
            >
              <CancelOutlinedIcon sx={{ fontSize: 56, color: '#f53425' }} />
            </Box>

            {/* Title */}
            <Typography
              variant="h5"
              fontWeight={700}
              gutterBottom
              sx={{ color: '#b91c1c', fontFamily: 'Nunito, sans-serif' }}
            >
              Thanh toán thất bại
            </Typography>

            {/* Subtitle */}
            <Typography
              variant="body1"
              sx={{
                color: '#6b7280',
                mb: 4,
                fontFamily: 'Nunito, sans-serif',
              }}
            >
              Giao dịch của bạn đã bị hủy hoặc không thể hoàn tất. Vui lòng thử
              lại hoặc liên hệ hỗ trợ.
            </Typography>
          </>
        )}

        {/* Divider + Actions — always shown after confirming */}
        {!confirming && (
          <>
            <Box sx={{ height: 1, bgcolor: '#fecaca', mb: 4 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={() =>
                  void navigate(
                    `${ROUTES.VENDOR.BASE}/${ROUTES.VENDOR.PATHS.BRANCH}`
                  )
                }
                sx={{
                  bgcolor: '#f53425',
                  '&:hover': { bgcolor: '#c0392b' },
                  borderRadius: 2,
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 700,
                  py: 1.5,
                  textTransform: 'none',
                }}
              >
                {confirmed ? 'Về trang chính' : 'Thử lại thanh toán'}
              </Button>
              {/* <Button
                variant="outlined"
                fullWidth
                size="large"
                onClick={() => void navigate(`${ROUTES.VENDOR.BASE}`)}
                sx={{
                  borderColor: '#f53425',
                  color: '#f53425',
                  '&:hover': { borderColor: '#c0392b', bgcolor: '#ffe5e5' },
                  borderRadius: 2,
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 600,
                  py: 1.5,
                  textTransform: 'none',
                }}
              >
                Về trang chính
              </Button> */}
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}
