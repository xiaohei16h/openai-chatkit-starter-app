"use client";

import { useCallback, useState, useEffect } from "react";
import { ChatKitPanel, type WidgetAction } from "@/components/ChatKitPanel";
import { SettingsPanel } from "@/components/SettingsPanel";
import { EmailCollectionModal } from "@/components/EmailCollectionModal";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useSettings } from "@/hooks/useSettings";

export default function App() {
  const { scheme, setScheme } = useColorScheme();
  const { settings } = useSettings();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleWidgetAction = useCallback(async (action: WidgetAction) => {
    if (process.env.NODE_ENV !== "production") {
      console.info("[ChatKitPanel] widget action", action);
    }

    if (action.type === "collect_email") {
      setIsEmailModalOpen(true);
    }
  }, []);

  const handleEmailSubmit = useCallback(async (email: string) => {
    if (process.env.NODE_ENV !== "production") {
      console.info("[App] Email collected:", email);
    }

    try {
      // 发送邮箱到后端 API
      const response = await fetch("/api/collect-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          timestamp: new Date().toISOString(),
          reason: "customer service request",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit email");
      }

      const result = await response.json();
      console.log("Email submitted successfully:", result);

      // 同时保存到 localStorage 作为备份
      const emails = JSON.parse(
        localStorage.getItem("collected_emails") || "[]"
      );
      emails.push({
        email,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem("collected_emails", JSON.stringify(emails));
    } catch (error) {
      console.error("Failed to submit email:", error);
      throw error;
    }
  }, []);

  const handleResponseEnd = useCallback(() => {
    if (process.env.NODE_ENV !== "production") {
      console.debug("[ChatKitPanel] response end");
    }
  }, []);

  const currentTheme = settings.theme === "system" ? scheme : settings.theme;
  
  return (
    <main className={`flex min-h-screen flex-col items-center justify-end ${
      currentTheme === "dark" ? "bg-slate-950" : "bg-slate-100"
    }`}>
      {/* Settings Button */}
      {isClient && (
        <div className="fixed top-4 right-4 z-40">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={`rounded-full p-3 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl ${
              currentTheme === "dark" 
                ? "bg-slate-800/90 hover:bg-slate-800" 
                : "bg-white/90 hover:bg-white"
            }`}
            title="打开设置"
          >
            <svg className="h-6 w-6 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      )}

      {/* Settings Info Display */}
      {isClient && (
        <div className="fixed top-4 left-4 z-40 max-w-sm">
          <div className={`rounded-lg p-4 shadow-lg backdrop-blur-sm ${
            currentTheme === "dark" 
              ? "bg-slate-800/90" 
              : "bg-white/90"
          }`}>
            <h3 className={`mb-2 text-sm font-semibold ${
              currentTheme === "dark" ? "text-slate-100" : "text-slate-900"
            }`}>当前设置</h3>
            <div className={`space-y-1 text-xs ${
              currentTheme === "dark" ? "text-slate-400" : "text-slate-600"
            }`}>
              <div className="flex items-center justify-between">
                <span>主题:</span>
                <span className="font-medium">{settings.theme === "system" ? "跟随系统" : settings.theme === "light" ? "浅色" : "深色"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>文件上传:</span>
                <span className="font-medium">{settings.enableFileUpload ? "启用" : "禁用"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>反馈功能:</span>
                <span className="font-medium">{settings.enableFeedback ? "启用" : "禁用"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>聊天高度:</span>
                <span className="font-medium">{settings.chatHeight}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>圆角样式:</span>
                <span className="font-medium">
                  {settings.borderRadius === "none" ? "无" : 
                   settings.borderRadius === "small" ? "小" :
                   settings.borderRadius === "medium" ? "中" :
                   settings.borderRadius === "large" ? "大" : "圆形"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>启动提示词:</span>
                <span className="font-medium text-xs">
                  {settings.starterPrompts.length > 0 
                    ? (settings.starterPrompts[0].label.length > 15 
                        ? settings.starterPrompts[0].label.substring(0, 15) + "..."
                        : settings.starterPrompts[0].label)
                    : "无"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>加载消息:</span>
                <span className="font-medium text-xs">
                  {settings.loadingMessages.initializing.length > 20 
                    ? settings.loadingMessages.initializing.substring(0, 20) + "..."
                    : settings.loadingMessages.initializing}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-5xl">
        <ChatKitPanel
          theme={scheme}
          onWidgetAction={handleWidgetAction}
          onResponseEnd={handleResponseEnd}
          onThemeRequest={setScheme}
        />
      </div>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Email Collection Modal */}
      <EmailCollectionModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onSubmit={handleEmailSubmit}
        theme={currentTheme}
      />
    </main>
  );
}
