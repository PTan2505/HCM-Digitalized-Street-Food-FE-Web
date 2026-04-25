import { z } from 'zod';

export const AddDayOffSchema = z
  .object({
    startDate: z.string().nonempty('Vui lòng chọn ngày bắt đầu!'),
    endDate: z.string().nonempty('Vui lòng chọn ngày kết thúc!'),
  })
  .refine((d) => !d.startDate || !d.endDate || d.endDate > d.startDate, {
    message: 'Thời điểm kết thúc phải sau thời điểm bắt đầu!',
    path: ['endDate'],
  });

export type AddDayOffFormData = z.infer<typeof AddDayOffSchema>;
