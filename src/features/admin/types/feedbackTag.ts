export interface FeedbackTag {
  tagId: number;
  tagName: string;
  description: string | null;
}

export interface CreateOrUpdateFeedbackTagRequest {
  tagName: string;
  description: string | null;
}

export type CreateOrUpdateFeedbackTagResponse = FeedbackTag;
