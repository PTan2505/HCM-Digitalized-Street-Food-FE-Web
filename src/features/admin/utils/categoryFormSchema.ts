import { VALIDATE_ERROR_MESSAGES } from '@constants/errorMessage';
import { z } from 'zod';

export const CategoryFormSchema = z.object({
  name: z
    .string()
    .nonempty(
      VALIDATE_ERROR_MESSAGES.EMPTY_CATEGORY_NAME ||
        'Tên danh mục không được để trống'
    )
    .min(2, 'Tên danh mục phải có ít nhất 2 ký tự')
    .max(255, 'Tên danh mục không được vượt quá 255 ký tự'),
  description: z
    .string()
    .max(500, 'Mô tả không được vượt quá 500 ký tự')
    .nullable()
    .optional(),
});
