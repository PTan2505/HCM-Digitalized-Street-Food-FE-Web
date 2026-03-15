import { z } from 'zod';

export const AddWorkScheduleSchema = z
  .object({
    weekdays: z
      .array(z.number())
      .min(1, 'Vui lòng chọn ít nhất một ngày trong tuần!'),
    openTime: z.string().nonempty('Vui lòng nhập giờ mở cửa!'),
    closeTime: z.string().nonempty('Vui lòng nhập giờ đóng cửa!'),
  })
  .refine(
    (data) =>
      !data.openTime || !data.closeTime || data.closeTime > data.openTime,
    {
      message: 'Giờ đóng cửa phải sau giờ mở cửa!',
      path: ['closeTime'],
    }
  );

export const EditWorkScheduleSchema = z
  .object({
    openTime: z.string().nonempty('Vui lòng nhập giờ mở cửa!'),
    closeTime: z.string().nonempty('Vui lòng nhập giờ đóng cửa!'),
  })
  .refine(
    (data) =>
      !data.openTime || !data.closeTime || data.closeTime > data.openTime,
    {
      message: 'Giờ đóng cửa phải sau giờ mở cửa!',
      path: ['closeTime'],
    }
  );

export type AddWorkScheduleFormData = z.infer<typeof AddWorkScheduleSchema>;
export type EditWorkScheduleFormData = z.infer<typeof EditWorkScheduleSchema>;
