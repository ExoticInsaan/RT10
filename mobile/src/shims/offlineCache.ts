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
