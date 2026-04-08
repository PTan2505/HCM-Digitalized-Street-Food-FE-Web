import { z } from 'zod';

export const transferSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập nội dung yêu cầu rút tiền')
    .max(200, 'Nội dung tối đa 200 ký tự'),
  toAccountNumber: z
    .string()
    .trim()
    .regex(/^[0-9]{6,20}$/, 'Số tài khoản chỉ gồm 6-20 chữ số'),
  toBin: z.string().trim().min(1, 'Vui lòng chọn ngân hàng'),
  amount: z
    .number()
    .int('Số tiền phải là số nguyên')
    .min(1000, 'Số tiền rút tối thiểu là 1.000 VNĐ'),
});

export type RequestTransferFormValues = z.infer<typeof transferSchema>;
