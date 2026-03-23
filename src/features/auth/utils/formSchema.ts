import { VALIDATE_ERROR_MESSAGES } from '@constants/errorMessage';
import validator from 'validator';
import { z } from 'zod';

export const LoginOTPSchema = z.object({
  phoneNumber: z
    .string()
    .nonempty(VALIDATE_ERROR_MESSAGES.EMPTY_PHONE_NUMBER)
    .refine((value) => validator.isMobilePhone(value, 'vi-VN'), {
      error: VALIDATE_ERROR_MESSAGES.INVALID_PHONE_NUMBER,
    }),
  otp: z.string().optional(),
});

export const LoginPasswordSchema = z.object({
  phoneNumber: z
    .string()
    .nonempty(VALIDATE_ERROR_MESSAGES.EMPTY_PHONE_NUMBER)
    .refine((value) => validator.isMobilePhone(value, 'vi-VN'), {
      error: VALIDATE_ERROR_MESSAGES.INVALID_PHONE_NUMBER,
    }),

  password: z.string().nonempty(VALIDATE_ERROR_MESSAGES.EMPTY_PASSWORD),
});
