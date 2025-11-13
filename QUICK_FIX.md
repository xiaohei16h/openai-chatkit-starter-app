# 快速修复：邮箱收集功能未触发

## 问题

AI 回复了"找不到相关信息，请联系客服。"但邮箱组件未触发。

## 根本原因

✅ **前端代码已完整** - 所有必要的组件和 API 都已实现
❌ **OpenAI Workflow 未配置** - 缺少 `collect_email` 工具定义

## 立即修复（3 步）

### 第 1 步：访问 Agent Builder

1. 打开 [OpenAI Agent Builder](https://platform.openai.com/agent-builder)
2. 找到你的 Workflow ID: `wf_68ef459933588190bb8f1aabed83a15d0f7b006f220a64a2`
3. 点击编辑 Workflow

### 第 2 步：添加客户端工具

在 Workflow 的**工具配置**（Tools）区域，添加以下客户端工具：

```json
{
  "name": "collect_email",
  "type": "client_tool",
  "description": "当用户需要客服协助时收集邮箱地址",
  "parameters": {
    "type": "object",
    "properties": {
      "reason": {
        "type": "string",
        "description": "收集邮箱的原因"
      }
    },
    "required": ["reason"]
  }
}
```

### 第 3 步：配置触发逻辑

在 Workflow 的**系统指令**（Instructions/System Prompt）中添加：

```
重要：当你的回复中包含以下任一关键词时，必须调用 collect_email 工具：
- "请联系客服"
- "联系客服"
- "找不到相关信息"

调用方式：
collect_email(reason="用户需要客服协助")

这是一个客户端工具，它会触发前端显示邮箱收集表单。
你必须在每次回复包含上述关键词时调用此工具。
```

**或者**，如果你的 Workflow 支持更高级的配置，可以使用条件触发器：

```yaml
# 伪代码示例 - 具体语法取决于你的 Workflow 编辑器
on_response:
  if: contains(response.text, ["请联系客服", "联系客服", "找不到相关信息"])
  then:
    call_tool:
      name: collect_email
      parameters:
        reason: "用户需要客服协助"
```

### 第 4 步：保存并测试

1. **保存** Workflow 配置
2. **发布/部署** Workflow（如果需要）
3. **刷新**你的应用页面
4. **测试**：发送一条会导致 AI 回复"请联系客服"的消息

## 验证是否成功

打开浏览器开发者工具（按 F12），在 Console 中应该看到：

```
[ChatKitPanel] collect_email triggered { reason: "用户需要客服协助" }
[ChatKitPanel] widget action { type: "collect_email", ... }
Email collected: xxx@example.com
Email submitted successfully: { success: true, ... }
```

## 如果还是不工作

### 调试检查清单

1. **Workflow 已保存并发布？**
   - 确保你点击了保存/发布按钮
   - 可能需要等待几秒钟让配置生效

2. **API Key 正确？**
   - 检查 `.env.local` 中的 `OPENAI_API_KEY`
   - 确保它属于与 Workflow 相同的组织和项目

3. **Workflow ID 正确？**
   - 检查 `.env.local` 中的 `NEXT_PUBLIC_CHATKIT_WORKFLOW_ID`
   - 应该是 `wf_68ef459933588190bb8f1aabed83a15d0f7b006f220a64a2`

4. **浏览器控制台有错误？**
   - 检查是否有 JavaScript 错误
   - 检查是否有网络请求失败

5. **测试简化版本**

   临时修改系统指令，让 AI **总是**调用工具：

   ```
   在你的第一个回复中，立即调用 collect_email 工具进行测试。
   ```

   如果这样工作，说明工具配置正确，问题在于触发条件。

## 备用方案：前端检测（不推荐）

如果 Workflow 配置困难，可以修改前端代码直接检测回复内容。但这**不是最佳实践**。

编辑 `components/ChatKitPanel.tsx`，在 `onResponseEnd` 中添加：

```typescript
onResponseEnd: (response) => {
  onResponseEnd();

  // 检测回复内容
  const text = response?.text || '';
  if (text.includes('请联系客服') || text.includes('联系客服')) {
    void onWidgetAction({
      type: "collect_email",
      reason: "检测到客服关键词",
    });
  }
},
```

**注意**：这需要访问 response 对象，具体实现取决于 ChatKit 的 API。

## 更多帮助

- 详细故障排除：查看 `TROUBLESHOOTING_EMAIL_COLLECTION.md`
- 完整配置指南：查看 `EMAIL_COLLECTION_SETUP.md`
- OpenAI Agent Builder 文档：https://platform.openai.com/docs/agent-builder

## 配置示例截图位置

如果你不确定在哪里添加工具定义，通常在 Agent Builder 中：

1. 选择你的 Workflow
2. 找到 "Tools" 或"工具"选项卡
3. 点击"Add Tool"或"添加工具"
4. 选择 "Client Tool" 类型
5. 粘贴上面的 JSON 配置
6. 在 "Instructions" 或"指令"中添加触发逻辑

---

**关键点**：这个问题 99% 是因为 OpenAI Workflow 没有配置 `collect_email` 工具。前端代码已经完全准备好了！
