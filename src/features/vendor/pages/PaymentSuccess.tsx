import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useNavigate, useSearchParams } from 'react-router';
import { ROUTES } from '@constants/routes';
import { axiosApi } from '@lib/api/apiInstance';

export default function PaymentSuccess(): JSX.Element {
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

    if (isNaN(orderCode)) {
      setErrorMsg('Thông tin đơn hàng không hợp lệ.');
      return;
    }

    void (async (): Promise<void> => {
      try {
        await axiosApi.paymentApi.confirmPayment({
          code,
          orderCode,
          status,
          transactionId: id,
        });
        setConfirmed(true);
      } catch {
        setErrorMsg('Không thể xác nhận thanh toán. Vui lòng liên hệ hỗ trợ.');
      } finally {
        setConfirming(false);
      }
    })();
  }, []);

  return (
    <Box
      className="flex min-h-screen items-center justify-center"
      sx={{ background: 'linear-gradient(135deg, #f0f9e8 0%, #d9f0c2 100%)' }}
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
            <CircularProgress size={56} sx={{ color: '#7ab82d', mb: 3 }} />
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{ color: '#2c5e1a', fontFamily: 'Nunito, sans-serif' }}
            >
              Đang xác nhận thanh toán...
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
                bgcolor: '#d9f0c2',
                mb: 3,
              }}
            >
              <CheckCircleOutlineIcon sx={{ fontSize: 56, color: '#7ab82d' }} />
            </Box>

            {/* Title */}
            <Typography
              variant="h5"
              fontWeight={700}
              gutterBottom
              sx={{ color: '#2c5e1a', fontFamily: 'Nunito, sans-serif' }}
            >
              Thanh toán thành công!
            </Typography>

            {/* Subtitle */}
            <Typography
              variant="body1"
              sx={{ color: '#5a9e3f', mb: 4, fontFamily: 'Nunito, sans-serif' }}
            >
              Giao dịch của bạn đã được xử lý thành công. Cảm ơn bạn đã sử dụng
              dịch vụ!
            </Typography>
          </>
        )}

        {/* Divider */}
        {!confirming && (
          <>
            <Box sx={{ height: 1, bgcolor: '#c1e89a', mb: 4 }} />

            {/* Actions */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={() => void navigate(`${ROUTES.VENDOR.BASE}`)}
                sx={{
                  bgcolor: '#7ab82d',
                  '&:hover': { bgcolor: '#5f9324' },
                  borderRadius: 2,
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 700,
                  py: 1.5,
                  textTransform: 'none',
                }}
              >
                {confirmed ? 'Quay lại trang chi nhánh' : 'Về trang chi nhánh'}
              </Button>

              <Button
                variant="outlined"
                fullWidth
                size="large"
                onClick={() => void navigate(`${ROUTES.VENDOR.BASE}`)}
                sx={{
                  borderColor: '#7ab82d',
                  color: '#7ab82d',
                  '&:hover': { borderColor: '#5f9324', bgcolor: '#f0f9e8' },
                  borderRadius: 2,
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 600,
                  py: 1.5,
                  textTransform: 'none',
                }}
              >
                Về trang tổng quan
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}
