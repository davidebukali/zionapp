import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";
import { getEchoClient } from "../services/echo";
import { messagesApi } from "../features/messages/api";
import { useGetMeQuery } from "../features/auth/api";
import { setUser } from "../features/auth/authSlice";
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
 * 1. Global presence channel `presence-online` (via Echo.join('online'))
 *    to track active online users across the entire application.
 * 2. Global user channel `private-users.{userId}` to receive incoming messages,
 *    update unread counts, and track new feed items.
 */
export function useGlobalUserChannel() {
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const currentUserId = currentUser?.id ? String(currentUser.id) : null;

  // Hydrate user profile if token is present but currentUser is not yet loaded into state
  const { data: meData } = useGetMeQuery(undefined, {
    skip: !token || Boolean(currentUserId),
  });

  useEffect(() => {
    if (meData && !currentUser) {
      const resolvedUser = meData.resource || meData.data;
      if (resolvedUser) {
        dispatch(setUser(resolvedUser));
      }
    }
  }, [meData, currentUser, dispatch]);

  // 1. Global Presence Channel (Active whenever authenticated with a token)
  useEffect(() => {
    if (!token) {
      return;
    }

    try {
      const echo = getEchoClient(token);
      const onlineChannel = echo.join("online");

      onlineChannel.here((users: PresenceMember[]) => {
        if (Array.isArray(users)) {
          dispatch(
            setOnlineUsers(users.map((member) => String(member.id)))
          );
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
        echo.leave("online");
      };
    } catch (error) {
      console.warn("[WS:Global] Online presence setup error:", error);
    }
  }, [token, dispatch]);

  // 2. User Private Channel (Incoming messages & feed events)
  useEffect(() => {
    if (!token || !currentUserId) {
      return;
    }

    try {
      const echo = getEchoClient(token);
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

      return () => {
        echo.leave(`users.${currentUserId}`);
      };
    } catch (error) {
      console.warn("[WS:Global] User channel setup error:", error);
    }
  }, [token, currentUserId, dispatch]);
}

