import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { current_ip } from "../../constants";

export interface Comment {
  id: string;
  postId: string;
  author: string;
  username: string;
  body: string;
  avatarUrl?: string;
  avatarColor?: string;
  verified?: boolean;
  likes: number;
  liked?: boolean;
  replies: number;
  createdAt: string;
}

interface CommentState {
  byPostId: Record<string, Comment[]>;
  loadingPostId: string | null;
  refreshingPostId: string | null;
  submittingPostId: string | null;
  pageByPostId: Record<string, number>;
  hasMoreByPostId: Record<string, boolean>;
  error: string | null;
}

const initialState: CommentState = {
  byPostId: {},
  loadingPostId: null,
  refreshingPostId: null,
  submittingPostId: null,
  pageByPostId: {},
  hasMoreByPostId: {},
  error: null,
};

type FetchCommentsInput = {
  postId: string;
  page: number;
  limit: number;
  isRefresh?: boolean;
};

export const fetchComments = createAsyncThunk(
  "comments/fetchComments",
  async ({ postId, page, limit, isRefresh = false }: FetchCommentsInput) => {
    const where = encodeURIComponent(JSON.stringify({ postId: { eq: postId } }));
    const response = await fetch(
      `http://${current_ip}:3000/comments?_where=${where}` +
        `&_sort=-createdAt&_page=${page}&_per_page=${limit}`
    );

    if (!response.ok) {
      throw new Error(`Failed to load comments (${response.status})`);
    }

    const json = await response.json();
    const comments: Comment[] = Array.isArray(json) ? json : (json.data ?? []);
    const hasMore =
      typeof json.pages === "number" ? page < json.pages : comments.length === limit;

    return { postId, comments, page, hasMore, isRefresh };
  }
);

type AddCommentInput = {
  postId: string;
  body: string;
  author: string;
  username: string;
  avatarColor?: string;
};

export const addComment = createAsyncThunk(
  "comments/addComment",
  async ({ postId, body, author, username, avatarColor }: AddCommentInput) => {
    const comment: Omit<Comment, "id"> = {
      postId,
      author,
      username,
      body: body.trim(),
      avatarColor,
      likes: 0,
      liked: false,
      replies: 0,
      createdAt: new Date().toISOString(),
    };

    const response = await fetch(`http://${current_ip}:3000/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(comment),
    });

    if (!response.ok) {
      throw new Error(`Failed to add comment (${response.status})`);
    }

    return (await response.json()) as Comment;
  }
);

const commentSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state, action) => {
        if (action.meta.arg.isRefresh) {
          state.refreshingPostId = action.meta.arg.postId;
        } else {
          state.loadingPostId = action.meta.arg.postId;
        }
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        if (action.payload.isRefresh) {
          state.refreshingPostId = null;
          state.byPostId[action.payload.postId] = action.payload.comments;
        } else {
          state.loadingPostId = null;
          const existing = state.byPostId[action.payload.postId] ?? [];
          const existingIds = new Set(existing.map((comment) => comment.id));
          state.byPostId[action.payload.postId] = [
            ...existing,
            ...action.payload.comments.filter((comment) => !existingIds.has(comment.id)),
          ];
        }
        state.pageByPostId[action.payload.postId] = action.payload.page;
        state.hasMoreByPostId[action.payload.postId] = action.payload.hasMore;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        if (action.meta.arg.isRefresh) {
          state.refreshingPostId = null;
        } else {
          state.loadingPostId = null;
        }
        state.error = action.error.message ?? "Failed to load comments";
      })
      .addCase(addComment.pending, (state, action) => {
        state.submittingPostId = action.meta.arg.postId;
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.submittingPostId = null;
        const comments = state.byPostId[action.payload.postId] ?? [];
        comments.unshift(action.payload);
        state.byPostId[action.payload.postId] = comments;
      })
      .addCase(addComment.rejected, (state, action) => {
        state.submittingPostId = null;
        state.error = action.error.message ?? "Failed to add comment";
      });
  },
});

export default commentSlice.reducer;
