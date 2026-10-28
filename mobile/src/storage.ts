const KEY = "toppershelf-app-onboarded";
export const isOnboarded = () => {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};
export const setOnboarded = () => {
  try {
    localStorage.setItem(KEY, "1");
  } catch {
    /* storage blocked: the intro just shows again */
  }
};
