import { VALIDATE_ERROR_MESSAGES } from '@constants/errorMessage';
import { z } from 'zod';

export const TasteFormSchema = z.object({
  name: z
    .string()
    .nonempty(VALIDATE_ERROR_MESSAGES.EMPTY_TASTE_NAME)
    .min(3, VALIDATE_ERROR_MESSAGES.MIN_TASTE_NAME_LENGTH)
    .max(100, VALIDATE_ERROR_MESSAGES.MAX_TASTE_NAME_LENGTH),
  description: z
    .string()
    .nonempty(VALIDATE_ERROR_MESSAGES.EMPTY_TASTE_DESCRIPTION)
    .min(10, VALIDATE_ERROR_MESSAGES.MIN_TASTE_DESCRIPTION_LENGTH)
    .max(500, VALIDATE_ERROR_MESSAGES.MAX_TASTE_DESCRIPTION_LENGTH),
});
