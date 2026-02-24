import type {
  Category,
  CreateOrUpdateCategoryRequest,
  CreateOrUpdateCategoryResponse,
} from '@features/admin/types/category';
import { useAppDispatch } from '@hooks/reduxHooks';
import {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} from '@slices/category';
import { useCallback } from 'react';

export default function useCategory(): {
  onGetAllCategories: () => Promise<Category[]>;
  onCreateCategory: (
    payload: CreateOrUpdateCategoryRequest
  ) => Promise<CreateOrUpdateCategoryResponse>;
  onUpdateCategory: (
    payload: { id: number } & CreateOrUpdateCategoryRequest
  ) => Promise<CreateOrUpdateCategoryResponse>;
  onDeleteCategory: (id: number) => Promise<void>;
} {
  const dispatch = useAppDispatch();

  const onGetAllCategories = useCallback(async (): Promise<Category[]> => {
    const response = await dispatch(getAllCategories()).unwrap();
    return response;
  }, [dispatch]);

  const onCreateCategory = useCallback(
    async (
      payload: CreateOrUpdateCategoryRequest
    ): Promise<CreateOrUpdateCategoryResponse> => {
      const response = await dispatch(createCategory(payload)).unwrap();
      return response;
    },
    [dispatch]
  );

  const onUpdateCategory = useCallback(
    async (
      payload: { id: number } & CreateOrUpdateCategoryRequest
    ): Promise<CreateOrUpdateCategoryResponse> => {
      const response = await dispatch(updateCategory(payload)).unwrap();
      return response;
    },
    [dispatch]
  );

  const onDeleteCategory = useCallback(
    async (id: number): Promise<void> => {
      await dispatch(deleteCategory(id)).unwrap();
    },
    [dispatch]
  );

  return {
    onGetAllCategories,
    onCreateCategory,
    onUpdateCategory,
    onDeleteCategory,
  };
}
