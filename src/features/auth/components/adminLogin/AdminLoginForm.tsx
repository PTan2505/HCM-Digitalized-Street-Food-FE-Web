import { LoginPasswordSchema } from '@auth/utils/formSchema';
import { CustomInput } from '@components/CustomInput';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppSelector } from '@hooks/reduxHooks';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { selectUserStatus } from '@slices/auth';
import type { JSX } from 'react';
import { useForm } from 'react-hook-form';

interface AdminLoginRequest {
  phoneNumber: string;
  password: string;
}
const initialValues: AdminLoginRequest = { phoneNumber: '', password: '' };

export const AdminLoginForm = (): JSX.Element => {
  const userStatus = useAppSelector(selectUserStatus);

  const { control } = useForm<AdminLoginRequest>({
    defaultValues: initialValues,
    resolver: zodResolver(LoginPasswordSchema),
  });

  // const onSubmit: SubmitHandler<AdminLoginRequest> = async (values) => {
  //   try {
  //     await onLoginSubmit(values, 'moderator');
  //   } catch (error: unknown) {
  //     const err = error as APIErrorResponse;
  //     const errorCode = err.code ?? 'ERR_500_INTERNAL_SERVER_ERROR';
  //     console.error(error);
  //     setError('phoneNumber', {
  //       message:
  //         API_ERROR_MESSAGES[errorCode] ??
  //         'Đã có lỗi xảy ra. Vui lòng thử lại.',
  //     });
  //     setError('password', {});
  //   }
  // };

  return (
    <>
      {userStatus === 'pending' ? (
        <CircularProgress enableTrackSlot size="40px" />
      ) : (
        <Box
          component="form"
          // onSubmit={handleSubmit(onSubmit)}
          className="flex w-[400px] flex-col items-center justify-between"
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
            <CustomInput
              control={control}
              name="password"
              label="Mật khẩu"
              placeholder="Mật khẩu"
              type="password"
            />
          </Box>

          <Button
            type="submit"
            fullWidth
            className="body-large h-10 rounded-[20px] normal-case"
            variant="contained"
            color="primary"
            loadingPosition="start"
          >
            Đăng nhập
          </Button>
        </Box>
      )}
    </>
  );
};
