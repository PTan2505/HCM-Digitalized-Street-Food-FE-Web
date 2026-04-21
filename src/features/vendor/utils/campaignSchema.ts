import { z } from 'zod';

export const VendorCampaignSchema = z
  .object({
    name: z.string().min(1, 'Tên chiến dịch không được để trống'),
    description: z
      .string()
      .trim()
      .min(1, 'Mô tả chiến dịch không được để trống'),
    targetSegment: z.string().nullable(),
    startDate: z.string().min(1, 'Ngày bắt đầu không được để trống'),
    endDate: z.string().min(1, 'Ngày kết thúc không được để trống'),
    branchIds: z.array(z.number()).nullable(),
  })
  .superRefine((data, ctx) => {
    const { startDate, endDate } = data;

    if (startDate && endDate && startDate >= endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Ngày kết thúc chiến dịch phải sau ngày bắt đầu',
        path: ['endDate'],
      });
    }
  });

export type VendorCampaignFormData = z.infer<typeof VendorCampaignSchema>;
