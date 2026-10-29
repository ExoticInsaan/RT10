import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { initNative } from "./native";
import { restorePush } from "./push";
import { initReminders } from "./reminders";
import "./styles.css";

initNative();
void restorePush();
initReminders();
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
