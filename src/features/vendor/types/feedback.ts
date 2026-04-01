export interface GetFeedbacksByBranchParams {
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
}

export interface ReplyFeedbackRequest {
  content: string;
}

export interface FeedbackTag {
  id: number;
  name: string;
}

export interface FeedbackUser {
  id: number;
  name: string;
  avatar: string | null;
}

export interface VendorReply {
  id?: number;
  content?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface RawBranchFeedbackResponse {
  id: number;
  branchId?: number;
  user: FeedbackUser;
  dishId?: number;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string | null;
  images?: string[];
  tags?: FeedbackTag[];
  upVotes?: number;
  downVotes?: number;
  netScore?: number;
  userVote?: string | null;
  vendorReply?: VendorReply | string | null;
}

export interface BranchFeedbackResponse {
  feedbackId: number;
  branchId: number;
  userId?: number;
  userName?: string;
  avatarUrl?: string | null;
  rating?: number;
  comment: string;
  createdAt: string;
  updatedAt?: string | null;
  replyContent?: string | null;
  repliedAt?: string | null;
}

export interface GetFeedbacksByBranchResponse {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: RawBranchFeedbackResponse[];
}

export type ReplyFeedbackResponse = string;

export interface GetFeedbackDetailsResponse {
  id: number;
  user: {
    id: number;
    name: string;
    avatar: string | null;
  };
  dishId: number;
  dish: {
    id: number;
    name: string;
  } | null;
  branchId: number;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string | null;
  images: string[] | null;
  tags: FeedbackTag[] | null;
  upVotes: number;
  downVotes: number;
  netScore: number;
  userVote: string | null;
  vendorReply: VendorReply | null;
}
