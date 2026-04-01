import { VALIDATE_ERROR_MESSAGES } from '@constants/errorMessage';
import validator from 'validator';
import { z } from 'zod';

export const BadgeFormSchema = z.object({
  badgeName: z
    .string()
    .nonempty(VALIDATE_ERROR_MESSAGES.EMPTY_BADGE_NAME)
    .min(3, VALIDATE_ERROR_MESSAGES.MIN_BADGE_NAME_LENGTH)
    .max(100, VALIDATE_ERROR_MESSAGES.MAX_BADGE_NAME_LENGTH),
  pointToGet: z
    .string()
    .nonempty(VALIDATE_ERROR_MESSAGES.EMPTY_POINT_TO_GET)
    .refine((value) => validator.isInt(value, { min: 1 }), {
      message: VALIDATE_ERROR_MESSAGES.INVALID_POINT_TO_GET,
    })
    .refine((value) => parseInt(value, 10) > 0, {
      message: VALIDATE_ERROR_MESSAGES.MIN_POINT_TO_GET,
    }),
  imageFile: z.any().optional().nullable(),
  description: z
    .string()
    .nonempty(VALIDATE_ERROR_MESSAGES.EMPTY_DESCRIPTION)
    .min(10, VALIDATE_ERROR_MESSAGES.MIN_DESCRIPTION_LENGTH)
    .max(500, VALIDATE_ERROR_MESSAGES.MAX_DESCRIPTION_LENGTH),
});
