import { useCallback } from 'react';
import { useAppDispatch } from '@hooks/reduxHooks';
import { getAllCategories } from '@slices/category';

export default function useCategory(): {
  onGetAllCategories: () => Promise<void>;
} {
  const dispatch = useAppDispatch();

  const onGetAllCategories = useCallback(async (): Promise<void> => {
    await dispatch(getAllCategories()).unwrap();
  }, [dispatch]);

  return {
    onGetAllCategories,
  };
}
