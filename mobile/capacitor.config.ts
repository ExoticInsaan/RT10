import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "online.toppershelf.app",
  appName: "TopperShelf",
  // The built app (Vite output). Everything is bundled inside the Android app, so it opens instantly and works offline.
  webDir: "dist",
  android: { backgroundColor: "#fffbf7" },
  plugins: {
    SplashScreen: { launchShowDuration: 0, backgroundColor: "#fffbf7" },
    LocalNotifications: { smallIcon: "ic_stat_toppershelf", iconColor: "#2563eb" },
    StatusBar: { style: "LIGHT", backgroundColor: "#fffbf7", overlaysWebView: false },
  },
};

export default config;
