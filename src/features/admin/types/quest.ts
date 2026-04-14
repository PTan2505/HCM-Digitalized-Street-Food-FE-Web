export enum QuestTaskType {
  REVIEW = 1,
  ORDER_AMOUNT = 2,
  SHARE = 3,
  CREATE_GHOST_PIN = 4,
  TIER_UP = 5,
}

export enum QuestRewardType {
  BADGE = 1,
  POINTS = 2,
  VOUCHER = 3,
}

export interface QuestReward {
  questTaskRewardId?: number;
  rewardType: QuestRewardType;
  rewardValue: number;
  quantity: number | null;
}

export interface QuestRewardPayload {
  rewardType: QuestRewardType;
  rewardValue: number;
  quantity: number | null;
}

export interface QuestTask {
  questTaskId: number;
  type: QuestTaskType;
  targetValue: number;
  description: string | null;
  rewards: QuestReward[];
  currentValue?: number;
  isCompleted?: boolean;
  rewardClaimed?: boolean;
}

export interface QuestTaskPayload {
  type: QuestTaskType;
  targetValue: number;
  description: string | null;
  rewards: QuestRewardPayload[];
}

export interface Quest {
  questId: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  requiresEnrollment: boolean;
  isStandalone: boolean;
  campaignId: number | null;
  createdAt?: string;
  updatedAt?: string;
  taskCount?: number;
  tasks: QuestTask[];
}

export interface QuestCreate {
  title: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  requiresEnrollment: boolean;
  isStandalone: boolean;
  campaignId: number | null;
  tasks: QuestTaskPayload[];
}

export type QuestUpdate = QuestCreate;

export interface QuestListResponse {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: Quest[];
}

export const QUEST_TASK_TYPE_LABELS: Record<QuestTaskType, string> = {
  [QuestTaskType.REVIEW]: 'Đánh giá',
  [QuestTaskType.ORDER_AMOUNT]: 'Tổng chi tiêu đơn hàng',
  [QuestTaskType.SHARE]: 'Chia sẻ',
  [QuestTaskType.CREATE_GHOST_PIN]: 'Tạo ghost pin',
  [QuestTaskType.TIER_UP]: 'Nâng hạng',
};

export const QUEST_REWARD_TYPE_LABELS: Record<QuestRewardType, string> = {
  [QuestRewardType.BADGE]: 'Huy hiệu',
  [QuestRewardType.POINTS]: 'Điểm',
  [QuestRewardType.VOUCHER]: 'Voucher',
};
