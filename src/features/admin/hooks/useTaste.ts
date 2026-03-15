import type {
  Taste,
  CreateOrUpdateTasteRequest,
  CreateOrUpdateTasteResponse,
} from '@features/admin/types/taste';
import { useAppDispatch } from '@hooks/reduxHooks';
import {
  createTaste,
  getAllTastes,
  updateTaste,
  deleteTaste,
} from '@slices/taste';
import { useCallback } from 'react';

export default function useTaste(): {
  onGetAllTastes: () => Promise<Taste[]>;
  onCreateTaste: (
    payload: CreateOrUpdateTasteRequest
  ) => Promise<CreateOrUpdateTasteResponse>;
  onUpdateTaste: (
    payload: { id: number } & CreateOrUpdateTasteRequest
  ) => Promise<CreateOrUpdateTasteResponse>;
  onDeleteTaste: (id: number) => Promise<void>;
} {
  const dispatch = useAppDispatch();

  const onGetAllTastes = useCallback(async (): Promise<Taste[]> => {
    const response = await dispatch(getAllTastes()).unwrap();
    return response;
  }, [dispatch]);

  const onCreateTaste = useCallback(
    async (
      payload: CreateOrUpdateTasteRequest
    ): Promise<CreateOrUpdateTasteResponse> => {
      const response = await dispatch(createTaste(payload)).unwrap();
      return response;
    },
    [dispatch]
  );

  const onUpdateTaste = useCallback(
    async (
      payload: { id: number } & CreateOrUpdateTasteRequest
    ): Promise<CreateOrUpdateTasteResponse> => {
      const response = await dispatch(updateTaste(payload)).unwrap();
      return response;
    },
    [dispatch]
  );

  const onDeleteTaste = useCallback(
    async (id: number): Promise<void> => {
      await dispatch(deleteTaste(id)).unwrap();
    },
    [dispatch]
  );

  return {
    onGetAllTastes,
    onCreateTaste,
    onUpdateTaste,
    onDeleteTaste,
  };
}
