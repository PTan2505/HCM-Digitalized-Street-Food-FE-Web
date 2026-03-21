import type { RootState } from '@app/store';
import type {
  Category,
  CreateOrUpdateCategoryRequest,
  CreateOrUpdateCategoryResponse,
} from '@features/admin/types/category';
import { createAppAsyncThunk } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import {
  createSlice,
  isFulfilled,
  isPending,
  isRejected,
} from '@reduxjs/toolkit';

export interface CategoryState {
  categories: Category[];
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: unknown;
}

const initialState: CategoryState = {
  categories: [],
  status: 'idle',
  error: null,
};

export const getAllCategories = createAppAsyncThunk(
  'category/getAllCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response: Category[] =
        await axiosApi.categoryApi.getAllCategories();
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createCategory = createAppAsyncThunk(
  'category/createCategory',
  async (payload: CreateOrUpdateCategoryRequest, { rejectWithValue }) => {
    try {
      const response: CreateOrUpdateCategoryResponse =
        await axiosApi.categoryApi.createCategory(payload);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateCategory = createAppAsyncThunk(
  'category/updateCategory',
  async (
    payload: { id: number } & CreateOrUpdateCategoryRequest,
    { rejectWithValue }
  ) => {
    try {
      const response: CreateOrUpdateCategoryResponse =
        await axiosApi.categoryApi.updateCategory(payload.id, payload);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteCategory = createAppAsyncThunk(
  'category/deleteCategory',
  async (id: number, { rejectWithValue }) => {
    try {
      await axiosApi.categoryApi.deleteCategory(id);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    resetCategoryState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Get all categories
      .addCase(getAllCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      // Create category
      .addCase(createCategory.fulfilled, (state, action) => {
        if (action.payload) {
          const newCategory =
            (action.payload as unknown as CreateOrUpdateCategoryResponse)
              .data ?? (action.payload as unknown as Category);
          if (newCategory && 'categoryId' in newCategory) {
            state.categories.push(newCategory);
          }
        }
      })
      // Update category
      .addCase(updateCategory.fulfilled, (state, action) => {
        if (action.payload) {
          const responseData =
            action.payload as unknown as CreateOrUpdateCategoryResponse;
          const updatedCategory =
            responseData.data ?? (action.payload as unknown as Category);
          if (updatedCategory && 'categoryId' in updatedCategory) {
            const index = state.categories.findIndex(
              (category) => category?.categoryId === updatedCategory.categoryId
            );
            if (index !== -1) {
              state.categories[index] = updatedCategory;
            }
          }
        }
      })
      // Delete category
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(
          (category) => category.categoryId !== action.payload
        );
      })
      // Pending states
      .addMatcher(
        isPending(
          getAllCategories,
          createCategory,
          updateCategory,
          deleteCategory
        ),
        (state) => {
          state.status = 'pending';
        }
      )
      // Fulfilled states
      .addMatcher(
        isFulfilled(
          getAllCategories,
          createCategory,
          updateCategory,
          deleteCategory
        ),
        (state) => {
          state.status = 'succeeded';
        }
      )
      // Rejected states
      .addMatcher(
        isRejected(
          getAllCategories,
          createCategory,
          updateCategory,
          deleteCategory
        ),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        }
      );
  },
});

export const { resetCategoryState } = categorySlice.actions;

export const selectCategories = (state: RootState): Category[] =>
  state.category?.categories ?? [];
export const selectCategoryStatus = (
  state: RootState
): 'idle' | 'pending' | 'succeeded' | 'failed' =>
  state.category?.status ?? 'idle';
export const selectCategoryError = (state: RootState): unknown =>
  state.category?.error ?? null;

export default categorySlice.reducer;
