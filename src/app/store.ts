import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@slices/auth';
import badgeReducer from '@slices/badge';
import userDietaryPreferenceReducer from '@slices/userPreferenceDietary';
import categoryReducer from '@slices/category';
import vendorReducer from '@slices/vendor';
import vendorAdminReducer from '@slices/vendorAdmin';
import branchReducer from '@slices/branch';

export const store = configureStore({
  reducer: {
    user: authReducer,
    badge: badgeReducer,
    userDietaryPreference: userDietaryPreferenceReducer,
    category: categoryReducer,
    vendor: vendorReducer,
    vendorAdmin: vendorAdminReducer,
    branch: branchReducer,
  },
});

// Infer the `RootState`,  `AppDispatch`, and `AppStore` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
