import type {
  GetFeedbacksByBranchResponse,
  ReplyFeedbackRequest,
} from '@features/vendor/types/feedback';
import { useAppDispatch } from '@hooks/reduxHooks';
import {
  createFeedbackReply,
  deleteFeedbackReply,
  getFeedbacksByBranch,
  resetFeedbackState,
  updateFeedbackReply,
} from '@slices/feedback';
import { useCallback } from 'react';

export default function useFeedback(): {
  onGetFeedbacksByBranch: (payload: {
    branchId: number;
    params: { pageNumber: number; pageSize: number; sortBy?: string };
  }) => Promise<GetFeedbacksByBranchResponse>;
  onCreateReply: (payload: {
    feedbackId: number;
    data: ReplyFeedbackRequest;
  }) => Promise<{ feedbackId: number; data: ReplyFeedbackRequest }>;
  onUpdateReply: (payload: {
    feedbackId: number;
    data: ReplyFeedbackRequest;
  }) => Promise<{ feedbackId: number; data: ReplyFeedbackRequest }>;
  onDeleteReply: (feedbackId: number) => Promise<number>;
  onResetFeedbackState: () => void;
} {
  const dispatch = useAppDispatch();

  const onGetFeedbacksByBranch = useCallback(
    async (payload: {
      branchId: number;
      params: { pageNumber: number; pageSize: number; sortBy?: string };
    }): Promise<GetFeedbacksByBranchResponse> => {
      return await dispatch(getFeedbacksByBranch(payload)).unwrap();
    },
    [dispatch]
  );

  const onCreateReply = useCallback(
    async (payload: {
      feedbackId: number;
      data: ReplyFeedbackRequest;
    }): Promise<{ feedbackId: number; data: ReplyFeedbackRequest }> => {
      return await dispatch(createFeedbackReply(payload)).unwrap();
    },
    [dispatch]
  );

  const onUpdateReply = useCallback(
    async (payload: {
      feedbackId: number;
      data: ReplyFeedbackRequest;
    }): Promise<{ feedbackId: number; data: ReplyFeedbackRequest }> => {
      return await dispatch(updateFeedbackReply(payload)).unwrap();
    },
    [dispatch]
  );

  const onDeleteReply = useCallback(
    async (feedbackId: number): Promise<number> => {
      return await dispatch(deleteFeedbackReply(feedbackId)).unwrap();
    },
    [dispatch]
  );

  const onResetFeedbackState = useCallback(() => {
    dispatch(resetFeedbackState());
  }, [dispatch]);

  return {
    onGetFeedbacksByBranch,
    onCreateReply,
    onUpdateReply,
    onDeleteReply,
    onResetFeedbackState,
  };
}
