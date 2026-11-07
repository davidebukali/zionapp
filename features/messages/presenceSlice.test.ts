import presenceReducer, {
  setOnlineUsers,
  userJoinedOnline,
  userLeftOnline,
  resetPresence,
} from "./presenceSlice";
import { deleteUserData } from "../auth/authSlice";

describe("features/messages/presenceSlice", () => {
  const initialState = {
    onlineUserIds: [],
  };

  it("returns initial state on undefined action", () => {
    expect(presenceReducer(undefined, { type: "UNKNOWN" })).toEqual(initialState);
  });

  it("sets unique online users and removes duplicates", () => {
    const state = presenceReducer(
      initialState,
      setOnlineUsers(["user-1", "user-2", "user-1"])
    );
    expect(state.onlineUserIds).toEqual(["user-1", "user-2"]);
  });

  it("adds user to online users without duplicating", () => {
    let state = presenceReducer(initialState, userJoinedOnline("user-1"));
    expect(state.onlineUserIds).toEqual(["user-1"]);

    state = presenceReducer(state, userJoinedOnline("user-2"));
    expect(state.onlineUserIds).toEqual(["user-1", "user-2"]);

    state = presenceReducer(state, userJoinedOnline("user-1"));
    expect(state.onlineUserIds).toEqual(["user-1", "user-2"]);
  });

  it("removes user from online users", () => {
    const activeState = {
      onlineUserIds: ["user-1", "user-2", "user-3"],
    };
    const state = presenceReducer(activeState, userLeftOnline("user-2"));
    expect(state.onlineUserIds).toEqual(["user-1", "user-3"]);
  });

  it("resets state back to initial when resetPresence is dispatched", () => {
    const activeState = {
      onlineUserIds: ["user-1", "user-2"],
    };
    const state = presenceReducer(activeState, resetPresence());
    expect(state).toEqual(initialState);
  });

  it("resets state when deleteUserData.fulfilled is dispatched (on logout)", () => {
    const activeState = {
      onlineUserIds: ["user-1"],
    };
    const state = presenceReducer(activeState, {
      type: deleteUserData.fulfilled.type,
    });
    expect(state).toEqual(initialState);
  });
});

