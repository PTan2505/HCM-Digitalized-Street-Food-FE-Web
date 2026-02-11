import { Box } from '@mui/material';
import type { JSX } from 'react';

type Props = {
  children: React.ReactNode;
};

export const LoginBoxBlur = (props: Props): JSX.Element => {
  return (
    <Box className="bg-primary-200 flex h-121 w-150 items-center justify-center rounded-[36px] shadow-[0_0_40px_rgba(183,211,189,0.8)]">
      {props.children}
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
