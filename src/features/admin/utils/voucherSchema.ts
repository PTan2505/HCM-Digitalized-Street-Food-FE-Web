import { z } from 'zod';

export const VoucherSchema = z
  .object({
    name: z.string().min(1, 'Tên voucher không được để trống').max(255),
    voucherCode: z.string().min(1, 'Mã voucher không được để trống').max(100),
    type: z.enum(['AMOUNT', 'PERCENT']),
    description: z.string().max(1000).nullable(),
    discountValue: z.number().min(0, 'Giá trị giảm phải >= 0'),
    maxDiscountValue: z.number().min(0, 'Phải >= 0').nullable(),
    minAmountRequired: z.number().min(0, 'Đơn tối thiểu phải >= 0'),
    quantity: z.number().int().min(0, 'Số lượng phải >= 0'),
    redeemPoint: z.number().int().min(0, 'Điểm đổi phải >= 0'),
    startDate: z.string().min(1, 'Ngày bắt đầu không được để trống'),
    endDate: z.string(),
    expiredDate: z.string().nullable(),
    isActive: z.boolean(),
    campaignId: z.number().int().nullable(),
  })
  .superRefine((data, ctx) => {
    if (
      data.startDate &&
      data.endDate &&
      data.endDate !== '' &&
      data.startDate >= data.endDate
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Ngày kết thúc phải sau ngày bắt đầu',
        path: ['endDate'],
      });
    }
    if (data.type === 'PERCENT' && data.discountValue > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Giảm theo % không được vượt quá 100',
        path: ['discountValue'],
      });
    }
  });

export type VoucherFormData = z.infer<typeof VoucherSchema>;
