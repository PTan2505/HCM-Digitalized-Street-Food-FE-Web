import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {
  Box,
  IconButton,
  InputAdornment,
  InputBase,
  Typography,
} from '@mui/material';
import { useState, type JSX } from 'react';
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

interface CustomInputProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
}

export const CustomInput = <T extends FieldValues>(
  props: CustomInputProps<T>
): JSX.Element => {
  const { name, control, label, placeholder, type, required } = props;
  const [hidePassword, setHidePassword] = useState(true);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Box className="flex w-full flex-col gap-2">
          <Typography className="title-medium text-primary-900">
            {label}
            {required && (
              <Typography component="span" className="text-required">
                {' '}
                *
              </Typography>
            )}
          </Typography>
          <InputBase
            {...field}
            required={required}
            className={
              field.value?.length > 0 && !fieldState.error
                ? 'border-primary-1000 text-primary-1000'
                : ''
            }
            type={
              type === 'password' ? (hidePassword ? 'password' : 'text') : type
            }
            error={!!fieldState.error}
            placeholder={placeholder}
            endAdornment={
              type === 'password' && (
                <InputAdornment position="end">
                  <IconButton
                    className="p-0"
                    onClick={() => setHidePassword(!hidePassword)}
                  >
                    {hidePassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }
          />

          <Box className="flex h-[19px] justify-between">
            <Typography className="body-medium text-[#FE4763]">
              {fieldState.error?.message}
            </Typography>
            {type === 'password' && (
              <Typography className="body-medium text-primary-600 cursor-pointer underline">
                Quên mật khẩu
              </Typography>
            )}
          </Box>
        </Box>
      )}
    />
  );
};
