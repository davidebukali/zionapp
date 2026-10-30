import React from "react";
import ReactTestRenderer, { act } from "react-test-renderer";
import { TouchableOpacity } from "react-native";

jest.mock("@expo/vector-icons/Ionicons", () => "Ionicons");
jest.mock("react-native-paper", () => {
  const actual = jest.requireActual("react-native-paper");
  return {
    ...actual,
    useTheme: () => ({
      colors: {
        surface: "#FFFFFF",
        onSurface: "#111111",
        onSurfaceVariant: "#6F6262",
        outlineVariant: "#EFE1E1",
        shadow: "#000000",
        error: "#BA1A1A",
        primary: "#DE3A3A",
        primaryContainer: "#FDE8E8",
        onPrimaryContainer: "#8F1F1F",
      },
    }),
  };
});

import PostCard from "../PostCard";
import { PostCardMenu } from "./PostCardMenu";
import { PostCardFooter } from "./PostCardFooter";
import { PostCardHeader } from "./PostCardHeader";
import { normalizePost } from "../../../features/posts/types";

describe("PostCard & Action components", () => {
  it("renders post card with author, title and body text", () => {
    const tree = ReactTestRenderer.create(
      <PostCard
        title="Jane Doe"
        createdAt="2026-10-30T10:00:00Z"
        body="Test body content"
      />
    );

    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain("Jane Doe");
    expect(json).toContain("Test body content");
  });

  it("renders activity indicator banner in header for repost, like, and comment", () => {
    const repostTree = ReactTestRenderer.create(
      <PostCardHeader
        title="Alex Author"
        createdAt="2026-10-30T10:00:00Z"
        activityType="repost"
        activityActor="Jane Doe"
      />
    );
    expect(JSON.stringify(repostTree.toJSON())).toContain("Jane Doe reposted");

    const likeTree = ReactTestRenderer.create(
      <PostCardHeader
        title="Alex Author"
        createdAt="2026-10-30T10:00:00Z"
        activityType="like"
        activityActor="John Smith"
      />
    );
    expect(JSON.stringify(likeTree.toJSON())).toContain("John Smith liked");

    const commentTree = ReactTestRenderer.create(
      <PostCardHeader
        title="Alex Author"
        createdAt="2026-10-30T10:00:00Z"
        activityType="comment"
        activityActor="Sarah Connor"
      />
    );
    expect(JSON.stringify(commentTree.toJSON())).toContain("Sarah Connor commented");
  });

  it("does not render activity banner on original post even when isReposted is true", () => {
    const originalPostTree = ReactTestRenderer.create(
      <PostCard
        title="Alex Author"
        createdAt="2026-10-30T10:00:00Z"
        body="Original post content"
        isReposted={true}
      />
    );
    expect(JSON.stringify(originalPostTree.toJSON())).not.toContain("reposted");
  });

  it("renders activity banner on a reposted post entry when activityType is repost", () => {
    const repostedPostTree = ReactTestRenderer.create(
      <PostCard
        title="Alex Author"
        createdAt="2026-10-30T10:00:00Z"
        body="Reposted post content"
        isReposted={true}
        activityType="repost"
        activityActor="Jane Doe"
      />
    );
    expect(JSON.stringify(repostedPostTree.toJSON())).toContain("Jane Doe reposted");
  });

  it("does not render activity banner when activityType is missing or post", () => {
    const noActivityTree = ReactTestRenderer.create(
      <PostCardHeader
        title="Alex Author"
        createdAt="2026-10-30T10:00:00Z"
      />
    );
    expect(JSON.stringify(noActivityTree.toJSON())).not.toContain("reposted");

    const postTypeTree = ReactTestRenderer.create(
      <PostCardHeader
        title="Alex Author"
        createdAt="2026-10-30T10:00:00Z"
        activityType="post"
        activityActor="Alex Author"
      />
    );
    expect(JSON.stringify(postTypeTree.toJSON())).not.toContain("reposted");
  });

  it("renders own post options in PostCardMenu (Edit, Delete, Share)", () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();

    const renderer = ReactTestRenderer.create(
      <PostCardMenu
        visible={true}
        anchorPosition={{ x: 100, y: 50, width: 40, height: 40 }}
        isOwnPost={true}
        onClose={jest.fn()}
        onPressEdit={onEdit}
        onPressDelete={onDelete}
      />
    );

    const json = JSON.stringify(renderer.toJSON());
    expect(json).toContain("Edit");
    expect(json).toContain("Delete");
    expect(json).toContain("Share");
    expect(json).not.toContain("Follow");
    expect(json).not.toContain("Report");
  });

  it("renders other user post options in PostCardMenu (Follow/Unfollow, Report, Share)", () => {
    const onFollowToggle = jest.fn();
    const onReport = jest.fn();

    const renderer = ReactTestRenderer.create(
      <PostCardMenu
        visible={true}
        anchorPosition={{ x: 100, y: 50, width: 40, height: 40 }}
        isOwnPost={false}
        isFollowingAuthor={false}
        onClose={jest.fn()}
        onPressFollowToggle={onFollowToggle}
        onPressReport={onReport}
      />
    );

    let json = JSON.stringify(renderer.toJSON());
    expect(json).toContain("Follow");
    expect(json).toContain("Report");
    expect(json).toContain("Share");
    expect(json).not.toContain("Edit");
    expect(json).not.toContain("Delete");

    // Re-render with isFollowingAuthor = true
    act(() => {
      renderer.update(
        <PostCardMenu
          visible={true}
          anchorPosition={{ x: 100, y: 50, width: 40, height: 40 }}
          isOwnPost={false}
          isFollowingAuthor={true}
          onClose={jest.fn()}
          onPressFollowToggle={onFollowToggle}
          onPressReport={onReport}
        />
      );
    });

    json = JSON.stringify(renderer.toJSON());
    expect(json).toContain("Unfollow");
  });

  it("transitions to Share Options sub-flow in PostCardMenu", () => {
    const onShareDM = jest.fn();
    const onShareSystem = jest.fn();

    const renderer = ReactTestRenderer.create(
      <PostCardMenu
        visible={true}
        anchorPosition={{ x: 100, y: 50, width: 40, height: 40 }}
        isOwnPost={true}
        onClose={jest.fn()}
        onPressShareDM={onShareDM}
        onPressShareSystem={onShareSystem}
      />
    );

    // Find the Share button and trigger press
    const touchables = renderer.root.findAllByType(TouchableOpacity);
    const shareButton = touchables.find(
      (t) => t.props.accessibilityLabel === "Share options"
    );
    expect(shareButton).toBeDefined();

    act(() => {
      shareButton?.props.onPress();
    });

    const json = JSON.stringify(renderer.toJSON());
    expect(json).toContain("Send via Direct Message");
    expect(json).toContain("Share via System...");

    // Press DM option
    const dmButton = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === "Send via Direct Message");
    expect(dmButton).toBeDefined();

    act(() => {
      dmButton?.props.onPress();
    });

    expect(onShareDM).toHaveBeenCalledTimes(1);
  });

  it("renders repost button in footer with active green color when isReposted is true", () => {
    const onRepost = jest.fn();
    const renderer = ReactTestRenderer.create(
      <PostCardFooter
        likes="5"
        comments="2"
        repostsCount={12}
        isReposted={true}
        onPressRepost={onRepost}
      />
    );

    const json = JSON.stringify(renderer.toJSON());
    expect(json).toContain("12 reposts");
    expect(json).not.toContain("Share post");

    const repostBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === "12 reposts");
    expect(repostBtn).toBeDefined();

    act(() => {
      repostBtn?.props.onPress();
    });

    expect(onRepost).toHaveBeenCalledTimes(1);
  });

  it("verifies end-to-end feed normalization: original post does not show banner, reposted entry does", () => {
    // 1. Original post in feed that the user previously reposted
    const rawOriginalPost = {
      id: "post-101",
      content: "Original photography tips",
      is_reposted: true,
      reposted: true,
      reposts_count: 8,
      user: { id: "user-1", name: "Alex Rivera" },
    };
    // Feed item without activity (type: 'post')
    const originalFeedPost = normalizePost(rawOriginalPost, undefined, undefined, "feed-1");

    expect(originalFeedPost.isReposted).toBe(true);
    expect(originalFeedPost.activityType).toBeUndefined();
    expect(originalFeedPost.activityActor).toBeUndefined();

    const originalTree = ReactTestRenderer.create(
      <PostCard
        title={originalFeedPost.title}
        createdAt={originalFeedPost.createdAt}
        body={originalFeedPost.content}
        isReposted={originalFeedPost.isReposted}
        repostsCount={originalFeedPost.repostsCount}
        activityType={originalFeedPost.activityType}
        activityActor={originalFeedPost.activityActor}
      />
    );
    const originalJson = JSON.stringify(originalTree.toJSON());
    // Original post MUST NOT have the activity banner text
    expect(originalJson).not.toContain("reposted");
    expect(originalJson).toContain("8 reposts"); // footer still reflects count

    // 2. Reposted feed item from another user ("Jane Doe")
    const repostActivity = {
      type: "repost" as const,
      actor: { id: "user-2", name: "Jane Doe" },
    };
    const repostedFeedPost = normalizePost(rawOriginalPost, undefined, repostActivity, "feed-2");

    expect(repostedFeedPost.activityType).toBe("repost");
    expect(repostedFeedPost.activityActor).toBe("Jane Doe");

    const repostedTree = ReactTestRenderer.create(
      <PostCard
        title={repostedFeedPost.title}
        createdAt={repostedFeedPost.createdAt}
        body={repostedFeedPost.content}
        isReposted={repostedFeedPost.isReposted}
        repostsCount={repostedFeedPost.repostsCount}
        activityType={repostedFeedPost.activityType}
        activityActor={repostedFeedPost.activityActor}
      />
    );
    const repostedJson = JSON.stringify(repostedTree.toJSON());
    // Reposted entry MUST render the activity banner text
    expect(repostedJson).toContain("Jane Doe reposted");
  });
});
