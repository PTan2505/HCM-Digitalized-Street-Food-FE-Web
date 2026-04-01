import { z } from 'zod';

export const RejectFormSchema = z.object({
  reason: z
    .string()
    .min(1, 'Vui lòng nhập lý do từ chối')
    .max(500, 'Lý do không được quá 500 ký tự'),
});
