import Echo from "laravel-echo";
import Pusher from "pusher-js";
import {
  BROADCAST_AUTH_URL,
  REVERB_APP_KEY,
  REVERB_FORCE_TLS,
  REVERB_HOST,
  REVERB_PORT,
} from "../constants";

// Polyfill Pusher on React Native global environment
(globalThis as any).Pusher = Pusher;

let echoInstance: Echo<"reverb"> | null = null;
let currentToken: string | null = null;

/**
 * Returns an authenticated Echo singleton instance for Laravel Reverb.
 * Reconnects if the authToken changes.
 */
export function getEchoClient(authToken: string): Echo<"reverb"> {
  if (echoInstance && currentToken === authToken) {
    return echoInstance;
  }

  if (echoInstance) {
    echoInstance.disconnect();
  }

  currentToken = authToken;
  echoInstance = new Echo({
    broadcaster: "reverb",
    key: REVERB_APP_KEY,
    wsHost: REVERB_HOST,
    wsPort: REVERB_PORT,
    wssPort: REVERB_PORT,
    forceTLS: REVERB_FORCE_TLS,
    enabledTransports: REVERB_FORCE_TLS ? ["ws", "wss"] : ["ws"],
    authEndpoint: BROADCAST_AUTH_URL,
    auth: {
      headers: {
        Authorization: `Bearer ${authToken}`,
        Accept: "application/json",
      },
    },
  });

  if (__DEV__ && (echoInstance.connector as any)?.pusher?.connection) {
    const connection = (echoInstance.connector as any).pusher.connection;
    connection.bind("state_change", (states: { previous: string; current: string }) => {
      console.log(`[Reverb WebSocket] State: ${states.previous} -> ${states.current}`);
    });
    connection.bind("error", (error: any) => {
      console.warn("[Reverb WebSocket] Connection Error:", error);
    });
  }

  return echoInstance;
}

/**
 * Disconnects the active Echo client and resets singleton state.
 */
export function disconnectEcho(): void {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
    currentToken = null;
  }
}

