import useLogin from '@auth/hooks/useLogin';
import { LoginOTPSchema } from '@auth/utils/formSchema';
import { CustomInput } from '@components/CustomInput';
import VerifyOTPForm from '@features/auth/components/customerLogin/VerifyOTPForm';
import type { LoginWithPhoneNumberRequest } from '@features/auth/types/login';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppSelector } from '@hooks/reduxHooks';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Typography,
} from '@mui/material';
import { selectIsGeneratedOTP, selectUserStatus } from '@slices/auth';
import type { JSX } from 'react';
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form';

const initialValues: LoginWithPhoneNumberRequest = { phoneNumber: '', otp: '' };

type Props = {
  onBack: () => void;
};

export const PhoneNumberLoginForm = ({ onBack }: Props): JSX.Element => {
  const isGeneratedOTP = useAppSelector(selectIsGeneratedOTP);
  const userStatus = useAppSelector(selectUserStatus);
  const { onPhoneNumberLoginSubmit, onVerifyPhoneNumberSubmit } = useLogin();

  const methods = useForm<LoginWithPhoneNumberRequest>({
    defaultValues: initialValues,
    resolver: zodResolver(LoginOTPSchema),
  });

  const { control, handleSubmit, getValues, setError } = methods;
  const onSubmit: SubmitHandler<LoginWithPhoneNumberRequest> = async (
    values
  ) => {
    try {
      if (!isGeneratedOTP) {
        await onPhoneNumberLoginSubmit(values);
      } else {
        await onVerifyPhoneNumberSubmit(
          values as { phoneNumber: string; otp: string }
        );
      }
    } catch (error: unknown) {
      // const err = error as APIErrorResponse;
      // const errorCode = err.code ?? 'ERR_500_INTERNAL_SERVER_ERROR';
      console.error(error);
      setError('otp', { message: 'Mã OTP không đúng. Vui lòng thử lại.' });
    }
  };

  return (
    <Box className="w-full">
      <Box className="mb-6 flex items-center">
        <IconButton
          onClick={onBack}
          className="text-primary-900 mr-2"
          aria-label="Quay lại"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography className="title-lg text-[#103b1c]">
          {isGeneratedOTP ? 'Xác thực OTP' : 'Tiếp tục với số điện thoại'}
        </Typography>
      </Box>

      <FormProvider {...methods}>
        <Box className="flex w-full flex-col items-center justify-center">
          {userStatus === 'pending' ? (
            <CircularProgress enableTrackSlot size="40px" />
          ) : isGeneratedOTP ? (
            <VerifyOTPForm<LoginWithPhoneNumberRequest>
              phoneNumber={getValues('phoneNumber')}
              name="otp"
              onSubmit={onSubmit}
            />
          ) : (
            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              className="flex w-full flex-col items-center justify-between"
            >
              <Typography className="body-medium mb-6 w-full text-left text-[#3d6647]">
                Vui lòng nhập số điện thoại của bạn để đăng nhập vào hộp điều
                khiển dành cho Đối tác.
              </Typography>

              <Box className="mb-1 flex w-full flex-col gap-2">
                <CustomInput
                  control={control}
                  name="phoneNumber"
                  label="Số điện thoại"
                  placeholder="Nhập số điện thoại (VD: 0912345678)"
                  type="tel"
                  numericOnly
                  maxLength={10}
                />
              </Box>

              <Button
                className="text-none body-large h-12 w-full rounded-full"
                type="submit"
                variant="contained"
                color="primary"
                disableElevation
              >
                Tiếp tục
              </Button>
            </Box>
          )}
        </Box>
      </FormProvider>
    </Box>
  );
};
