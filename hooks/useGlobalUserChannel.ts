import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";
import { getEchoClient } from "../services/echo";
import { messagesApi } from "../features/messages/api";
import { MessageSentEvent, PresenceMember } from "../features/messages/types";
import {
  setOnlineUsers,
  userJoinedOnline,
  userLeftOnline,
} from "../features/messages/presenceSlice";
import {
  insertMessageInCache,
  normalizeMessage,
} from "../features/messages/utils";
import { newFeedItemReceived } from "../features/posts/newPostsSlice";
import { NewFeedItemEvent } from "../features/posts/types";

/**
 * Subscribes to:
 * 1. Global user channel `private-users.{userId}` to receive incoming messages,
 *    update unread counts, and track new feed items.
 * 2. Global presence channel `presence-online` (via Echo.join('online'))
 *    to track active online users across the entire application.
 */
export function useGlobalUserChannel() {
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const currentUserId = currentUser?.id ? String(currentUser.id) : null;

  useEffect(() => {
    if (!token || !currentUserId) {
      return;
    }

    try {
      const echo = getEchoClient(token);

      // 1. User Private Channel
      const userChannel = echo.private(`users.${currentUserId}`);

      userChannel.listen(".message.sent", (event: MessageSentEvent) => {
        const normalized = normalizeMessage(event, currentUserId);
        insertMessageInCache(
          messagesApi,
          dispatch,
          String(event.conversation_id),
          normalized
        );
      });

      userChannel.listen(".feed.new_item", (event: NewFeedItemEvent) => {
        // Ignore real-time events for our own published posts
        if (String(event.actor_id) === currentUserId) {
          return;
        }
        dispatch(newFeedItemReceived(String(event.post_id)));
      });

      // 2. Global App Presence Channel
      const onlineChannel = echo.join("online");

      onlineChannel.here((users: PresenceMember[]) => {
        if (Array.isArray(users)) {
          dispatch(setOnlineUsers(users.map((member) => String(member.id))));
        }
      });

      onlineChannel.joining((member: PresenceMember) => {
        if (member?.id) {
          dispatch(userJoinedOnline(String(member.id)));
        }
      });

      onlineChannel.leaving((member: PresenceMember) => {
        if (member?.id) {
          dispatch(userLeftOnline(String(member.id)));
        }
      });

      return () => {
        echo.leave(`users.${currentUserId}`);
        echo.leave("online");
      };
    } catch {
      // Ignore websocket connection issues gracefully
    }
  }, [token, currentUserId, dispatch]);
}

