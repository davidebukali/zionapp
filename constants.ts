const android_ip = "10.0.2.2";
const pece_ip = "192.168.1.160";

//create an object with all ips aboove
export const ips = {
    android: android_ip,
    pece: pece_ip
}

export const current_ip = ips["pece"];

export const BASE_URL = `http://${current_ip}`;
export const API_BASE_URL = `${BASE_URL}/api/v1`;

export const MAX_CHARACTERS = 3000;
export const MAX_MEDIA = 10;
export const MAX_POLL_ATTEMPTS = 12;
export const POLL_INTERVAL_MS = 800;

export const DEBOUNCE_DELAY_MS = 300;

export const REVERB_APP_KEY =
  process.env.EXPO_PUBLIC_REVERB_APP_KEY || "8e18i7j3rlxczsyjllta";
export const REVERB_HOST = __DEV__ ? current_ip : "tsiyonapp.com";
export const REVERB_PORT = __DEV__ ? 8080 : 443;
export const REVERB_FORCE_TLS = !__DEV__;
export const BROADCAST_AUTH_URL = `${BASE_URL}/api/broadcasting/auth`;

export const TYPING_THROTTLE_MS = 3000;
export const TYPING_EXPIRY_MS = 3500;
export const MAX_MESSAGE_LENGTH = 5000;
export const MAX_CHAT_MEDIA = 4;
