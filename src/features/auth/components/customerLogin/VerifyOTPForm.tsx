import { useAppDispatch } from '@hooks/reduxHooks';
import {
  Box,
  Button,
  FormHelperText,
  Link,
  styled,
  Typography,
} from '@mui/material';
import { changeAccount } from '@slices/auth';
import { MuiOtpInput } from 'mui-one-time-password-input';
import { type JSX, useEffect, useState } from 'react';
import {
  Controller,
  useFormContext,
  useWatch,
  type FieldPath,
  type FieldValues,
  type SubmitHandler,
} from 'react-hook-form';
import validator from 'validator';

type Props<T extends FieldValues> = {
  phoneNumber: string;
  name: FieldPath<T>;
  onSubmit: SubmitHandler<T>;
  onResend: () => Promise<void>;
};

const RESEND_COOLDOWN_SECONDS = 6 * 60;

const CustomOTPInput = styled(MuiOtpInput)({
  gap: '10px',
  justifyContent: 'center',

  '& .MuiInputBase-root.MuiOutlinedInput-root ': {
    width: '48px',
    height: '56px',
    padding: '0px',
    borderRadius: '14px',
    border: '1px solid #8FB89A',
    background: 'rgba(255,255,255,0.72)',
    transition: 'all .2s ease',
    '& .MuiInputBase-input': {
      padding: '0px',
      color: '#2f5f3c',
      fontWeight: 800,
      fontSize: '1.1rem',
    },
    '&.Mui-focused': {
      borderColor: '#9FD356',
      boxShadow: '0 0 0 2px rgba(159,211,86,.22)',
    },
  },

  '& .disabled': {
    '& .MuiInputBase-root.MuiOutlinedInput-root ': {
      border: 'none',
      background: 'none',
      '& .Mui-disabled': {
        WebkitTextFillColor: '#14143D',
        opacity: 1,
      },
    },
  },

  '& .is-filled': {
    '& .MuiInputBase-root.MuiOutlinedInput-root ': {
      color: '#2f5f3c',
      borderColor: '#9FD356',
      background: '#F2F8ED',
    },
  },

  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
});

const VerifyOTPForm = <T extends FieldValues>(props: Props<T>): JSX.Element => {
  const { phoneNumber, name, onSubmit, onResend } = props;
  const { control, handleSubmit } = useFormContext<T>();
  const dispatch = useAppDispatch();
  const [remainingSeconds, setRemainingSeconds] = useState<number>(
    RESEND_COOLDOWN_SECONDS
  );
  const [isResending, setIsResending] = useState<boolean>(false);

  useEffect(() => {
    if (remainingSeconds <= 0) return;

    const interval = window.setInterval(() => {
      setRemainingSeconds((previous) => {
        if (previous <= 1) {
          window.clearInterval(interval);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return function cleanupTimer(): void {
      window.clearInterval(interval);
    };
  }, [remainingSeconds]);

  const disabledSubmitButton = useWatch({
    name,
    control,
    compute: (otp: string) => {
      if (otp?.length < 6) return true;

      return false;
    },
  });

  const secretPhoneNumber = (): string => {
    const phoneNumberArray = phoneNumber.split('');
    for (let i = 0; i < phoneNumber.length; i++) {
      if (i >= 3 && i < phoneNumber.length - 3) {
        phoneNumberArray[i] = '*';
      }
    }

    return phoneNumberArray.join('');
  };

  const formatRemainingTime = (): string => {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
      2,
      '0'
    )}`;
  };

  const handleResendOtp = async (): Promise<void> => {
    if (remainingSeconds > 0 || isResending) return;

    setIsResending(true);
    try {
      await onResend();
      setRemainingSeconds(RESEND_COOLDOWN_SECONDS);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Box className="flex w-full max-w-xl flex-col items-center justify-center gap-5">
      {/* <Typography className="title-xl text-[#103b1c]">Nhập mã OTP</Typography> */}
      <Typography className="body-large text-center text-[#3d6647]">
        Mã OTP đã được gửi tới số điện thoại {''}
        <Typography
          className="label-large font-bold text-[#103b1c]"
          component="span"
        >
          {secretPhoneNumber()}
        </Typography>
      </Typography>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => {
          return (
            <Box className="w-full">
              <CustomOTPInput
                {...field}
                TextFieldsProps={(index) => {
                  return {
                    className: field.value[index] ? 'is-filled' : '',
                    placeholder: '-',
                  };
                }}
                autoFocus
                value={field.value}
                validateChar={(value) => validator.isNumeric(value)}
                length={6}
              />
              {fieldState.error && (
                <FormHelperText className="mt-2 text-center" error>
                  {fieldState.error.message}
                </FormHelperText>
              )}
            </Box>
          );
        }}
      />
      <Typography
        className="body-large flex w-full flex-wrap items-center justify-center gap-2 text-[#3d6647]"
        component="div"
      >
        <Box component="span">Bạn chưa nhận được mã OTP?</Box>
        <Link
          className="label-large font-semibold"
          component="button"
          type="button"
          underline="none"
          onClick={handleResendOtp}
          aria-disabled={remainingSeconds > 0 || isResending}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 34,
            px: 1.5,
            borderRadius: '999px',
            border: '1px solid',
            borderColor:
              remainingSeconds > 0 || isResending ? '#b9cfbe' : '#6ea57c',
            backgroundColor:
              remainingSeconds > 0 || isResending ? '#f1f7f2' : '#e7f4ea',
            color: remainingSeconds > 0 || isResending ? '#6c8974' : '#2f6f3b',
            pointerEvents:
              remainingSeconds > 0 || isResending ? 'none' : 'auto',
            transition: 'all .2s ease',
            '&:hover': {
              backgroundColor: '#dbefdf',
              borderColor: '#5f966e',
            },
          }}
        >
          {remainingSeconds > 0
            ? `Gửi lại mã sau ${formatRemainingTime()}`
            : 'Gửi lại mã'}
        </Link>
      </Typography>
      <Button
        type="submit"
        fullWidth
        disabled={disabledSubmitButton}
        className="body-large h-12 rounded-full normal-case"
        variant="contained"
        color="primary"
        disableElevation
        onClick={handleSubmit(onSubmit)}
      >
        Đăng nhập
      </Button>
      <Link
        className="body-large font-bold text-[#4B8D2B]"
        component="button"
        onClick={() => dispatch(changeAccount())}
      >
        Bạn muốn đổi tài khoản?
      </Link>
    </Box>
  );
};

export default VerifyOTPForm;
