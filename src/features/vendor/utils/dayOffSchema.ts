import { z } from 'zod';

export const AddDayOffSchema = z
  .object({
    startDate: z.string().nonempty('Vui lòng chọn ngày bắt đầu!'),
    endDate: z.string().nonempty('Vui lòng chọn ngày kết thúc!'),
    isAllDay: z.boolean(),
    startTime: z.string().nullable(),
    endTime: z.string().nullable(),
  })
  .refine((d) => !d.startDate || !d.endDate || d.endDate >= d.startDate, {
    message: 'Ngày kết thúc phải từ ngày bắt đầu trở đi!',
    path: ['endDate'],
  })
  .refine((d) => d.isAllDay || !!d.startTime, {
    message: 'Vui lòng nhập giờ bắt đầu!',
    path: ['startTime'],
  })
  .refine((d) => d.isAllDay || !!d.endTime, {
    message: 'Vui lòng nhập giờ kết thúc!',
    path: ['endTime'],
  })
  .refine(
    (d) => {
      if (
        !d.isAllDay &&
        d.startTime &&
        d.endTime &&
        d.startDate === d.endDate
      ) {
        return d.endTime > d.startTime;
      }
      return true;
    },
    { message: 'Giờ kết thúc phải sau giờ bắt đầu!', path: ['endTime'] }
  );

export type AddDayOffFormData = z.infer<typeof AddDayOffSchema>;
