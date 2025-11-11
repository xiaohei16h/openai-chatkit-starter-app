# 邮箱收集功能设置指南

本文档说明如何在 OpenAI ChatKit 工作流中配置邮箱收集功能，以便在回复中包含"请联系客服"时自动收集用户邮箱。

## 功能概述

当 AI 的回复中包含"请联系客服"时，系统会自动弹出一个邮箱收集模态框，引导用户留下联系方式。

## 实现组件

### 1. 前端组件

- **EmailCollectionModal.tsx**: 邮箱收集模态框组件
- **ChatKitPanel.tsx**: 添加了 `collect_email` 客户端工具处理器
- **App.tsx**: 集成了邮箱收集模态框和处理逻辑

### 2. 工作流配置

需要在 OpenAI 工作流中添加以下配置：

#### 工具定义

在工作流的工具配置中添加 `collect_email` 客户端工具：

```json
{
  "name": "collect_email",
  "type": "client_tool",
  "description": "收集用户邮箱地址以便客服联系",
  "parameters": {
    "type": "object",
    "properties": {
      "reason": {
        "type": "string",
        "description": "收集邮箱的原因，例如'需要客服协助'"
      }
    }
  }
}
```

#### 工作流逻辑示例

在工作流中添加检测逻辑，当回复包含"请联系客服"时调用 `collect_email` 工具：

```python
# 伪代码示例
def handle_response(response_text):
    if "请联系客服" in response_text:
        # 调用客户端工具收集邮箱
        invoke_client_tool(
            tool_name="collect_email",
            parameters={
                "reason": "用户需要客服协助"
            }
        )
    return response_text
```

或者在 Workflow 配置中使用条件判断：

```yaml
steps:
  - id: check_customer_service
    type: condition
    condition: "contains(response, '请联系客服')"
    if_true:
      - type: client_tool_call
        tool: collect_email
        parameters:
          reason: "需要客服协助"
```

## 使用方法

### 1. 基本使用

当 AI 回复包含"请联系客服"时，系统会自动：

1. 调用 `collect_email` 客户端工具
2. 前端显示邮箱收集模态框
3. 用户输入邮箱并提交
4. 邮箱信息被保存（当前保存到 localStorage）

### 2. 数据存储

目前邮箱数据保存在浏览器的 localStorage 中，键名为 `collected_emails`。

如需保存到后端，可以修改 `App.tsx` 中的 `handleEmailSubmit` 函数：

```typescript
const handleEmailSubmit = useCallback(async (email: string) => {
  try {
    // 发送到后端 API
    const response = await fetch('/api/collect-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        timestamp: new Date().toISOString(),
        sessionId: 'your-session-id', // 可以从 ChatKit 获取
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to submit email');
    }

    console.log('Email submitted successfully');
  } catch (error) {
    console.error('Failed to submit email:', error);
    throw error;
  }
}, []);
```

### 3. 创建后端 API 端点

创建 `/app/api/collect-email/route.ts` 文件：

```typescript
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, timestamp, sessionId } = body;

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // 保存到数据库
    // await saveEmailToDatabase({ email, timestamp, sessionId });

    // 或者发送通知邮件
    // await sendNotificationEmail(email);

    console.log('Email collected:', { email, timestamp, sessionId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to collect email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## 自定义选项

### 1. 修改触发关键词

如果想使用其他关键词触发邮箱收集，需要在工作流中修改检测条件：

```python
# 支持多个关键词
keywords = ["请联系客服", "联系客服", "人工客服", "转人工"]
if any(keyword in response_text for keyword in keywords):
    invoke_client_tool("collect_email", {"reason": "用户请求客服协助"})
```

### 2. 自定义模态框样式

修改 `EmailCollectionModal.tsx` 中的样式类名即可自定义外观。

### 3. 添加更多字段

如需收集更多信息（如姓名、电话等），可以扩展 `EmailCollectionModal` 组件和相应的类型定义。

## 测试

### 1. 测试邮箱收集流程

在聊天中输入会导致 AI 回复"请联系客服"的问题，然后：

1. 验证模态框是否弹出
2. 测试邮箱格式验证
3. 提交邮箱并检查数据是否正确保存

### 2. 查看收集的邮箱

在浏览器控制台中运行：

```javascript
JSON.parse(localStorage.getItem('collected_emails') || '[]')
```

## 注意事项

1. **隐私合规**: 确保符合 GDPR、CCPA 等隐私法规要求
2. **数据安全**: 建议将邮箱数据加密存储
3. **用户同意**: 考虑添加隐私政策和用户同意选项
4. **重复收集**: 可以添加逻辑避免重复收集同一用户的邮箱
5. **错误处理**: 确保网络错误时有适当的重试机制

## 故障排除

### 模态框没有弹出

1. 检查浏览器控制台是否有错误
2. 验证工作流是否正确调用了 `collect_email` 工具
3. 检查 `onWidgetAction` 回调是否正确执行

### 邮箱提交失败

1. 检查网络请求是否成功
2. 验证后端 API 端点是否正确配置
3. 查看控制台错误信息

### 数据没有保存

1. 检查 localStorage 是否可用
2. 验证 `handleEmailSubmit` 函数是否被调用
3. 检查浏览器是否阻止了 localStorage 访问

## 扩展功能建议

1. **自动回复**: 提交邮箱后自动发送确认消息
2. **表单验证**: 添加更严格的邮箱验证规则
3. **多语言支持**: 根据用户语言显示不同的提示文本
4. **分析统计**: 收集邮箱收集的统计数据
5. **CRM 集成**: 直接将收集的邮箱同步到 CRM 系统
