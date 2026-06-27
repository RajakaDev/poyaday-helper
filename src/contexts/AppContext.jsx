import { createContext, useEffect, useMemo, useState } from "react";

export const AppContext = createContext(null);

function getStoredLang() {
  return localStorage.getItem("poyaday_lang") || "si";
}

function getStoredTheme() {
  return localStorage.getItem("poyaday_theme") || "dark";
}

export function AppProvider({ children }) {
  const [lang, setLangState] = useState(getStoredLang);
  const [theme, setThemeState] = useState(getStoredTheme);
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const setLang = (value) => {
    localStorage.setItem("poyaday_lang", value);
    setLangState(value);
  };

  const setTheme = (value) => {
    localStorage.setItem("poyaday_theme", value);
    setThemeState(value);
  };

  const value = useMemo(
    () => ({
      lang,
      setLang,
      theme,
      setTheme,
      online,
    }),
    [lang, theme, online]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}