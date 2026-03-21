import type {
  CreateOrUpdateDishRequest,
  AssignOrUnassignDishToBranchRequest,
  UpdateDishAvailabilityByBranchRequest,
  CreateOrUpdateDishResponse,
  GetDishesOfAVendorResponse,
  GetDishesByBranchResponse,
} from '@features/vendor/types/dish';
import { useAppDispatch } from '@hooks/reduxHooks';
import {
  createDish,
  updateDish,
  deleteDish,
  getDishesOfAVendor,
  getDishesByBranch,
  assignDishToBranch,
  unassignDishToBranch,
  updateDishAvailabilityByBranch,
  resetDishState,
} from '@slices/dish';
import { useCallback } from 'react';

export default function useDish(): {
  onCreateDish: (payload: {
    data: CreateOrUpdateDishRequest;
    vendorId: number;
  }) => Promise<CreateOrUpdateDishResponse>;
  onUpdateDish: (payload: {
    data: CreateOrUpdateDishRequest;
    dishId: number;
  }) => Promise<CreateOrUpdateDishResponse>;
  onDeleteDish: (dishId: number) => Promise<number>;
  onGetDishesOfAVendor: (payload: {
    vendorId: number;
    params: {
      pageNumber: number;
      pageSize: number;
      categoryId?: number;
      keyword?: string;
    };
  }) => Promise<GetDishesOfAVendorResponse>;
  onGetDishesByBranch: (payload: {
    branchId: number;
    params: {
      pageNumber: number;
      pageSize: number;
      categoryId?: number;
      keyword?: string;
    };
  }) => Promise<GetDishesByBranchResponse>;
  onAssignDishToBranch: (payload: {
    data: AssignOrUnassignDishToBranchRequest;
    branchId: number;
  }) => Promise<void>;
  onUnassignDishToBranch: (payload: {
    data: AssignOrUnassignDishToBranchRequest;
    branchId: number;
  }) => Promise<void>;
  onUpdateDishAvailabilityByBranch: (payload: {
    data: UpdateDishAvailabilityByBranchRequest;
    dishId: number;
    branchId: number;
  }) => Promise<{ dishId: number; isSoldOut: boolean }>;
  onResetDishState: () => void;
} {
  const dispatch = useAppDispatch();

  const onCreateDish = useCallback(
    async (payload: {
      data: CreateOrUpdateDishRequest;
      vendorId: number;
    }): Promise<CreateOrUpdateDishResponse> => {
      return await dispatch(createDish(payload)).unwrap();
    },
    [dispatch]
  );

  const onUpdateDish = useCallback(
    async (payload: {
      data: CreateOrUpdateDishRequest;
      dishId: number;
    }): Promise<CreateOrUpdateDishResponse> => {
      return await dispatch(updateDish(payload)).unwrap();
    },
    [dispatch]
  );

  const onDeleteDish = useCallback(
    async (dishId: number): Promise<number> => {
      return await dispatch(deleteDish(dishId)).unwrap();
    },
    [dispatch]
  );

  const onGetDishesOfAVendor = useCallback(
    async (payload: {
      vendorId: number;
      params: {
        pageNumber: number;
        pageSize: number;
        categoryId?: number;
        keyword?: string;
      };
    }): Promise<GetDishesOfAVendorResponse> => {
      return await dispatch(getDishesOfAVendor(payload)).unwrap();
    },
    [dispatch]
  );

  const onGetDishesByBranch = useCallback(
    async (payload: {
      branchId: number;
      params: {
        pageNumber: number;
        pageSize: number;
        categoryId?: number;
        keyword?: string;
      };
    }): Promise<GetDishesByBranchResponse> => {
      return await dispatch(getDishesByBranch(payload)).unwrap();
    },
    [dispatch]
  );

  const onAssignDishToBranch = useCallback(
    async (payload: {
      data: AssignOrUnassignDishToBranchRequest;
      branchId: number;
    }): Promise<void> => {
      await dispatch(assignDishToBranch(payload)).unwrap();
    },
    [dispatch]
  );

  const onUnassignDishToBranch = useCallback(
    async (payload: {
      data: AssignOrUnassignDishToBranchRequest;
      branchId: number;
    }): Promise<void> => {
      await dispatch(unassignDishToBranch(payload)).unwrap();
    },
    [dispatch]
  );

  const onUpdateDishAvailabilityByBranch = useCallback(
    async (payload: {
      data: UpdateDishAvailabilityByBranchRequest;
      dishId: number;
      branchId: number;
    }): Promise<{ dishId: number; isSoldOut: boolean }> => {
      return await dispatch(updateDishAvailabilityByBranch(payload)).unwrap();
    },
    [dispatch]
  );

  const onResetDishState = useCallback(() => {
    dispatch(resetDishState());
  }, [dispatch]);

  return {
    onCreateDish,
    onUpdateDish,
    onDeleteDish,
    onGetDishesOfAVendor,
    onGetDishesByBranch,
    onAssignDishToBranch,
    onUnassignDishToBranch,
    onUpdateDishAvailabilityByBranch,
    onResetDishState,
  };
}
