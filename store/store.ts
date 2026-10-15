import { configureStore } from '@reduxjs/toolkit'
import commentReducer from '../features/comments/commentSlice'
import authReducer from '../features/auth/authSlice'

import { postsApi } from '../features/posts/api'

export const store = configureStore({
  reducer: {
    [postsApi.reducerPath]: postsApi.reducer,
    comments: commentReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(postsApi.middleware),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
