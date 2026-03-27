import { z } from 'zod';

export const CampaignSchema = z
  .object({
    name: z.string().min(1, 'Tên chiến dịch không được để trống'),
    description: z.string().nullable(),
    targetSegment: z.string().nullable(),
    registrationStartDate: z.string().nullable(),
    registrationEndDate: z.string().nullable(),
    startDate: z.string().min(1, 'Ngày bắt đầu không được để trống'),
    endDate: z.string().min(1, 'Ngày kết thúc không được để trống'),
    isActive: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const {
      registrationStartDate: regStart,
      registrationEndDate: regEnd,
      startDate,
      endDate,
    } = data;

    if (regStart && regEnd && regStart >= regEnd) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Ngày kết thúc đăng ký phải sau ngày bắt đầu đăng ký',
        path: ['registrationEndDate'],
      });
    }

    if (regEnd && startDate && regEnd >= startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Chiến dịch phải bắt đầu sau khi kết thúc đăng ký',
        path: ['startDate'],
      });
    }

    if (startDate && endDate && startDate >= endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Ngày kết thúc chiến dịch phải sau ngày bắt đầu',
        path: ['endDate'],
      });
    }
  });

export type CampaignFormData = z.infer<typeof CampaignSchema>;
