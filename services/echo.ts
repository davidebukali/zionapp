import Echo from "laravel-echo";
import Pusher from "pusher-js";
import {
  BROADCAST_AUTH_URL,
  REVERB_APP_KEY,
  REVERB_FORCE_TLS,
  REVERB_HOST,
  REVERB_PORT,
} from "../constants";

// Polyfill Pusher constructor on React Native / Hermes global environment
// In pusher-js dist/react-native/pusher.js, the constructor is exported as { Pusher: class Ke }
const PusherClient: any =
  (Pusher as any)?.Pusher ?? (Pusher as any)?.default ?? Pusher;
(globalThis as any).Pusher = PusherClient;
if (typeof window !== "undefined") {
  (window as any).Pusher = PusherClient;
}

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
    Pusher: PusherClient,
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
      console.log(`[WS:Connection] State: ${states.previous} -> ${states.current}`);
    });
    connection.bind("connected", () => {
      console.log(`[WS:Connection] Connected successfully! Socket ID: ${connection.socket_id}`);
    });
    connection.bind("disconnected", () => {
      console.log("[WS:Connection] Disconnected");
    });
    connection.bind("error", (error: any) => {
      console.warn("[WS:Connection] Connection Error:", error);
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

