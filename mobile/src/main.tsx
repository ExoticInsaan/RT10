import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { initNative } from "./native";
import { restorePush } from "./push";
import { initFocusTimer } from "./focusTimer";
import { initReminders } from "./reminders";
import "./styles.css";

initNative();
void restorePush();
initReminders();
initFocusTimer();
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
