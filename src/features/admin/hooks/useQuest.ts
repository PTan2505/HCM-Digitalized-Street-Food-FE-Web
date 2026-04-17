import type {
  Quest,
  QuestCreate,
  QuestListResponse,
  QuestTasksUpdate,
  QuestUpdate,
  QuestUserQuestTasksQuery,
  QuestUserQuestTasksResponse,
} from '@features/admin/types/quest';
import { useAppDispatch } from '@hooks/reduxHooks';
import {
  createQuest,
  deleteQuest,
  getAllQuests,
  getQuestById,
  getQuestUserQuestTasks,
  postQuestImage,
  updateQuest,
  updateQuestTasks,
} from '@slices/quest';
import { useCallback } from 'react';

const useQuest = (): {
  onGetQuests: (payload: {
    pageNumber: number;
    pageSize: number;
    isActive?: boolean;
    campaignId?: number;
  }) => Promise<QuestListResponse>;
  onGetQuestById: (id: number) => Promise<Quest>;
  onCreateQuest: (data: QuestCreate) => Promise<Quest>;
  onUpdateQuest: (id: number, data: QuestUpdate) => Promise<Quest>;
  onUpdateQuestTasks: (id: number, data: QuestTasksUpdate) => Promise<number>;
  onDeleteQuest: (id: number) => Promise<number>;
  onPostQuestImage: (id: number, data: FormData) => Promise<Quest>;
  onGetQuestUserQuestTasks: (
    questId: number,
    params: QuestUserQuestTasksQuery
  ) => Promise<QuestUserQuestTasksResponse>;
} => {
  const dispatch = useAppDispatch();

  const onGetQuests = useCallback(
    async (payload: {
      pageNumber: number;
      pageSize: number;
      isActive?: boolean;
      campaignId?: number;
    }): Promise<QuestListResponse> => {
      return await dispatch(getAllQuests(payload)).unwrap();
    },
    [dispatch]
  );

  const onGetQuestById = useCallback(
    async (id: number): Promise<Quest> => {
      return await dispatch(getQuestById(id)).unwrap();
    },
    [dispatch]
  );

  const onCreateQuest = useCallback(
    async (data: QuestCreate): Promise<Quest> => {
      return await dispatch(createQuest(data)).unwrap();
    },
    [dispatch]
  );

  const onUpdateQuest = useCallback(
    async (id: number, data: QuestUpdate): Promise<Quest> => {
      return await dispatch(updateQuest({ id, data })).unwrap();
    },
    [dispatch]
  );

  const onDeleteQuest = useCallback(
    async (id: number): Promise<number> => {
      return await dispatch(deleteQuest(id)).unwrap();
    },
    [dispatch]
  );

  const onUpdateQuestTasks = useCallback(
    async (id: number, data: QuestTasksUpdate): Promise<number> => {
      return await dispatch(updateQuestTasks({ id, data })).unwrap();
    },
    [dispatch]
  );

  const onPostQuestImage = useCallback(
    async (id: number, data: FormData): Promise<Quest> => {
      return await dispatch(postQuestImage({ id, data })).unwrap();
    },
    [dispatch]
  );

  const onGetQuestUserQuestTasks = useCallback(
    async (
      questId: number,
      params: QuestUserQuestTasksQuery
    ): Promise<QuestUserQuestTasksResponse> => {
      return await dispatch(
        getQuestUserQuestTasks({ questId, params })
      ).unwrap();
    },
    [dispatch]
  );

  return {
    onGetQuests,
    onGetQuestById,
    onCreateQuest,
    onUpdateQuest,
    onUpdateQuestTasks,
    onDeleteQuest,
    onPostQuestImage,
    onGetQuestUserQuestTasks,
  };
};

export default useQuest;
