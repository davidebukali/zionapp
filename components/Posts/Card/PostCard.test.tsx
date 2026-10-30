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
        primaryContainer: "#FDE8E8",
        onPrimaryContainer: "#8F1F1F",
      },
    }),
  };
});

import PostCard from "../PostCard";
import { PostCardMenu } from "./PostCardMenu";
import { PostCardFooter } from "./PostCardFooter";

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

  it("renders repost button in footer in place of standalone share button", () => {
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
});
