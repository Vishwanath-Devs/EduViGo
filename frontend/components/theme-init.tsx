"use client";

import { useEffect } from "react";

export default function ThemeInit() {
  useEffect(() => {
    function applySavedTheme() {
      const saved = localStorage.getItem("eduvigo-settings");

      let theme: "light" | "dark" | "system" = "system";

      if (saved) {
        try {
          const parsed = JSON.parse(saved);

          if (
            parsed.theme === "light" ||
            parsed.theme === "dark" ||
            parsed.theme === "system"
          ) {
            theme = parsed.theme;
          }
        } catch {
          theme = "system";
        }
      }

      const root = document.documentElement;

      if (theme === "dark") {
        root.dataset.theme = "dark";
        return;
      }

      if (theme === "light") {
        root.dataset.theme = "light";
        return;
      }

      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      root.dataset.theme = systemDark ? "dark" : "light";
    }

    applySavedTheme();

    const handleStorageChange = () => {
      applySavedTheme();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return null;
}