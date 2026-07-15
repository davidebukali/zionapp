import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface Post {
  id: string
  title: string
  content: string
  author: string
  avatarUrl?: string
  imageUrl?: string
  likes?: string
  comments?: string
  liked?: boolean
  createdAt: string
  updatedAt: string
}

export interface PostState {
  posts: Post[]
  isLoading: boolean
  isRefreshing: boolean
  hasMore: boolean
  page: number
  error: string | null
}

const initialState: PostState = {
  posts: [],
  isLoading: false,
  isRefreshing: false,
  hasMore: true,
  page: 1,
  error: null,
}

export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async ({ page, limit, isRefresh = false }: { page: number; limit: number; isRefresh?: boolean }) => {
    const response = await fetch(
      `http://localhost:3000/posts?_page=${page}&_limit=${limit}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: Post[] = await response.json();
    return { data, isRefresh, page, limit };
  }
)

export const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    addPost: (state, action: PayloadAction<Post>) => {
      state.posts.push(action.payload)
    },
    deletePost: (state, action: PayloadAction<string>) => {
      state.posts = state.posts.filter((post) => post.id !== action.payload)
    },
    updatePost: (state, action: PayloadAction<Partial<Post> & { id: string }>) => {
      state.posts = state.posts.map((post) => {
        if (post.id === action.payload.id) {
          return {
            ...post,
            ...action.payload,
          }
        }
        return post
      })
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state, action) => {
        const isRefresh = action.meta.arg.isRefresh;
        if (isRefresh) {
          state.isRefreshing = true;
        } else {
          state.isLoading = true;
        }
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        const { data, isRefresh, page, limit } = action.payload;
        state.isLoading = false;
        state.isRefreshing = false;
        state.page = page;

        if (isRefresh) {
          state.posts = data;
        } else {
          state.posts = [...state.posts, ...data];
        }

        if (data.length < limit) {
          state.hasMore = false;
        } else {
          state.hasMore = true;
        }
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.isRefreshing = false;
        state.hasMore = false;
        state.error = action.error.message || "Failed to fetch posts";
      });
  },
})

export const { addPost, deletePost, updatePost } = postSlice.actions

export default postSlice.reducer