<div align="center">

# 🛡️ LLM localStorage Manager

**Automatically manage localStorage for LLM websites to prevent quota exceeded errors**

[简体中文](README.md) | English

[![GitHub stars](https://img.shields.io/github/stars/lueyoung/llm-localstorage-manager?style=social)](https://github.com/lueyoung/llm-localstorage-manager)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tampermonkey](https://img.shields.io/badge/Tampermonkey-Compatible-brightgreen.svg)](https://www.tampermonkey.net/)

</div>

---

## 🤔 Why Do You Need This?

When using LLM websites like ChatGPT, Claude, or Gemini, you may encounter the frustrating **"localStorage quota exceeded"** error, causing:
- ❌ Conversations fail to save
- ❌ Page features break down
- ❌ Manual cache clearing required

These two scripts **automatically monitor and clean** localStorage, letting you focus on your conversations!

---

## ✨ Features

### 🔄 Auto Cleaner
- ✅ Checks storage usage every minute
- ✅ Automatically cleans old data when threshold exceeded
- ✅ Intercepts QuotaExceededError exceptions
- ✅ Three cleaning modes: Smart, Specific Keys, or Clean All

### 📊 Real-time Monitor Panel
- ✅ Live display of storage usage and percentage
- ✅ Color-coded warnings: Green/Yellow/Red
- ✅ Auto-refresh every 3 seconds
- ✅ Click to manually refresh

---

## 🚀 Quick Installation

### Step 1: Install Tampermonkey

Choose based on your browser:

- **Chrome/Edge**: [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- **Firefox**: [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/tampermonkey/)
- **Safari**: Search "Tampermonkey" in App Store

### Step 2: Install Scripts

**Method 1: Direct Install (Recommended)**

Click the links below, and Tampermonkey will prompt for installation:

1. [Install Auto Cleaner](https://github.com/lueyoung/llm-localstorage-manager/raw/main/auto-cleaner.user.js)
2. [Install Monitor Panel](https://github.com/lueyoung/llm-localstorage-manager/raw/main/monitor-panel.user.js)

**Method 2: Manual Install**

1. Click Tampermonkey icon → Dashboard
2. Click "Create a new script"
3. Copy and paste the script content
4. Save (Ctrl/Cmd + S)

### Step 3: Verify Installation

Visit [ChatGPT](https://chatgpt.com) or [Claude](https://claude.ai), you should see:
- ✅ Monitor panel appears in the bottom-right corner
- ✅ Console shows startup messages

---

## 🎯 Supported Websites

- ✅ ChatGPT (chatgpt.com)
- ✅ Claude (claude.ai)
- ✅ Gemini (gemini.google.com)
- ✅ Tongyi Qianwen (qianwen.aliyun.com)
- ✅ ChatGLM (chatglm.cn)
- ✅ ERNIE Bot (yiyan.baidu.com)

Want to add more sites? Just edit the `@match` section in the script.

---

## ⚙️ Configuration

### Auto Cleaner Settings

Edit the `CONFIG` object in `auto-cleaner.user.js`:

**Check Interval**: How often to check storage (default: 1 minute)

**Max Storage Size**: Threshold for triggering cleanup (default: 4MB)

**Show Notification**: Display notifications when cleaning (default: true)

**Clean Mode**: Choose from three modes (default: smart)

### Three Cleaning Modes

| Mode | Description | Best For |
|------|-------------|----------|
| `smart` | Intelligently removes oldest 30% of data | ⭐ Recommended - balances performance and data retention |
| `specific` | Only removes specified keys | When you know exactly what to delete |
| `all` | Clears entire localStorage | Nuclear option for serious issues |

---

## 🔧 Troubleshooting

<details>
<summary><b>Scripts not running?</b></summary>

- Check if Tampermonkey icon shows a number
- Ensure script status is green (enabled)
- Try refreshing the page
- Open console (F12) to check for errors
</details>

<details>
<summary><b>Monitor panel not showing?</b></summary>

- Make sure the second script is installed and enabled
- Clear browser cache and refresh
- Check console for error messages
</details>

<details>
<summary><b>Still getting QuotaExceededError?</b></summary>

Try these solutions:

**Lower the threshold**: Change maxStorageSize to 2MB instead of 4MB

**Use aggressive cleaning**: Switch cleanMode to 'all'

**Check more frequently**: Reduce checkInterval to 30000 (30 seconds)
</details>

<details>
<summary><b>How to customize which keys to keep?</b></summary>

When using `specific` mode, edit the `specificKeys` array to list the keys you want to remove. All other keys will be preserved.
</details>

<details>
<summary><b>Can I hide the monitor panel?</b></summary>

Yes! Simply disable the "Monitor Panel" script in Tampermonkey. The auto cleaner will still work in the background.
</details>

---

## 📊 Statistics

- 🎯 Supports **6+** major LLM platforms
- 📦 Total code: ~**300** lines
- ⚡ Zero performance impact
- 🔒 Runs completely locally - no privacy concerns

---

## 🤝 Contributing

Issues and Pull Requests are welcome!

Feel free to:
- 🐛 Report bugs
- 💡 Suggest new features
- 🌍 Add translations
- 📝 Improve documentation

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 💖 Support This Project

If this project helped you, please give it a ⭐️ Star!

Feel free to share it with others who might need it 😊

---

<div align="center">

**Made with ❤️ for LLM users worldwide**

[Report Issues](https://github.com/lueyoung/llm-localstorage-manager/issues) · [Request Features](https://github.com/lueyoung/llm-localstorage-manager/issues)

</div>
