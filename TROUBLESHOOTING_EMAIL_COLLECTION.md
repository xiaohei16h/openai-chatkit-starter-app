# 邮箱收集功能故障排除指南

## 问题描述

当 AI 回复"找不到相关信息，请联系客服。"时，邮箱收集模态框没有弹出。

## 问题根源

邮箱收集功能依赖于 OpenAI Workflow 调用 `collect_email` 客户端工具。如果模态框没有弹出，**最可能的原因是 OpenAI Agent Builder 中的 Workflow 没有正确配置这个工具**。

## 诊断步骤

### 1. 检查浏览器控制台

打开浏览器开发者工具（F12），在 Console 标签中查看：

```javascript
// 应该看到类似这样的日志：
[ChatKitPanel] collect_email triggered { reason: "需要客服协助" }
[ChatKitPanel] widget action { type: "collect_email", reason: "需要客服协助" }
```

**如果看不到这些日志**，说明 OpenAI Workflow 没有调用 `collect_email` 工具。

### 2. 验证前端代码（已配置✅）

前端代码已经正确配置：
- ✅ `ChatKitPanel.tsx:332` - 检测 `collect_email` 工具调用
- ✅ `App.tsx:26` - 处理 `collect_email` 动作并打开模态框
- ✅ `EmailCollectionModal.tsx` - 邮箱收集组件已实现

### 3. 关键：配置 OpenAI Workflow ⚠️

这是**最关键**的一步。你需要在 OpenAI Agent Builder 中配置 Workflow。

## 解决方案：配置 OpenAI Workflow

### 方法 1：使用客户端工具（推荐）

在 OpenAI Agent Builder 中，为你的 Workflow 添加以下配置：

#### 步骤 1: 定义 `collect_email` 客户端工具

在 Agent Builder 的工具配置中添加：

```json
{
  "name": "collect_email",
  "type": "client_tool",
  "description": "当用户需要客服协助时收集用户邮箱地址",
  "parameters": {
    "type": "object",
    "properties": {
      "reason": {
        "type": "string",
        "description": "收集邮箱的原因，例如'需要客服协助'、'找不到相关信息'"
      }
    },
    "required": ["reason"]
  }
}
```

#### 步骤 2: 配置触发逻辑

在 Workflow 的响应逻辑中添加条件判断：

**选项 A - 使用指令（Instructions）**

在 Agent 的系统指令中添加：

```
当你的回复中包含"请联系客服"、"联系客服"、"找不到相关信息"等关键词时，
必须调用 collect_email 工具来收集用户的邮箱地址。

调用示例：
collect_email(reason="用户需要客服协助")
```

**选项 B - 使用 Function Calling**

确保 Workflow 配置了 function calling，让 AI 能够自动调用工具：

```json
{
  "tools": [
    {
      "name": "collect_email",
      "type": "client_tool",
      ...
    }
  ],
  "tool_choice": "auto"
}
```

### 方法 2：手动在回复中触发（备用方案）

如果客户端工具配置有困难，可以修改前端代码来检测回复内容：

1. 在 `ChatKitPanel.tsx` 中添加响应监听器（在 `onResponseEnd` 或相关事件中）
2. 检测回复文本是否包含"请联系客服"
3. 如果包含，手动触发 `onWidgetAction`

但这种方法**不推荐**，因为：
- 需要额外的客户端逻辑
- 可能导致误触发
- 不符合 OpenAI Workflow 的最佳实践

## 验证配置

配置完成后，测试流程：

1. 在聊天中输入会触发"请联系客服"回复的问题
2. 检查浏览器控制台，确认看到：
   ```
   [ChatKitPanel] collect_email triggered
   ```
3. 验证邮箱收集模态框是否弹出
4. 测试提交邮箱功能

## 常见问题

### Q: 我看到了工具调用日志，但模态框还是没弹出

**A:** 检查以下内容：

1. 浏览器控制台是否有 JavaScript 错误
2. `isEmailModalOpen` 状态是否正确更新
3. 模态框的 z-index 是否被其他元素覆盖

### Q: 在哪里配置 OpenAI Workflow？

**A:**

1. 访问 [OpenAI Agent Builder](https://platform.openai.com/agent-builder)
2. 选择你的 Workflow（ID: `wf_68ef459933588190bb8f1aabed83a15d0f7b006f220a64a2`）
3. 在工具配置区域添加 `collect_email` 客户端工具
4. 在指令或配置中添加触发逻辑
5. 保存并重新发布 Workflow

### Q: 如何查看 Workflow 是否正确调用了工具？

**A:**

在 OpenAI Agent Builder 的测试界面或者日志中，你应该能看到工具调用记录：

```
Tool Call: collect_email
Parameters: { "reason": "用户需要客服协助" }
```

### Q: 可以修改触发关键词吗？

**A:** 可以！修改 Workflow 的指令，支持更多关键词：

```
当你的回复中包含以下任一关键词时，调用 collect_email 工具：
- "请联系客服"
- "联系客服"
- "人工客服"
- "转人工"
- "找不到相关信息"
```

## 后续步骤

配置完成后，建议：

1. ✅ 测试多个触发场景
2. ✅ 验证邮箱数据是否正确保存到后端（`/api/collect-email`）
3. ✅ 检查后端 API 是否正常工作
4. ✅ 添加错误处理和重试机制
5. ✅ 考虑添加用户同意和隐私政策

## 相关文件

- `EMAIL_COLLECTION_SETUP.md` - 完整的功能设置指南
- `components/EmailCollectionModal.tsx` - 邮箱收集组件
- `components/ChatKitPanel.tsx` - 工具调用处理
- `app/App.tsx` - 模态框集成
- `app/api/collect-email/route.ts` - 后端 API（需创建）

## 需要帮助？

如果配置后仍然无法工作，请检查：

1. OpenAI API Key 是否有效且属于正确的组织
2. Workflow ID 是否正确
3. Workflow 是否已发布最新版本
4. 域名是否在 OpenAI 的域名白名单中

---

**重要提醒**：此功能的关键在于 **OpenAI Workflow 的配置**，而不是前端代码。前端代码已经准备就绪，只等待 Workflow 发送 `collect_email` 工具调用信号。
