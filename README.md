<div align="center">

# 🛡️ LLM localStorage 管理器

**自动管理 LLM 网站的 localStorage，防止存储配额超限**

简体中文 | [English](README_EN.md)

[![GitHub stars](https://img.shields.io/github/stars/lueyoung/llm-localstorage-manager?style=social)](https://github.com/lueyoung/llm-localstorage-manager)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tampermonkey](https://img.shields.io/badge/Tampermonkey-Compatible-brightgreen.svg)](https://www.tampermonkey.net/)

</div>

---

## 🤔 为什么需要这个工具？

在使用 ChatGPT、Claude、Gemini 等 LLM 网站时，经常会遇到令人头疼的 **"localStorage quota exceeded"** 错误，导致：
- ❌ 对话无法保存
- ❌ 页面功能异常
- ❌ 需要手动清理缓存

这两个脚本可以**自动监控和清理** localStorage，让你专注于对话本身！

---

## ✨ 功能特性

### 🔄 自动清理器
- ✅ 每分钟自动检查存储使用情况
- ✅ 超过阈值时自动清理旧数据
- ✅ 拦截 QuotaExceededError 异常
- ✅ 三种清理模式：智能清理、指定键清理、全部清理

### 📊 实时监控面板
- ✅ 实时显示存储使用量和占用率
- ✅ 颜色预警：绿色/黄色/红色
- ✅ 每 3 秒自动更新
- ✅ 点击手动刷新数据

---

## 🚀 快速安装

### 第一步：安装 Tampermonkey

根据你的浏览器选择：

- **Chrome/Edge**：[Chrome 网上应用店](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- **Firefox**：[Firefox 附加组件](https://addons.mozilla.org/firefox/addon/tampermonkey/)
- **Safari**：在 App Store 搜索 "Tampermonkey"

### 第二步：安装脚本

**方法 1：直接安装（推荐）**

点击下面的链接，Tampermonkey 会自动提示安装：

1. [安装自动清理器](https://github.com/lueyoung/llm-localstorage-manager/raw/main/auto-cleaner.user.js)
2. [安装监控面板](https://github.com/lueyoung/llm-localstorage-manager/raw/main/monitor-panel.user.js)

**方法 2：手动安装**

1. 点击 Tampermonkey 图标 → 管理面板
2. 点击「新建脚本」
3. 复制粘贴脚本内容
4. 保存（Ctrl/Cmd + S）

### 第三步：验证安装

访问 [ChatGPT](https://chatgpt.com) 或 [Claude](https://claude.ai)，你应该看到：
- ✅ 页面右下角出现监控面板
- ✅ 控制台显示启动信息

---

## 🎯 支持的网站

- ✅ ChatGPT (chatgpt.com)
- ✅ Claude (claude.ai)
- ✅ Gemini (gemini.google.com)
- ✅ 通义千问 (qianwen.aliyun.com)
- ✅ ChatGLM (chatglm.cn)
- ✅ 文心一言 (yiyan.baidu.com)

想添加其他网站？只需编辑脚本中的 `@match` 部分即可。

---

## ⚙️ 配置说明

### 自动清理器配置

编辑 `auto-cleaner.user.js` 中的 `CONFIG` 对象：

**检查间隔**：多久检查一次存储情况（默认：1 分钟）

**最大存储大小**：触发清理的阈值（默认：4MB）

**显示通知**：清理时是否显示通知（默认：true）

**清理模式**：从三种模式中选择（默认：smart）

### 三种清理模式

| 模式 | 说明 | 适用场景 |
|------|------|----------|
| `smart` | 智能清理最旧的 30% 数据 | ⭐ 推荐 - 平衡性能和数据保留 |
| `specific` | 仅清理指定的键 | 明确知道要删除哪些数据 |
| `all` | 清空全部 localStorage | 遇到严重问题时的终极方案 |

---

## 🔧 常见问题

<details>
<summary><b>脚本没有运行？</b></summary>

- 检查 Tampermonkey 图标是否显示数字
- 确认脚本状态为绿色（已启用）
- 尝试刷新页面
- 打开控制台（F12）查看错误信息
</details>

<details>
<summary><b>监控面板没有显示？</b></summary>

- 确保第二个脚本已安装并启用
- 清除浏览器缓存后刷新
- 检查控制台是否有错误信息
</details>

<details>
<summary><b>仍然出现 QuotaExceededError？</b></summary>

尝试以下解决方案：

**降低阈值**：将 maxStorageSize 改为 2MB 而不是 4MB

**使用激进清理**：将 cleanMode 切换为 'all'

**更频繁检查**：将 checkInterval 减少到 30000（30 秒）
</details>

<details>
<summary><b>如何自定义要保留的键？</b></summary>

使用 `specific` 模式时，编辑 `specificKeys` 数组，列出你想要删除的键。所有其他键都会被保留。
</details>

<details>
<summary><b>可以隐藏监控面板吗？</b></summary>

可以！只需在 Tampermonkey 中禁用「监控面板」脚本。自动清理器仍会在后台工作。
</details>

---

## 📊 数据统计

- 🎯 支持 **6+** 个主流 LLM 平台
- 📦 总代码量约 **300** 行
- ⚡ 零性能影响
- 🔒 完全本地运行，无隐私风险

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

欢迎你：
- 🐛 报告 Bug
- 💡 提出新功能建议
- 🌍 添加翻译
- 📝 改进文档

---

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE) 开源。

---

## 💖 支持项目

如果这个项目帮到了你，请给个 ⭐️ Star！

也欢迎分享给更多需要的人 😊

---

<div align="center">

**用 ❤️ 为全球 LLM 用户打造**

[报告问题](https://github.com/lueyoung/llm-localstorage-manager/issues) · [功能建议](https://github.com/lueyoung/llm-localstorage-manager/issues)

</div>
