"use client";

import { useState, useEffect } from "react";
import type { ColorScheme } from "@/hooks/useColorScheme";

type EmailCollectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
  theme: ColorScheme;
};

export function EmailCollectionModal({
  isOpen,
  onClose,
  onSubmit,
  theme,
}: EmailCollectionModalProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setError("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("请输入邮箱地址");
      return;
    }

    if (!validateEmail(email)) {
      setError("请输入有效的邮箱地址");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await onSubmit(email);
      onClose();
    } catch (err) {
      setError("提交失败，请重试");
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-md rounded-2xl p-6 shadow-xl ${
          theme === "dark"
            ? "bg-slate-800 border border-slate-700"
            : "bg-white border border-slate-200"
        }`}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className={`absolute top-4 right-4 rounded-lg p-1 transition-colors ${
            theme === "dark"
              ? "hover:bg-slate-700 text-slate-400 hover:text-slate-200"
              : "hover:bg-slate-100 text-slate-500 hover:text-slate-700"
          } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
          aria-label="关闭"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Content */}
        <div className="mb-6">
          <h2
            className={`mb-2 text-xl font-semibold ${
              theme === "dark" ? "text-slate-100" : "text-slate-900"
            }`}
          >
            联系客服
          </h2>
          <p
            className={`text-sm ${
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            }`}
          >
            请留下您的邮箱地址，我们的客服团队会尽快与您联系。
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className={`mb-2 block text-sm font-medium ${
                theme === "dark" ? "text-slate-300" : "text-slate-700"
              }`}
            >
              邮箱地址
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              disabled={isSubmitting}
              placeholder="example@email.com"
              className={`w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                theme === "dark"
                  ? "bg-slate-900 border-slate-600 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                  : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
              } ${
                error
                  ? theme === "dark"
                    ? "border-red-500"
                    : "border-red-400"
                  : ""
              } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-500">{error}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                theme === "dark"
                  ? "bg-slate-700 hover:bg-slate-600 text-slate-200"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors ${
                isSubmitting
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
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
                  提交中...
                </span>
              ) : (
                "提交"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
