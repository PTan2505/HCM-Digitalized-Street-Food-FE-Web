import { z } from 'zod';

export const CampaignSchema = z
  .object({
    name: z.string().min(1, 'Tên chiến dịch không được để trống'),
    description: z
      .string()
      .trim()
      .min(1, 'Mô tả chiến dịch không được để trống'),
    targetSegment: z.string().nullable(),
    registrationStartDate: z
      .string()
      .min(1, 'Ngày bắt đầu đăng ký không được để trống'),
    registrationEndDate: z
      .string()
      .min(1, 'Ngày kết thúc đăng ký không được để trống'),
    requiredTierId: z.number().int().positive().nullable().optional(),
    expectedBranchJoin: z
      .number()
      .int()
      .min(1, 'Số lượng chi nhánh phải từ 1 trở lên')
      .nullable(),
    joinFee: z
      .number()
      .int()
      .min(10000, 'Phí tham gia không được nhỏ hơn 10.000 VNĐ'),
    startDate: z.string().min(1, 'Ngày bắt đầu không được để trống'),
    endDate: z.string().min(1, 'Ngày kết thúc không được để trống'),
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
