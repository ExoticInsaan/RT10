import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
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
    <App />
  </StrictMode>,
);
