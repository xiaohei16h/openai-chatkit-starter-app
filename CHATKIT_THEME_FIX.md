# ChatKit 主题配置修复

## 错误描述

遇到了 `InvalidFrameParamsError: Invalid frame params: ChatKit.create(): Invalid input` 错误，这是由于 ChatKit 主题配置格式不正确导致的。

## 错误原因

1. **重复配置冲突**
   - 在 ChatKitPanel 中重复定义了颜色配置
   - 与 `getThemeConfig` 函数返回的配置产生冲突
   - 导致 ChatKit 无法正确解析主题参数

2. **配置格式错误**
   - 添加了 ChatKit 不支持的配置项
   - 主题配置结构不正确
   - 缺少必要的配置验证

## 解决方案

### 1. 修复前的问题配置

```tsx
// ❌ 错误配置 - 重复定义颜色配置
theme: {
  colorScheme: currentTheme,
  ...getThemeConfig(currentTheme),
  color: {
    grayscale: {
      hue: 220,
      tint: 6,
      shade: currentTheme === "dark" ? -1 : -4,
    },
    accent: {
      primary: settings.primaryColor,
      level: 1,
    },
    background: { /* 不支持的配置 */ },
    text: { /* 不支持的配置 */ },
    border: { /* 不支持的配置 */ },
  },
  radius: settings.borderRadius,
}
```

### 2. 修复后的正确配置

```tsx
// ✅ 正确配置 - 使用现有配置并扩展
theme: {
  colorScheme: currentTheme,
  ...getThemeConfig(currentTheme),
  color: {
    ...getThemeConfig(currentTheme).color,
    accent: {
      primary: settings.primaryColor,
      level: 1,
    },
  },
  radius: settings.borderRadius,
}
```

### 3. 配置结构说明

**基础配置**：
- `colorScheme`: 主题模式（light/dark）
- `radius`: 圆角样式
- `color.grayscale`: 灰度配置
- `color.accent`: 强调色配置

**支持的配置项**：
```tsx
{
  colorScheme: "light" | "dark",
  color: {
    grayscale: {
      hue: number,
      tint: number,
      shade: number,
    },
    accent: {
      primary: string,
      level: number,
    },
  },
  radius: "none" | "small" | "medium" | "large" | "round",
}
```

## 修复步骤

### 1. 移除不支持的配置

**移除的配置项**：
- `background` 配置
- `text` 配置  
- `border` 配置

这些配置项不被 ChatKit 支持，会导致参数验证失败。

### 2. 使用现有配置结构

**利用 `getThemeConfig` 函数**：
```tsx
// 使用现有的主题配置
...getThemeConfig(currentTheme),

// 扩展颜色配置
color: {
  ...getThemeConfig(currentTheme).color,
  accent: {
    primary: settings.primaryColor,
    level: 1,
  },
}
```

### 3. 保持配置一致性

**配置优先级**：
1. 基础配置（`getThemeConfig`）
2. 用户自定义配置（`settings.primaryColor`）
3. 动态配置（`settings.borderRadius`）

## 技术实现

### 1. 配置合并策略

```tsx
const chatkit = useChatKit({
  api: { getClientSecret },
  theme: {
    // 1. 设置主题模式
    colorScheme: currentTheme,
    
    // 2. 应用基础主题配置
    ...getThemeConfig(currentTheme),
    
    // 3. 扩展颜色配置
    color: {
      ...getThemeConfig(currentTheme).color,
      accent: {
        primary: settings.primaryColor,
        level: 1,
      },
    },
    
    // 4. 应用用户设置
    radius: settings.borderRadius,
  },
  // 其他配置...
});
```

### 2. 主题变量处理

```tsx
const currentTheme = settings.theme === "system" ? theme : settings.theme;
```

- 统一主题变量，避免重复计算
- 确保主题判断的一致性
- 支持系统主题跟随

### 3. 配置验证

**支持的配置项**：
- ✅ `colorScheme`: 主题模式
- ✅ `color.grayscale`: 灰度配置
- ✅ `color.accent`: 强调色配置
- ✅ `radius`: 圆角样式

**不支持的配置项**：
- ❌ `background`: 背景色配置
- ❌ `text`: 文字色配置
- ❌ `border`: 边框色配置

## 测试验证

### 1. 功能测试

1. **主题切换**：
   - 浅色模式正常工作
   - 深色模式正常工作
   - 系统模式正常工作

2. **配置应用**：
   - 自定义颜色正确应用
   - 圆角样式正确应用
   - 主题配置正确生效

3. **错误处理**：
   - 无控制台错误
   - 无参数验证错误
   - 配置正确传递

### 2. 兼容性测试

1. **ChatKit 版本**：
   - 确保与当前 ChatKit 版本兼容
   - 验证配置项支持情况
   - 测试主题切换功能

2. **浏览器兼容性**：
   - 在不同浏览器中测试
   - 确保主题配置正确应用
   - 验证无 JavaScript 错误

## 最佳实践

### 1. 配置管理

- **使用现有配置**：利用 `getThemeConfig` 函数
- **扩展而非替换**：在现有配置基础上扩展
- **验证配置项**：确保配置项被 ChatKit 支持

### 2. 主题设计

- **保持一致性**：与 ChatKit 默认主题保持一致
- **渐进增强**：在基础配置上添加自定义配置
- **向后兼容**：确保配置变更不影响现有功能

### 3. 错误处理

- **配置验证**：在应用配置前验证参数
- **错误捕获**：捕获并处理配置错误
- **降级处理**：在配置失败时使用默认配置

## 常见问题

### 1. 主题不生效

**原因**：
- 配置格式不正确
- 配置项不被支持
- 主题变量错误

**解决**：
- 检查配置格式
- 验证配置项支持
- 确认主题变量

### 2. 控制台错误

**原因**：
- 参数验证失败
- 配置冲突
- 类型错误

**解决**：
- 修复配置格式
- 移除冲突配置
- 检查类型定义

### 3. 样式不一致

**原因**：
- 主题配置不完整
- 样式覆盖问题
- 配置优先级错误

**解决**：
- 完善主题配置
- 检查样式优先级
- 调整配置顺序

## 总结

通过修复 ChatKit 主题配置，解决了参数验证错误，确保主题功能正常工作。

关键修复点：
1. **移除不支持的配置**：删除 ChatKit 不支持的配置项
2. **使用现有配置结构**：利用 `getThemeConfig` 函数
3. **正确扩展配置**：在现有配置基础上添加自定义配置
4. **验证配置正确性**：确保所有配置项被支持

现在 ChatKit 主题配置应该正常工作，不再出现参数验证错误！🎉
