import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@slices/auth';
import badgeReducer from '@slices/badge';

export const store = configureStore({
  reducer: {
    user: authReducer,
    badge: badgeReducer,
  },
});

// Infer the `RootState`,  `AppDispatch`, and `AppStore` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
