export interface FeedbackTag {
  tagId: number;
  tagName: string;
  description: string | null;
  isActive?: boolean;
}

export interface CreateOrUpdateFeedbackTagRequest {
  tagName: string;
  description: string | null;
}

export type CreateOrUpdateFeedbackTagResponse = FeedbackTag;
