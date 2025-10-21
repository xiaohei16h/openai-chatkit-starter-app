"use client";

import type { ReactNode } from "react";

type ErrorOverlayProps = {
  error: string | null;
  fallbackMessage?: ReactNode;
  onRetry?: (() => void) | null;
  retryLabel?: string;
  loadingType?: "initializing" | "connecting" | "retrying" | "error";
  customLoadingMessage?: string;
  theme?: "light" | "dark";
};

export function ErrorOverlay({
  error,
  fallbackMessage,
  onRetry,
  retryLabel,
  loadingType,
  customLoadingMessage,
  theme = "light",
}: ErrorOverlayProps) {
  if (!error && !fallbackMessage) {
    return null;
  }

  // 使用自定义加载消息或默认消息
  const getLoadingMessage = () => {
    if (customLoadingMessage) {
      return customLoadingMessage;
    }
    
    if (loadingType === "initializing") {
      return "正在初始化聊天助手...";
    } else if (loadingType === "connecting") {
      return "正在连接服务器...";
    } else if (loadingType === "retrying") {
      return "正在重试连接...";
    } else if (loadingType === "error") {
      return "连接失败，请检查网络设置";
    }
    
    return fallbackMessage || "Loading assistant session...";
  };

  const content = error ?? getLoadingMessage();

  if (!content) {
    return null;
  }

  const isError = Boolean(error);
  const isLoading = !isError && Boolean(fallbackMessage);

  const isDark = theme === "dark";
  
  return (
    <div className={`pointer-events-none absolute inset-0 z-10 flex h-full w-full flex-col justify-center rounded-[inherit] p-6 text-center backdrop-blur ${
      isDark ? "bg-slate-900/90" : "bg-white/85"
    }`}>
      <div className={`pointer-events-auto mx-auto w-full max-w-md rounded-xl px-6 py-4 text-lg font-medium shadow-lg ${
        isDark 
          ? "bg-slate-800 text-slate-100 shadow-xl" 
          : "bg-white text-slate-700"
      }`}>
        {isLoading && (
          <div className="mb-4 flex justify-center">
            <div className={`h-8 w-8 animate-spin rounded-full border-4 ${
              isDark 
                ? "border-slate-600 border-t-blue-400" 
                : "border-slate-300 border-t-blue-600"
            }`}></div>
          </div>
        )}
        <div>{content}</div>
        {error && onRetry ? (
          <button
            type="button"
            className={`mt-4 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold shadow-none transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
              isDark
                ? "bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-slate-500"
                : "bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-500"
            }`}
            onClick={onRetry}
          >
            {retryLabel ?? "Restart chat"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
