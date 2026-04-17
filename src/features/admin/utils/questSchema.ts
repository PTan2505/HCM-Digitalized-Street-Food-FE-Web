import { QuestRewardType, QuestTaskType } from '@features/admin/types/quest';
import { z } from 'zod';

const questRewardSchema = z.object({
  rewardType: z.coerce
    .number()
    .int()
    .min(QuestRewardType.BADGE)
    .max(QuestRewardType.VOUCHER),
  rewardValue: z.coerce.number().int(),
  // .positive('Gia tri thuong phai lon hon 0'),
  quantity: z.coerce
    .number()
    .int()
    .positive('Số lượng phải lớn hơn 0')
    .nullable()
    .refine((value) => value !== null, {
      message: 'Vui lòng nhập số lượng phần thưởng',
    }),
});

const questTaskSchema = z.object({
  type: z.coerce
    .number()
    .int()
    .min(QuestTaskType.REVIEW)
    .max(QuestTaskType.TIER_UP),
  targetValue: z.coerce.number().int().positive('Mục tiêu phải lớn hơn 0'),
  description: z
    .string()
    .trim()
    .max(500, 'Mô tả không vượt quá 500 ký tự')
    .nullable(),
  rewards: z
    .array(questRewardSchema)
    .min(1, 'Nhiem vu can it nhat mot phan thuong'),
});

const QuestScopeSchema = z.enum(['standalone', 'campaign', 'upgrade']);

export const QuestSchema = z
  .object({
    questScope: QuestScopeSchema,
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
    requiresEnrollment: z.boolean(),
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
    if (data.questScope === 'campaign' && !data.campaignId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['campaignId'],
        message: 'Vui lòng chọn campaign cho quest theo chiến dịch',
      });
    }

    if (data.questScope === 'upgrade') {
      if (data.tasks.length !== 1) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['tasks'],
          message: 'Quest nang cap chi duoc co 1 nhiem vu con',
        });
      }

      if ((data.tasks[0]?.type as QuestTaskType) !== QuestTaskType.TIER_UP) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['tasks', 0, 'type'],
          message: 'Quest nang cap bat buoc dung loai nhiem vu TIER_UP',
        });
      }

      if (data.requiresEnrollment) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['requiresEnrollment'],
          message: 'Quest nang cap bat buoc requiresEnrollment = false',
        });
      }
    }

    if (data.questScope !== 'upgrade') {
      if (
        data.tasks.some(
          (task) => (task.type as QuestTaskType) === QuestTaskType.TIER_UP
        )
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['tasks'],
          message: 'Chi quest nang cap moi duoc dung loai TIER_UP',
        });
      }

      if (!data.requiresEnrollment) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['requiresEnrollment'],
          message: 'Quest nay bat buoc requiresEnrollment = true',
        });
      }
    }
  });

export type QuestFormInput = z.input<typeof QuestSchema>;
export type QuestFormData = z.infer<typeof QuestSchema>;
