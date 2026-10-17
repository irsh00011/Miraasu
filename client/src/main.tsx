import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Remove the instant splash once React has painted its first frame.
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    document.getElementById("app-splash")?.remove();
  });
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  });
}
