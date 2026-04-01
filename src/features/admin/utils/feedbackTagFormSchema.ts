import { z } from 'zod';

export const FeedbackTagFormSchema = z.object({
  tagName: z
    .string()
    .nonempty('Vui lòng nhập tên tag!')
    .min(3, 'Tên tag phải có ít nhất 3 ký tự!')
    .max(100, 'Tên tag không được vượt quá 100 ký tự!'),
  description: z
    .string()
    .nonempty('Vui lòng nhập mô tả!')
    .min(10, 'Mô tả phải có ít nhất 10 ký tự!')
    .max(500, 'Mô tả không được vượt quá 500 ký tự!'),
});
