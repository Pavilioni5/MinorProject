"use client";

import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("cloudrec-theme");
    if (saved === "dark") setDark(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("cloudrec-theme", dark ? "dark" : "light");
  }, [dark]);

  const toggle = () => setDark(d => !d);

  const theme = dark ? {
    bg: "linear-gradient(135deg, #0F0F1A 0%, #1A1A2E 50%, #16213E 100%)",
    cardBg: "#1E1E30",
    cardBorder: "rgba(79,70,229,0.2)",
    text: "#E5E7EB",
    textSecondary: "#9CA3AF",
    textMuted: "#6B7280",
    heading: "#F9FAFB",
    headerBg: "#0A0A14",
    inputBg: "#252540",
    tagBg: "rgba(79,70,229,0.15)",
    successBg: "#052E16",
    successBorder: "#166534",
    successText: "#4ADE80",
    infoBg: "#0C2D48",
    infoBorder: "#1E6091",
    shadow: "0 4px 40px rgba(0,0,0,0.3)",
    isDark: true,
  } : {
    bg: "linear-gradient(135deg, #F8F7FF 0%, #EEF2FF 50%, #F0F9FF 100%)",
    cardBg: "#fff",
    cardBorder: "rgba(79,70,229,0.1)",
    text: "#374151",
    textSecondary: "#6B7280",
    textMuted: "#9CA3AF",
    heading: "#111",
    headerBg: "#1a1a2e",
    inputBg: "#fff",
    tagBg: "#EEF2FF",
    successBg: "#F0FDF4",
    successBorder: "#BBF7D0",
    successText: "#166534",
    infoBg: "#F0F9FF",
    infoBorder: "#BAE6FD",
    shadow: "0 4px 40px rgba(79,70,229,0.08)",
    isDark: false,
  };

  return (
    <ThemeContext.Provider value={{ dark, toggle, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button onClick={toggle} style={{
      background: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
      border: "1px solid " + (dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"),
      borderRadius: 10, padding: "6px 12px", cursor: "pointer",
      color: dark ? "#FCD34D" : "#6B7280", fontWeight: 600, fontSize: 14,
      display: "flex", alignItems: "center", gap: 6, transition: "all 0.3s",
    }}>
      {dark ? "☀️" : "🌙"} {dark ? "Light" : "Dark"}
    </button>
  );
}
