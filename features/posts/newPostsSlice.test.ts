import newPostsReducer, {
  newFeedItemReceived,
  catchUpCountReceived,
  resetNewPosts,
} from "./newPostsSlice";
import { deleteUserData } from "../auth/authSlice";

describe("features/posts/newPostsSlice", () => {
  const initialState = {
    pendingPostIds: [],
    catchUpCount: 0,
  };

  it("returns initial state on undefined action", () => {
    expect(newPostsReducer(undefined, { type: "UNKNOWN" })).toEqual(initialState);
  });

  it("adds unique post IDs and ignores duplicates", () => {
    let state = newPostsReducer(initialState, newFeedItemReceived("post-1"));
    expect(state.pendingPostIds).toEqual(["post-1"]);

    state = newPostsReducer(state, newFeedItemReceived("post-2"));
    expect(state.pendingPostIds).toEqual(["post-1", "post-2"]);

    // Duplicate ID should not be appended
    state = newPostsReducer(state, newFeedItemReceived("post-1"));
    expect(state.pendingPostIds).toEqual(["post-1", "post-2"]);
  });

  it("sets catch-up count and clamps negative values to 0", () => {
    let state = newPostsReducer(initialState, catchUpCountReceived(5));
    expect(state.catchUpCount).toBe(5);

    state = newPostsReducer(state, catchUpCountReceived(-3));
    expect(state.catchUpCount).toBe(0);
  });

  it("resets state back to initial when resetNewPosts is dispatched", () => {
    const dirtyState = {
      pendingPostIds: ["post-1", "post-2"],
      catchUpCount: 4,
    };
    const state = newPostsReducer(dirtyState, resetNewPosts());
    expect(state).toEqual(initialState);
  });

  it("resets state when deleteUserData.fulfilled is dispatched (on logout)", () => {
    const dirtyState = {
      pendingPostIds: ["post-1"],
      catchUpCount: 3,
    };
    const action = { type: deleteUserData.fulfilled.type };
    const state = newPostsReducer(dirtyState, action);
    expect(state).toEqual(initialState);
  });
});

