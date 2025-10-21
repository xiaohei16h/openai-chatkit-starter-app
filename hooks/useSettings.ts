"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";

export type ChatSettings = {
  // 聊天配置
  greeting: string;
  placeholder: string;
  starterPrompts: Array<{
    label: string;
    prompt: string;
    icon: string;
  }>;
  
  // 主题配置
  theme: "light" | "dark" | "system";
  primaryColor: string;
  accentColor: string;
  
  // 功能配置
  enableFileUpload: boolean;
  enableFeedback: boolean;
  enableThreadActions: boolean;
  
  // 界面配置
  borderRadius: "none" | "small" | "medium" | "large" | "round";
  chatHeight: number; // 聊天区域高度百分比
  showWelcomeScreen: boolean;
};

const DEFAULT_SETTINGS: ChatSettings = {
  greeting: "How can I help you today?",
  placeholder: "Ask anything...",
  starterPrompts: [
    {
      label: "What can you do?",
      prompt: "What can you do?",
      icon: "circle-question",
    },
  ],
  theme: "system",
  primaryColor: "#0f172a",
  accentColor: "#f1f5f9",
  enableFileUpload: true,
  enableFeedback: false,
  enableThreadActions: true,
  borderRadius: "round",
  chatHeight: 90,
  showWelcomeScreen: true,
};

const STORAGE_KEY = "chatkit-custom-settings";

function readStoredSettings(): ChatSettings | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ChatSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[useSettings] Failed to read settings", error);
    }
    return null;
  }
}

function persistSettings(settings: ChatSettings): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[useSettings] Failed to persist settings", error);
    }
  }
}

type UseSettingsResult = {
  settings: ChatSettings;
  updateSettings: (updates: Partial<ChatSettings>) => void;
  resetSettings: () => void;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => boolean;
};

export function useSettings(): UseSettingsResult {
  const [settings, setSettings] = useState<ChatSettings>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_SETTINGS;
    }
    return readStoredSettings() ?? DEFAULT_SETTINGS;
  });

  const updateSettings = useCallback((updates: Partial<ChatSettings>) => {
    setSettings((current) => {
      const newSettings = { ...current, ...updates };
      persistSettings(newSettings);
      return newSettings;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    persistSettings(DEFAULT_SETTINGS);
  }, []);

  const exportSettings = useCallback(() => {
    return JSON.stringify(settings, null, 2);
  }, [settings]);

  const importSettings = useCallback((settingsJson: string) => {
    try {
      const parsed = JSON.parse(settingsJson) as Partial<ChatSettings>;
      const newSettings = { ...DEFAULT_SETTINGS, ...parsed };
      setSettings(newSettings);
      persistSettings(newSettings);
      return true;
    } catch (error) {
      console.error("[useSettings] Failed to import settings", error);
      return false;
    }
  }, []);

  // 监听存储变化
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) {
        return;
      }
      const stored = readStoredSettings();
      if (stored) {
        setSettings(stored);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return {
    settings,
    updateSettings,
    resetSettings,
    exportSettings,
    importSettings,
  };
}
