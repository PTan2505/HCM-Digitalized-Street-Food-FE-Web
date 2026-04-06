import type { JSX } from 'react';
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import lightLogo from '../../../assets/ios-light.png';

export default function DeepLinkRedirectPage(): JSX.Element {
  const { pathname, search } = useLocation();
  const attempted = useRef(false);

  const deepLink = `lowca:/${pathname}${search}`;

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;
    window.location.href = deepLink;
  }, [deepLink]);

  return (
    <Box className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-6 text-center">
      <img src={lightLogo} alt="Lowca" className="h-20 w-20 object-contain" />
      <Typography variant="h5" fontWeight={700}>
        Mở trong ứng dụng Lowca
      </Typography>
      <Typography color="text.secondary" className="max-w-xs">
        Nếu ứng dụng chưa tự mở, hãy nhấn nút bên dưới.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        href={deepLink}
        sx={{ borderRadius: 2, fontWeight: 700, px: 4, height: 48 }}
      >
        Mở ứng dụng
      </Button>
    </Box>
  );
}
