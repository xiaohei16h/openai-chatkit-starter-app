"use client";

import { useState, useCallback } from "react";
import { useSettings, type ChatSettings } from "@/hooks/useSettings";

type SettingsPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { settings, updateSettings, resetSettings, exportSettings, importSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<"general" | "theme" | "features" | "import">("general");
  const [importText, setImportText] = useState("");
  const [showImportSuccess, setShowImportSuccess] = useState(false);

  const handleImport = useCallback(() => {
    const success = importSettings(importText);
    if (success) {
      setShowImportSuccess(true);
      setImportText("");
      setTimeout(() => setShowImportSuccess(false), 2000);
    }
  }, [importText, importSettings]);

  const handleExport = useCallback(() => {
    const settingsJson = exportSettings();
    const blob = new Blob([settingsJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chatkit-settings.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [exportSettings]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            ChatKit 设置
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Sidebar */}
          <div className="w-64 border-r border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
            <nav className="space-y-2">
              {[
                { id: "general", label: "常规设置", icon: "⚙️" },
                { id: "theme", label: "主题设置", icon: "🎨" },
                { id: "features", label: "功能设置", icon: "🔧" },
                { id: "import", label: "导入/导出", icon: "📁" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100"
                      : "text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "general" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">常规设置</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      欢迎消息
                    </label>
                    <input
                      type="text"
                      value={settings.greeting}
                      onChange={(e) => updateSettings({ greeting: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                      placeholder="输入欢迎消息..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      输入框占位符
                    </label>
                    <input
                      type="text"
                      value={settings.placeholder}
                      onChange={(e) => updateSettings({ placeholder: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                      placeholder="输入占位符文本..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      聊天区域高度
                    </label>
                    <div className="mt-1 flex items-center space-x-3">
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={settings.chatHeight}
                        onChange={(e) => updateSettings({ chatHeight: parseInt(e.target.value) })}
                        className="flex-1"
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {settings.chatHeight}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showWelcomeScreen"
                      checked={settings.showWelcomeScreen}
                      onChange={(e) => updateSettings({ showWelcomeScreen: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600"
                    />
                    <label htmlFor="showWelcomeScreen" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                      显示欢迎屏幕
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "theme" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">主题设置</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      主题模式
                    </label>
                    <select
                      value={settings.theme}
                      onChange={(e) => updateSettings({ theme: e.target.value as any })}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                    >
                      <option value="system">跟随系统</option>
                      <option value="light">浅色模式</option>
                      <option value="dark">深色模式</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      主色调
                    </label>
                    <div className="mt-1 flex items-center space-x-3">
                      <input
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => updateSettings({ primaryColor: e.target.value })}
                        className="h-10 w-16 rounded border border-slate-300 dark:border-slate-600"
                      />
                      <input
                        type="text"
                        value={settings.primaryColor}
                        onChange={(e) => updateSettings({ primaryColor: e.target.value })}
                        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      强调色
                    </label>
                    <div className="mt-1 flex items-center space-x-3">
                      <input
                        type="color"
                        value={settings.accentColor}
                        onChange={(e) => updateSettings({ accentColor: e.target.value })}
                        className="h-10 w-16 rounded border border-slate-300 dark:border-slate-600"
                      />
                      <input
                        type="text"
                        value={settings.accentColor}
                        onChange={(e) => updateSettings({ accentColor: e.target.value })}
                        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      圆角样式
                    </label>
                    <select
                      value={settings.borderRadius}
                      onChange={(e) => updateSettings({ borderRadius: e.target.value as any })}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                    >
                      <option value="none">无圆角</option>
                      <option value="small">小圆角</option>
                      <option value="medium">中等圆角</option>
                      <option value="large">大圆角</option>
                      <option value="round">圆形</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "features" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">功能设置</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableFileUpload"
                      checked={settings.enableFileUpload}
                      onChange={(e) => updateSettings({ enableFileUpload: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600"
                    />
                    <label htmlFor="enableFileUpload" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                      启用文件上传
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableFeedback"
                      checked={settings.enableFeedback}
                      onChange={(e) => updateSettings({ enableFeedback: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600"
                    />
                    <label htmlFor="enableFeedback" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                      启用反馈功能
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableThreadActions"
                      checked={settings.enableThreadActions}
                      onChange={(e) => updateSettings({ enableThreadActions: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600"
                    />
                    <label htmlFor="enableThreadActions" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                      启用线程操作
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "import" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">导入/导出设置</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      导出设置
                    </label>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      将当前设置导出为 JSON 文件
                    </p>
                    <button
                      onClick={handleExport}
                      className="mt-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      导出设置
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      导入设置
                    </label>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      从 JSON 文件导入设置
                    </p>
                    <textarea
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                      placeholder="粘贴设置 JSON 内容..."
                      className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                      rows={6}
                    />
                    <div className="mt-2 flex space-x-2">
                      <button
                        onClick={handleImport}
                        disabled={!importText.trim()}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-slate-400"
                      >
                        导入设置
                      </button>
                      <button
                        onClick={() => setImportText("")}
                        className="rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
                      >
                        清空
                      </button>
                    </div>
                    {showImportSuccess && (
                      <p className="mt-2 text-sm text-green-600">设置导入成功！</p>
                    )}
                  </div>

                  <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
                    <button
                      onClick={resetSettings}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      重置为默认设置
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
