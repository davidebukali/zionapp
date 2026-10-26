const kijani_ip = "172.16.4.141";
const android_ip = "10.0.2.2";
const pece_ip = "192.168.1.160";

//create an object with all ips aboove
export const ips = {
    kijani: kijani_ip,
    android: android_ip,
    pece: pece_ip
}

export const current_ip = ips["pece"];

export const API_PORT = 8000;
export const BASE_URL = `http://${current_ip}`;
export const API_BASE_URL = `${BASE_URL}/api/v1`;

export const MAX_CHARACTERS = 3000;
export const MAX_MEDIA = 10;
export const MAX_POLL_ATTEMPTS = 12;
export const POLL_INTERVAL_MS = 800;
