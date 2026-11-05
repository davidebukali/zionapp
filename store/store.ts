import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import newPostsReducer from '../features/posts/newPostsSlice';
import { baseApi } from '../services/baseApi';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    newPosts: newPostsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
