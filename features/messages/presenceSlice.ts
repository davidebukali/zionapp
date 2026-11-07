import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { deleteUserData } from "../auth/authSlice";
import { PresenceState } from "./types";

const initialState: PresenceState = {
  onlineUserIds: [],
};

export const presenceSlice = createSlice({
  name: "presence",
  initialState,
  reducers: {
    setOnlineUsers(state, action: PayloadAction<string[]>) {
      state.onlineUserIds = Array.from(new Set(action.payload));
    },
    userJoinedOnline(state, action: PayloadAction<string>) {
      if (!state.onlineUserIds.includes(action.payload)) {
        state.onlineUserIds.push(action.payload);
      }
    },
    userLeftOnline(state, action: PayloadAction<string>) {
      state.onlineUserIds = state.onlineUserIds.filter(
        (userId) => userId !== action.payload
      );
    },
    resetPresence: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(deleteUserData.fulfilled, () => initialState);
  },
});

export const {
  setOnlineUsers,
  userJoinedOnline,
  userLeftOnline,
  resetPresence,
} = presenceSlice.actions;

export default presenceSlice.reducer;

