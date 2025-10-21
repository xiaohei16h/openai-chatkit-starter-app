"use client";

import type { ReactNode } from "react";

type ErrorOverlayProps = {
  error: string | null;
  fallbackMessage?: ReactNode;
  onRetry?: (() => void) | null;
  retryLabel?: string;
  loadingType?: "initializing" | "connecting" | "retrying" | "error";
  customLoadingMessage?: string;
};

export function ErrorOverlay({
  error,
  fallbackMessage,
  onRetry,
  retryLabel,
  loadingType,
  customLoadingMessage,
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

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex h-full w-full flex-col justify-center rounded-[inherit] bg-white/85 p-6 text-center backdrop-blur dark:bg-slate-900/90">
      <div className="pointer-events-auto mx-auto w-full max-w-md rounded-xl bg-white px-6 py-4 text-lg font-medium text-slate-700 dark:bg-transparent dark:text-slate-100">
        {isLoading && (
          <div className="mb-4 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600"></div>
          </div>
        )}
        <div>{content}</div>
        {error && onRetry ? (
          <button
            type="button"
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-none transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            onClick={onRetry}
          >
            {retryLabel ?? "Restart chat"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
