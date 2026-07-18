import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { current_ip } from '../../constants';

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

function parseLikes(likes: string | undefined): number {
  if (!likes) return 0;
  const normalized = likes.toLowerCase().trim();
  if (normalized.endsWith('k')) {
    const num = parseFloat(normalized.slice(0, -1));
    return isNaN(num) ? 0 : num * 1000;
  }
  const parsed = parseInt(normalized, 10);
  return isNaN(parsed) ? 0 : parsed;
}

function formatLikes(likesCount: number): string {
  if (likesCount >= 1000) {
    return (likesCount / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return String(likesCount);
}

export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async ({ page, limit, isRefresh = false }: { page: number; limit: number; isRefresh?: boolean }) => {
    const response = await fetch(
      `http://${current_ip}:3000/posts?_page=${page}&_per_page=${limit}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    const data: Post[] = Array.isArray(json) ? json : (json.data || []);
    return { data, isRefresh, page, limit };
  }
)

export const toggleLikePost = createAsyncThunk(
  'posts/toggleLikePost',
  async ({ postId, liked, likes }: { postId: string; liked: boolean; likes: string }, { rejectWithValue }) => {
    const nextLiked = !liked;
    const currentLikesNum = parseLikes(likes);
    const nextLikesNum = nextLiked ? currentLikesNum + 1 : Math.max(0, currentLikesNum - 1);
    const nextLikes = formatLikes(nextLikesNum);

    try {
      const response = await fetch(`http://${current_ip}:3000/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          liked: nextLiked,
          likes: nextLikes,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedPost = await response.json();
      return updatedPost;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update like status");
    }
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

        console.log("Pending");
        
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

        console.log("Fullfilled");
        
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.isRefreshing = false;
        state.hasMore = false;
        state.error = action.error.message || "Failed to fetch posts";

        console.log("Rejected");
        
      })
      .addCase(toggleLikePost.pending, (state, action) => {
        const { postId, liked, likes } = action.meta.arg;
        const post = state.posts.find((p) => p.id === postId);
        if (post) {
          const nextLiked = !liked;
          const currentLikesNum = parseLikes(likes);
          const nextLikesNum = nextLiked ? currentLikesNum + 1 : Math.max(0, currentLikesNum - 1);
          post.likes = formatLikes(nextLikesNum);
          post.liked = nextLiked;
        }
      })
      .addCase(toggleLikePost.fulfilled, (state, action) => {
        const updatedPost = action.payload;
        const index = state.posts.findIndex((p) => p.id === updatedPost.id);
        if (index !== -1) {
          state.posts[index] = updatedPost;
        }
      })
      .addCase(toggleLikePost.rejected, (state, action) => {
        const { postId, liked, likes } = action.meta.arg;
        const post = state.posts.find((p) => p.id === postId);
        if (post) {
          post.liked = liked;
          post.likes = likes;
        }
        state.error = (action.payload as string) || "Failed to update like";
      });
  },
})

export const { addPost, deletePost, updatePost } = postSlice.actions

export default postSlice.reducer