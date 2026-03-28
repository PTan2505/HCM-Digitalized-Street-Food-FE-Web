import { z } from 'zod';

export const VendorCampaignSchema = z
  .object({
    name: z.string().min(1, 'Tên chiến dịch không được để trống'),
    description: z.string().nullable(),
    targetSegment: z.string().nullable(),
    startDate: z.string().min(1, 'Ngày bắt đầu không được để trống'),
    endDate: z.string().min(1, 'Ngày kết thúc không được để trống'),
    isActive: z.boolean(),
    applyScope: z.enum(['VENDOR', 'BRANCHES']),
    branchIds: z.array(z.number()),
  })
  .superRefine((data, ctx) => {
    const { startDate, endDate, applyScope, branchIds } = data;

    if (startDate && endDate && startDate >= endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Ngày kết thúc chiến dịch phải sau ngày bắt đầu',
        path: ['endDate'],
      });
    }

    if (applyScope === 'BRANCHES' && branchIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Vui lòng chọn ít nhất một chi nhánh',
        path: ['branchIds'],
      });
    }
  });

export type VendorCampaignFormData = z.infer<typeof VendorCampaignSchema>;
