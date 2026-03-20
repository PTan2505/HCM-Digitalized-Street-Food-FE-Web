import { useAppDispatch } from '@hooks/reduxHooks';
import {
  Box,
  Button,
  FormHelperText,
  Link,
  styled,
  Typography,
} from '@mui/material';
import { changeAccount, userLoginWithPhoneNumber } from '@slices/auth';
import { MuiOtpInput } from 'mui-one-time-password-input';
import { type JSX } from 'react';
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
};

const CustomOTPInput = styled(MuiOtpInput)({
  gap: '8px',
  justifyContent: 'center',

  '& .MuiInputBase-root.MuiOutlinedInput-root ': {
    width: '40px',
    height: '48px',
    padding: '0px',
    borderRadius: '10px',
    border: '1px solid #7FAE9B',
    '& .MuiInputBase-input': {
      padding: '0px',
      color: '#547c1c',
      fontWeight: 800,
    },
    '&.Mui-focused': {
      color: '#14143D',
      borderColor: '#7FAE9B',
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
      color: '#14143D',
      borderColor: '#7FAE9B',
    },
  },

  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
});

const VerifyOTPForm = <T extends FieldValues>(props: Props<T>): JSX.Element => {
  const { phoneNumber, name, onSubmit } = props;
  const { control, handleSubmit } = useFormContext<T>();
  const dispatch = useAppDispatch();

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

  return (
    <Box className="flex w-[400px] flex-col items-center justify-center gap-6">
      <Typography className="display-small text-primary-900">
        Nhập mã OTP
      </Typography>
      <Typography className="body-large text-primary-900">
        Mã OTP đã được gửi tới số điện thoại {''}
        <Typography className="label-large" component="span">
          {secretPhoneNumber()}
        </Typography>
      </Typography>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => {
          return (
            <Box>
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
                <FormHelperText error>
                  {fieldState.error.message}
                </FormHelperText>
              )}
            </Box>
          );
        }}
      />
      <Typography className="body-large text-primary-900">
        Bạn chưa nhận được mã OTP?{' '}
        <Link
          className="label-large text-primary-900"
          component="button"
          type="button"
          onClick={async () =>
            await dispatch(
              userLoginWithPhoneNumber({ phoneNumber: phoneNumber })
            ).unwrap()
          }
        >
          Gửi lại mã
        </Link>
      </Typography>
      <Button
        type="submit"
        fullWidth
        disabled={disabledSubmitButton}
        className="body-large h-10 rounded-[20px] normal-case"
        variant="contained"
        color="primary"
        onClick={handleSubmit(onSubmit)}
      >
        Đăng nhập
      </Button>
      <Link
        className="body-large text-primary-700 font-bold"
        component="button"
        onClick={() => dispatch(changeAccount())}
      >
        Bạn muốn đổi tài khoản?
      </Link>
    </Box>
  );
};

export default VerifyOTPForm;
