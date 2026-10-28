import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { initNative } from "./native";
import { restorePush } from "./push";
import "./styles.css";

initNative();
void restorePush();
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
