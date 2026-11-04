import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";
import { getEchoClient } from "../services/echo";
import { messagesApi } from "../features/messages/api";
import { MessageSentEvent } from "../features/messages/types";
import { normalizeMessage } from "../features/messages/utils";

/**
 * Subscribes to the global user channel `private-users.{userId}`
 * to receive incoming messages, update unread counts, and keep the inbox in sync.
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
      const channel = echo.private(`users.${currentUserId}`);

      channel.listen(".message.sent", (event: MessageSentEvent) => {
        // Invalidate conversations list so inbox immediately refreshes with new message snippet & unread count
        dispatch(
          messagesApi.util.invalidateTags([{ type: "Conversation", id: "LIST" }])
        );
      });

      return () => {
        echo.leave(`users.${currentUserId}`);
      };
    } catch {
      // Ignore websocket connection issues gracefully
    }
  }, [token, currentUserId, dispatch]);
}

