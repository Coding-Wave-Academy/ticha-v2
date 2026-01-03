import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { OnboardingProvider } from "./context/OnboardingContext";
import "./styles/variables.css";
import "./styles/brutal.css";
import "./styles/toast.css";
import App from "./app/App";

// Auto-inject dev token into localStorage when VITE_DEV_TOKEN is set (non-production only)
if (import.meta.env.MODE !== 'production' && import.meta.env.VITE_DEV_TOKEN) {
  try {
    localStorage.setItem('ticha_token', import.meta.env.VITE_DEV_TOKEN);
    console.info('Dev token injected into localStorage.ticha_token');
  } catch (err) {
    console.warn('Failed to set dev token in localStorage', err);
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <OnboardingProvider>
          <App />
        </OnboardingProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);
