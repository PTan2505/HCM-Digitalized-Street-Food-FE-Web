import type {
  FeedbackTag,
  CreateOrUpdateFeedbackTagRequest,
  CreateOrUpdateFeedbackTagResponse,
} from '@features/admin/types/feedbackTag';
import { useAppDispatch } from '@hooks/reduxHooks';
import {
  createFeedbackTag,
  getAllFeedbackTags,
  updateFeedbackTag,
  deleteFeedbackTag,
} from '@slices/feedbackTag';
import { useCallback } from 'react';

export default function useFeedbackTag(): {
  onGetAllFeedbackTags: () => Promise<FeedbackTag[]>;
  onCreateFeedbackTag: (
    payload: CreateOrUpdateFeedbackTagRequest
  ) => Promise<FeedbackTag>;
  onUpdateFeedbackTag: (
    payload: { id: number } & CreateOrUpdateFeedbackTagRequest
  ) => Promise<FeedbackTag>;
  onDeleteFeedbackTag: (id: number) => Promise<void>;
} {
  const dispatch = useAppDispatch();

  const onGetAllFeedbackTags = useCallback(async (): Promise<FeedbackTag[]> => {
    const response = await dispatch(getAllFeedbackTags()).unwrap();
    return response;
  }, [dispatch]);

  const onCreateFeedbackTag = useCallback(
    async (
      payload: CreateOrUpdateFeedbackTagRequest
    ): Promise<CreateOrUpdateFeedbackTagResponse> => {
      const response = await dispatch(createFeedbackTag(payload)).unwrap();
      return response;
    },
    [dispatch]
  );

  const onUpdateFeedbackTag = useCallback(
    async (
      payload: { id: number } & CreateOrUpdateFeedbackTagRequest
    ): Promise<CreateOrUpdateFeedbackTagResponse> => {
      const response = await dispatch(updateFeedbackTag(payload)).unwrap();
      return response;
    },
    [dispatch]
  );

  const onDeleteFeedbackTag = useCallback(
    async (id: number): Promise<void> => {
      await dispatch(deleteFeedbackTag(id)).unwrap();
    },
    [dispatch]
  );

  return {
    onGetAllFeedbackTags,
    onCreateFeedbackTag,
    onUpdateFeedbackTag,
    onDeleteFeedbackTag,
  };
}
