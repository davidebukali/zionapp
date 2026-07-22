import { configureStore } from '@reduxjs/toolkit'
import postReducer from '../features/posts/postSlice'

import { postsApi } from '../features/posts/postsApi'

export const store = configureStore({
  reducer: {
    post: postReducer,
    [postsApi.reducerPath]: postsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(postsApi.middleware),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch