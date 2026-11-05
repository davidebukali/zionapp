import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { deleteUserData } from "../auth/authSlice";
import { NewPostsState } from "./types";

const initialState: NewPostsState = {
  pendingPostIds: [],
  catchUpCount: 0,
};

export const newPostsSlice = createSlice({
  name: "newPosts",
  initialState,
  reducers: {
    newFeedItemReceived(state, action: PayloadAction<string>) {
      if (!state.pendingPostIds.includes(action.payload)) {
        state.pendingPostIds.push(action.payload);
      }
    },
    catchUpCountReceived(state, action: PayloadAction<number>) {
      state.catchUpCount = Math.max(0, action.payload);
    },
    resetNewPosts: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(deleteUserData.fulfilled, () => initialState);
  },
});

export const { newFeedItemReceived, catchUpCountReceived, resetNewPosts } =
  newPostsSlice.actions;

export default newPostsSlice.reducer;

