import { Box } from '@mui/material';
import type { JSX } from 'react';

type Props = {
  children: React.ReactNode;
};

export const LoginBoxBlur = (props: Props): JSX.Element => {
  return (
    <Box className="relative flex min-h-[420px] w-full max-w-140 items-center justify-center overflow-hidden rounded-3xl border border-white/50 bg-white/20 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:min-h-[520px] sm:rounded-[40px] sm:p-8 md:p-10 lg:min-h-147.5">
      {/* Hiệu ứng bóng kính (Liquid Glass highlight) */}
      <div className="pointer-events-none absolute -top-[50%] -left-[50%] h-[200%] w-[200%] rotate-45 bg-linear-to-b from-white/30 to-transparent opacity-40 mix-blend-overlay" />

      <Box className="relative z-10 w-full">{props.children}</Box>
    </Box>
  );
};

export const NewCustomerProfileBox = (props: Props): JSX.Element => {
  return (
    <Box className="flex h-188 w-148 items-center justify-center rounded-[36px] border-[rgba(72,136,134,0.4)] bg-[rgba(249,255,249,1)] shadow-[0_0_40px_rgba(246,246,246,0.8)]">
      {props.children}
    </Box>
  );
};
