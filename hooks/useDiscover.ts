import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { DiscoverAccount, DiscoverTabType } from "../components/Discover/types";
import {
  useFollowUserMutation,
  useSearchUsersQuery,
  useUnfollowUserMutation,
} from "../features/users/api";
import { useSearchPostsQuery } from "../features/posts/api";
import { Post } from "../features/posts/types";
import { mergeUniquePosts } from "../features/posts/utils";
import { useDebounce } from "./useDebounce";
import { useFeedPostActions } from "./useFeedPostActions";
import { useReportPost } from "./useReportPost";
import { useSharePostViaDM } from "./useSharePostViaDM";

export function useDiscover() {
  const [activeTab, setActiveTab] = useState<DiscoverTabType>("accounts");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [postPage, setPostPage] = useState(1);
  const [accumulatedPosts, setAccumulatedPosts] = useState<Post[]>([]);

  const currentUser = useSelector((state: RootState) => state.auth.user);

  const activeSearchTerm = debouncedQuery.trim() || "*";

  // Account search query
  const {
    data: rawAccounts = [],
    isLoading: isLoadingAccounts,
    isFetching: isFetchingAccounts,
    refetch: refetchAccounts,
  } = useSearchUsersQuery({ q: activeSearchTerm });

  // Post search query
  const {
    data: postsResult,
    isLoading: isLoadingPosts,
    isFetching: isFetchingPosts,
    refetch: refetchPosts,
  } = useSearchPostsQuery({
    q: activeSearchTerm,
    page: postPage,
  });

  // Reset pagination and posts cache when search term changes
  useEffect(() => {
    setPostPage(1);
    setAccumulatedPosts([]);
  }, [activeSearchTerm]);

  // Sync accumulated posts with incoming search pages
  useEffect(() => {
    if (postsResult?.posts && postsResult.posts.length > 0) {
      setAccumulatedPosts((previousPosts) => {
        if (postPage === 1) {
          return postsResult.posts;
        }
        return mergeUniquePosts(previousPosts, postsResult.posts, (post) => post.id);
      });
    } else if (postPage === 1 && postsResult?.posts?.length === 0) {
      setAccumulatedPosts([]);
    }
  }, [postsResult?.posts, postPage]);

  const getCategorySearchTerm = (category: string): string => {
    switch (category) {
      case "Churches":
        return "church";
      case "Ministries":
        return "ministr";
      case "Blogs":
        return "blog";
      case "Podcasts":
        return "podcast";
      default:
        return category.toLowerCase();
    }
  };

  // Client-side category filtering for accounts
  const filteredAccounts = useMemo(() => {
    if (selectedCategory === "All") return rawAccounts;
    if (selectedCategory === "Pastors & Leaders") {
      return rawAccounts.filter((account) => {
        const text = `${account.name || ""} ${account.meta || ""} ${account.bio || ""}`.toLowerCase();
        return text.includes("pastor") || text.includes("leader");
      });
    }
    const term = getCategorySearchTerm(selectedCategory);
    return rawAccounts.filter((account) => {
      const text = `${account.name || ""} ${account.meta || ""} ${account.bio || ""}`.toLowerCase();
      return text.includes(term);
    });
  }, [rawAccounts, selectedCategory]);

  // Client-side category filtering for posts
  const filteredPosts = useMemo(() => {
    if (selectedCategory === "All") return accumulatedPosts;
    if (selectedCategory === "Pastors & Leaders") {
      return accumulatedPosts.filter((post) => {
        const text = `${post.author || ""} ${post.title || ""} ${post.content || ""}`.toLowerCase();
        return text.includes("pastor") || text.includes("leader");
      });
    }
    const term = getCategorySearchTerm(selectedCategory);
    return accumulatedPosts.filter((post) => {
      const text = `${post.author || ""} ${post.title || ""} ${post.content || ""}`.toLowerCase();
      return text.includes(term);
    });
  }, [accumulatedPosts, selectedCategory]);

  // Follow / Unfollow mutation handlers
  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();

  const handleToggleFollow = useCallback(
    async (account: DiscoverAccount) => {
      const searchArgs = { q: activeSearchTerm };
      try {
        if (account.isFollowing) {
          await unfollowUser({ userId: account.id, searchArgs }).unwrap();
        } else {
          await followUser({ userId: account.id, searchArgs }).unwrap();
        }
      } catch {
        // Automatic rollback handled in mutation lifecycle
      }
    },
    [activeSearchTerm, followUser, unfollowUser]
  );

  // Post action flows
  const reportFlow = useReportPost();
  const shareFlow = useSharePostViaDM();
  const postActions = useFeedPostActions({
    onReport: reportFlow.openReport,
    onShareDM: shareFlow.openShareDM,
  });

  // Pagination handler for infinite scroll
  const handleLoadMorePosts = useCallback(() => {
    if (isFetchingPosts || isLoadingPosts) return;
    const lastPage = postsResult?.lastPage ?? 1;
    if (postPage < lastPage) {
      setPostPage((previousPage) => previousPage + 1);
    }
  }, [isFetchingPosts, isLoadingPosts, postsResult?.lastPage, postPage]);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    if (activeTab === "accounts") {
      await refetchAccounts();
    } else {
      setPostPage(1);
      await refetchPosts();
    }
  }, [activeTab, refetchAccounts, refetchPosts]);

  const isLoading =
    activeTab === "accounts"
      ? isLoadingAccounts
      : isLoadingPosts && postPage === 1;

  const isFetching =
    activeTab === "accounts" ? isFetchingAccounts : isFetchingPosts;

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    accounts: filteredAccounts,
    posts: filteredPosts,
    currentUser,
    isLoading,
    isFetching,
    handleToggleFollow,
    postActions,
    handleLoadMorePosts,
    handleRefresh,
    reportFlow,
    shareFlow,
  };
}

export default useDiscover;
