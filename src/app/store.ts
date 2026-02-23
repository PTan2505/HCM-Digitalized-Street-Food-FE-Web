import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@slices/auth';
import badgeReducer from '@slices/badge';
import userDietaryPreferenceReducer from '@slices/userPreferenceDietary';

export const store = configureStore({
  reducer: {
    user: authReducer,
    badge: badgeReducer,
    userDietaryPreference: userDietaryPreferenceReducer,
  },
});

// Infer the `RootState`,  `AppDispatch`, and `AppStore` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
