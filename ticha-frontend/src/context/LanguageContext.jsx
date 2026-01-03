import { useState } from "react";
import { LanguageContext } from "./LanguageContextCreator";

const getInitialLanguage = () => {
  const saved = localStorage.getItem("ticha_language");
  if (saved) return saved;
  return navigator.language.startsWith("en") ? "en" : "fr";
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(getInitialLanguage);

  const switchLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("ticha_language", lang);
  };

  return (
    <LanguageContext.Provider value={{ language, switchLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
