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
  numericOnly?: boolean;
  maxLength?: number;
}

export const CustomInput = <T extends FieldValues>(
  props: CustomInputProps<T>
): JSX.Element => {
  const {
    name,
    control,
    label,
    placeholder,
    type,
    required,
    numericOnly,
    maxLength,
  } = props;
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
            onChange={(event) => {
              const nextValue = numericOnly
                ? event.target.value.replace(/\D/g, '')
                : event.target.value;
              field.onChange(nextValue);
            }}
            required={required}
            className={
              field.value?.length > 0 && !fieldState.error
                ? 'text-primary-1000'
                : ''
            }
            type={
              type === 'password' ? (hidePassword ? 'password' : 'text') : type
            }
            error={!!fieldState.error}
            placeholder={placeholder}
            inputProps={{
              inputMode: numericOnly ? 'numeric' : undefined,
              pattern: numericOnly ? '[0-9]*' : undefined,
              maxLength,
            }}
            sx={{
              borderRadius: '9999px',
              border: '1px solid',
              borderColor: fieldState.error
                ? '#FE4763'
                : field.value?.length > 0
                  ? '#9fd356'
                  : '#A8B8A7',
              backgroundColor: '#E9EFE8',
              paddingInline: '14px',
              '&.Mui-focused': {
                borderColor: '#9fd356',
                boxShadow: '0 0 0 2px rgba(159, 211, 86, 0.2)',
              },
              '& .MuiInputBase-input': {
                padding: '10px 0',
                color: '#547c1c',
                fontWeight: 800,
              },
              '& .MuiInputBase-input::placeholder': {
                color: '#B8C3B7',
                opacity: 1,
              },
            }}
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

          <Box className="flex h-4.75 justify-between">
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
