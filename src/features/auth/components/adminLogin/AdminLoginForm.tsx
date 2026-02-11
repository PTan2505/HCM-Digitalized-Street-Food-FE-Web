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

  const { control, handleSubmit, setError } = useForm<AdminLoginRequest>({
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

          <Box
            sx={{
              gap: '8px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              my: '24px',
            }}
          >
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
            sx={{
              borderRadius: '20px',
              height: '40px',
              textTransform: 'none',
            }}
            variant="contained"
            color="primary"
            loadingPosition="start"
            className="body-large"
          >
            Đăng nhập
          </Button>
        </Box>
      )}
    </>
  );
};
