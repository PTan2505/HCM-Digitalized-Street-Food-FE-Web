import useLogin from '@auth/hooks/useLogin';
import { LoginOTPSchema } from '@auth/utils/formSchema';
import { CustomInput } from '@components/CustomInput';
import VerifyOTPForm from '@features/auth/components/customerLogin/VerifyOTPForm';
import type { LoginWithPhoneNumberRequest } from '@features/auth/types/login';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppSelector } from '@hooks/reduxHooks';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { selectIsGeneratedOTP, selectUserStatus } from '@slices/auth';
import type { JSX } from 'react';
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form';
// import logoImage from '@assets/lowca-logo.png';

const initialValues: LoginWithPhoneNumberRequest = { phoneNumber: '', otp: '' };

export const PhoneNumberLoginForm = (): JSX.Element => {
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
    <FormProvider {...methods}>
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
          className="flex w-[400px] flex-col items-center justify-between"
        >
          {/* <img
            src={logoImage}
            alt="Logo"
            className="mb-6 h-[75px] object-contain"
          /> */}
          <Typography className="display-small text-primary-900">
            Đăng nhập
          </Typography>

          <Box className="my-6 flex w-full flex-col gap-2">
            <CustomInput
              control={control}
              name="phoneNumber"
              label="Số điện thoại"
              placeholder="Nhập số điện thoại"
              type="text"
            />
          </Box>

          <Button
            className="text-none body-large h-10 w-full rounded-[20px]"
            type="submit"
            variant="contained"
            color="primary"
          >
            Đăng nhập
          </Button>
        </Box>
      )}
    </FormProvider>
  );
};
