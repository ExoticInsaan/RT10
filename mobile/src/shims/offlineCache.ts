/** Where the app keeps copies of the signed-in person's data on this phone (see useAccountData.ts). */
export const OFFLINE_PREFIX = "toppershelf-offline:";
export const OFFLINE_USER_KEY = "toppershelf-offline-user";

/** Removes those copies (used on sign-out so the next person on the phone cannot see them). */
export function clearOfflineCache() {
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(OFFLINE_PREFIX) || key === OFFLINE_USER_KEY) localStorage.removeItem(key);
    }
  } catch {
    /* nothing to clear */
  }
}

/** Device copies of the garden, favourites and recent tools. They belong to whoever was signed in. */
const ACCOUNT_DEVICE_KEYS = [
  "fz-garden",
  "fz-garden-stamp",
  "fz-garden-user",
  "fz-buddy-name",
  "fz-buddy-watered",
  "toppershelf-favourites",
  "toppershelf-recent",
  "toppershelf-lists-user",
];

/** Wiped on sign-out so the next account on this phone starts from its own saved copy, never the previous account's. */
export function clearAccountDeviceData() {
  clearOfflineCache();
  try {
    ACCOUNT_DEVICE_KEYS.forEach((key) => localStorage.removeItem(key));
  } catch {
    /* nothing to clear */
  }
}
