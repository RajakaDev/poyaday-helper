import { createContext, useMemo, useState } from "react";

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [lang, setLang] = useState("si");
  const [theme, setTheme] = useState("dark");
  const online = navigator.onLine;

  const value = useMemo(
    () => ({ lang, setLang, theme, setTheme, online }),
    [lang, theme, online]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}