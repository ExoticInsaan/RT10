import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import LanguageProvider from "./i18n/LanguageProvider";
import { registerAppContent } from "@/lib/tools/appContent";
import { hindiContent } from "./i18n/appContent.hi";

registerAppContent(hindiContent);
import { initNative } from "./native";
import { restorePush } from "./push";
import { initCountdownWidget } from "./widget";
import { initFocusTimer } from "./focusTimer";
import { initReminders } from "./reminders";
import "./styles.css";

initNative();
void restorePush();
initReminders();
initFocusTimer();
initCountdownWidget();
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
);
