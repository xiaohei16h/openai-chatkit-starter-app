"use client";

import { useState, useEffect, useRef } from "react";
import type { ColorScheme } from "@/hooks/useColorScheme";

type EmailCollectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => Promise<void>;
  theme: ColorScheme;
};

type SubmitState = "idle" | "submitting" | "success" | "error";

export function EmailCollectionModal({
  isOpen,
  onClose,
  onSubmit,
  theme,
}: EmailCollectionModalProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Focus input when modal opens
      setTimeout(() => {
        emailInputRef.current?.focus();
      }, 100);
    } else {
      // Reset state when modal closes
      setEmail("");
      setError("");
      setSubmitState("idle");
    }
  }, [isOpen]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("请输入邮箱地址");
      emailInputRef.current?.focus();
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError("请输入有效的邮箱地址（例如：user@example.com）");
      emailInputRef.current?.focus();
      return;
    }

    setSubmitState("submitting");
    setError("");

    try {
      await onSubmit(trimmedEmail);
      setSubmitState("success");

      // Close modal after short delay to show success state
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err) {
      setSubmitState("error");
      setError(
        err instanceof Error
          ? err.message
          : "提交失败，请检查网络连接后重试"
      );
    }
  };

  const handleClose = () => {
    if (submitState !== "submitting") {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Clear error when user starts typing
    if (error) {
      setError("");
    }
    // Reset error state when user modifies input
    if (submitState === "error") {
      setSubmitState("idle");
    }
  };

  if (!isOpen) return null;

  const isSubmitting = submitState === "submitting";
  const isSuccess = submitState === "success";
  const isError = submitState === "error";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-modal-title"
      aria-describedby="email-modal-description"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal Card - Following ChatKit Card widget design */}
      <div
        className={`relative w-full max-w-md rounded-xl shadow-2xl transition-all duration-200 animate-in slide-in-from-bottom-4 ${
          theme === "dark"
            ? "bg-slate-800/95 border border-slate-700/50"
            : "bg-white/95 border border-slate-200/50"
        }`}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className={`absolute top-3 right-3 rounded-md p-1.5 transition-all ${
            theme === "dark"
              ? "hover:bg-slate-700 text-slate-400 hover:text-slate-200"
              : "hover:bg-slate-100 text-slate-500 hover:text-slate-700"
          } ${
            isSubmitting
              ? "opacity-30 cursor-not-allowed"
              : "hover:scale-110"
          }`}
          aria-label="关闭对话框"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Card Content */}
        <div className="p-6">
          {/* Header - Following ChatKit Title component style */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              {/* Icon */}
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                theme === "dark"
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-blue-50 text-blue-600"
              }`}>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>

              <h2
                id="email-modal-title"
                className={`text-lg font-semibold ${
                  theme === "dark" ? "text-slate-100" : "text-slate-900"
                }`}
              >
                联系客服
              </h2>
            </div>

            <p
              id="email-modal-description"
              className={`text-sm leading-relaxed ${
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              }`}
            >
              请留下您的邮箱地址，我们的客服团队会在 24 小时内与您取得联系。
            </p>
          </div>

          {/* Form - Following ChatKit Form widget pattern */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-5">
              <label
                htmlFor="email-input"
                className={`mb-2 block text-sm font-medium ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                邮箱地址 <span className="text-red-500" aria-label="必填">*</span>
              </label>

              <input
                ref={emailInputRef}
                type="email"
                id="email-input"
                name="email"
                value={email}
                onChange={handleEmailChange}
                disabled={isSubmitting || isSuccess}
                placeholder="your.email@example.com"
                required
                aria-required="true"
                aria-invalid={!!error}
                aria-describedby={error ? "email-error" : undefined}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
                  theme === "dark"
                    ? "bg-slate-900 border-slate-600 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                    : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                } ${
                  error || isError
                    ? theme === "dark"
                      ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                      : "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                    : ""
                } ${
                  isSuccess
                    ? theme === "dark"
                      ? "border-green-500/50"
                      : "border-green-400"
                    : ""
                } ${
                  isSubmitting || isSuccess
                    ? "opacity-60 cursor-not-allowed"
                    : ""
                }`}
              />

              {/* Error message with animation */}
              {error && (
                <div
                  id="email-error"
                  className="mt-2 flex items-start gap-1.5 text-sm text-red-500 animate-in slide-in-from-top-1 duration-200"
                  role="alert"
                >
                  <svg
                    className="w-4 h-4 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Success message */}
              {isSuccess && !error && (
                <div
                  className="mt-2 flex items-center gap-1.5 text-sm text-green-500 animate-in slide-in-from-top-1 duration-200"
                  role="status"
                >
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>提交成功！</span>
                </div>
              )}
            </div>

            {/* Action Buttons - Following ChatKit Button widget pattern */}
            <div className="flex gap-3">
              {/* Cancel Button - secondary style */}
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting || isSuccess}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                  theme === "dark"
                    ? "bg-slate-700 hover:bg-slate-600 text-slate-200 active:bg-slate-500"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 active:bg-slate-300"
                } ${
                  isSubmitting || isSuccess
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:shadow-sm"
                }`}
              >
                取消
              </button>

              {/* Submit Button - primary style */}
              <button
                type="submit"
                disabled={isSubmitting || isSuccess || !email.trim()}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-all ${
                  isSuccess
                    ? "bg-green-600"
                    : isSubmitting || !email.trim()
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 hover:shadow-md"
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>提交中...</span>
                  </span>
                ) : isSuccess ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>已提交</span>
                  </span>
                ) : (
                  "提交"
                )}
              </button>
            </div>
          </form>

          {/* Privacy note - Caption style */}
          <p className={`mt-4 text-xs text-center ${
            theme === "dark" ? "text-slate-500" : "text-slate-400"
          }`}>
            我们重视您的隐私，您的邮箱地址仅用于客服联系
          </p>
        </div>
      </div>
    </div>
  );
}
