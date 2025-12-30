import VerifyOTPForm from '@features/auth/components/customerLogin/VerifyOTPForm';
import useLogin from '@auth/hooks/useLogin';
import { LoginOTPSchema } from '@auth/utils/formSchema';
import { CustomInput } from '@components/CustomInput';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppSelector } from '@hooks/reduxHooks';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { selectIsGeneratedOTP, selectUserStatus } from '@slices/auth';
import type { JSX } from 'react';
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form';

interface CustomerLoginRequest {
  phoneNumber: string;
  otp?: string;
}

const initialValues: CustomerLoginRequest = { phoneNumber: '', otp: '' };

export const CustomerLoginForm = (): JSX.Element => {
  const isGeneratedOTP = useAppSelector(selectIsGeneratedOTP);
  const userStatus = useAppSelector(selectUserStatus);
  const { onLoginSubmit } = useLogin();

  const methods = useForm<CustomerLoginRequest>({
    defaultValues: initialValues,
    resolver: zodResolver(LoginOTPSchema),
  });

  const { control, handleSubmit, getValues, setError } = methods;
  const onSubmit: SubmitHandler<CustomerLoginRequest> = async (values) => {
    try {
      await onLoginSubmit(values, 'customer');
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
        <VerifyOTPForm<CustomerLoginRequest>
          phoneNumber={getValues('phoneNumber')}
          name="otp"
          onSubmit={onSubmit}
        />
      ) : (
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '400px',
          }}
        >
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
