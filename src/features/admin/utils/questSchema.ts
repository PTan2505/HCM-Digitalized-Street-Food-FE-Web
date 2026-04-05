import { QuestRewardType, QuestTaskType } from '@features/admin/types/quest';
import { z } from 'zod';

const questTaskSchema = z.object({
  type: z.coerce
    .number()
    .int()
    .min(QuestTaskType.REVIEW)
    .max(QuestTaskType.CREATE_GHOST_PIN),
  targetValue: z.coerce.number().int().positive('Mục tiêu phải lớn hơn 0'),
  description: z
    .string()
    .trim()
    .max(500, 'Mô tả không vượt quá 500 ký tự')
    .nullable(),
  rewardType: z.coerce
    .number()
    .int()
    .min(QuestRewardType.BADGE)
    .max(QuestRewardType.VOUCHER),
  rewardValue: z.coerce
    .number()
    .int()
    .positive('Giá trị thưởng phải lớn hơn 0'),
});

export const QuestSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Tiêu đề không được để trống')
      .max(200, 'Tiêu đề không vượt quá 200 ký tự'),
    description: z
      .string()
      .trim()
      .max(1000, 'Mô tả không vượt quá 1000 ký tự')
      .nullable(),
    imageUrl: z
      .string()
      .trim()
      .max(500, 'URL ảnh không vượt quá 500 ký tự')
      .nullable(),
    isActive: z.boolean(),
    isStandalone: z.boolean(),
    campaignId: z
      .number()
      .int()
      .positive('Campaign ID phải lớn hơn 0')
      .nullable(),
    tasks: z
      .array(questTaskSchema)
      .min(1, 'Quest cần ít nhất một nhiệm vụ để người dùng hoàn thành'),
  })
  .superRefine((data, context) => {
    if (!data.isStandalone && !data.campaignId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['campaignId'],
        message: 'Vui lòng chọn campaign cho quest theo chiến dịch',
      });
    }
  });

export type QuestFormInput = z.input<typeof QuestSchema>;
export type QuestFormData = z.infer<typeof QuestSchema>;
