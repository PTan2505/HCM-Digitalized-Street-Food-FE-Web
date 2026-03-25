import { z } from 'zod';

export const CampaignSchema = z.object({
  name: z.string().min(1, 'Tên chiến dịch không được để trống'),
  description: z.string().nullable(),
  targetSegment: z.string().nullable(),
  registrationStartDate: z.string().nullable(),
  registrationEndDate: z.string().nullable(),
  startDate: z.string().min(1, 'Ngày bắt đầu không được để trống'),
  endDate: z.string().min(1, 'Ngày kết thúc không được để trống'),
});

export type CampaignFormData = z.infer<typeof CampaignSchema>;
