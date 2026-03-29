import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@slices/auth';
import badgeReducer from '@slices/badge';
import userDietaryPreferenceReducer from '@slices/userPreferenceDietary';
import categoryReducer from '@slices/category';
import vendorReducer from '@slices/vendor';
import branchReducer from '@slices/branch';
import tasteReducer from '@slices/taste';
import paymentReducer from '@slices/payment';
import dishReducer from '@slices/dish';
import feedbackReducer from '@slices/feedback';
import orderReducer from '@slices/order';
import feedbackTagReducer from '@slices/feedbackTag';
import campaignReducer from '@slices/campaign';
import voucherReducer from '@slices/voucher';

export const store = configureStore({
  reducer: {
    user: authReducer,
    badge: badgeReducer,
    userDietaryPreference: userDietaryPreferenceReducer,
    category: categoryReducer,
    vendor: vendorReducer,
    branch: branchReducer,
    taste: tasteReducer,
    payment: paymentReducer,
    dish: dishReducer,
    feedback: feedbackReducer,
    order: orderReducer,
    feedbackTag: feedbackTagReducer,
    campaign: campaignReducer,
    voucher: voucherReducer,
  },
});

// Infer the `RootState`,  `AppDispatch`, and `AppStore` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
