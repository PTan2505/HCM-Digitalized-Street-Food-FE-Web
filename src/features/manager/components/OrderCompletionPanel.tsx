import type { ChangeEvent, JSX } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';

export const OrderCompletionPanel = ({
  verificationCode,
  orderId,
  isCompletingByCode,
  completeMessage,
  onVerificationCodeChange,
  onOrderIdChange,
  onCompleteOrderByCode,
}: {
  verificationCode: string;
  orderId: string;
  isCompletingByCode: boolean;
  completeMessage: string;
  onVerificationCodeChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onOrderIdChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onCompleteOrderByCode: () => Promise<void>;
}): JSX.Element => {
  const isDisabled =
    verificationCode.length !== 6 ||
    orderId.trim() === '' ||
    Number(orderId) <= 0 ||
    isCompletingByCode;

  return (
    <Box className="mb-4 flex flex-wrap items-start gap-3 rounded-xl border border-gray-100 bg-slate-50/60 p-4">
      <TextField
        label="Mã đơn hàng"
        placeholder="Nhập mã đơn"
        value={orderId}
        onChange={onOrderIdChange}
        size="small"
        className="w-full max-w-40"
        inputProps={{
          inputMode: 'numeric',
          pattern: '[0-9]*',
        }}
        sx={{
          '& .MuiInputLabel-root': {
            color: 'var(--color-primary-700)',
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: 'var(--color-primary-700)',
          },
          '& .MuiOutlinedInput-root': {
            color: 'var(--color-primary-700)',
            fontWeight: 700,
            backgroundColor: 'transparent',
            borderRadius: 1,
            padding: 0,
            height: 'auto',
            '&.Mui-focused': {
              color: 'var(--color-primary-700)',
            },
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--color-primary-600)',
          },
          '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--color-primary-700)',
          },
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline':
            {
              borderColor: 'var(--color-primary-600)',
            },
        }}
      />
      <TextField
        label="Mã xác minh"
        placeholder="Nhập 6 số"
        value={verificationCode}
        onChange={onVerificationCodeChange}
        size="small"
        className="w-full max-w-40"
        inputProps={{
          maxLength: 6,
          inputMode: 'numeric',
          pattern: '[0-9]*',
        }}
        sx={{
          '& .MuiInputLabel-root': {
            color: 'var(--color-primary-700)',
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: 'var(--color-primary-700)',
          },
          '& .MuiOutlinedInput-root': {
            color: 'var(--color-primary-700)',
            fontWeight: 700,
            backgroundColor: 'transparent',
            borderRadius: 1,
            padding: 0,
            height: 'auto',
            '&.Mui-focused': {
              color: 'var(--color-primary-700)',
            },
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--color-primary-600)',
          },
          '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--color-primary-700)',
          },
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline':
            {
              borderColor: 'var(--color-primary-600)',
            },
        }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={() => void onCompleteOrderByCode()}
        disabled={isDisabled}
        className="bg-primary-600 hover:bg-primary-700 h-10 font-bold whitespace-nowrap text-white"
      >
        Hoàn tất đơn
      </Button>
      <Typography className="text-table-text-secondary pt-2 text-sm">
        Nhập mã đơn và 6 số xác minh từ khách hàng để hoàn tất đơn hàng.
      </Typography>
      {completeMessage !== '' ? (
        <Typography
          className={`w-full text-sm ${completeMessage.includes('thành công') ? 'text-green-700' : 'text-red-600'}`}
        >
          {completeMessage}
        </Typography>
      ) : null}
    </Box>
  );
};
