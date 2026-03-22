import { z } from 'zod';

export const transferSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, 'Vui long nhap noi dung yeu cau rut tien')
    .max(200, 'Noi dung toi da 200 ky tu'),
  toAccountNumber: z
    .string()
    .trim()
    .regex(/^[0-9]{6,20}$/, 'So tai khoan chi gom 6-20 chu so'),
  toBin: z.string().trim().min(1, 'Vui long chon ngan hang'),
  amount: z
    .number()
    .int('So tien phai la so nguyen')
    .min(1000, 'So tien rut toi thieu la 1,000 VND'),
});

export type RequestTransferFormValues = z.infer<typeof transferSchema>;
