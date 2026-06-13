# ⚡ Port Manager

[![Visual Studio Marketplace](https://img.shields.io/visual-studio-marketplace/v/port-manager-saiki.port-manager?style=flat-square&label=VS%20Code%20Marketplace)](https://marketplace.visualstudio.com/items?itemName=port-manager-saiki.port-manager)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/port-manager-saiki.port-manager?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=port-manager-saiki.port-manager)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

---

## ⭐ Smash that Star button — let's make some noise!

> This little extension runs on coffee, late nights, and **GitHub stars**. ☕
> Every star you give makes a stuck port magically free itself somewhere in the world. 🌍✨
> So go ahead — **[hit that ⭐ here](https://github.com/saisai-web/port-manager)** and help us hit the front page!

**🤝 Pull Requests are super welcome!**
Found a bug? Got a wild idea? [Open a PR](https://github.com/saisai-web/port-manager/pulls) — we don't bite. (The ports might, but we promise *we* don't.) 🔌

**👋 Let's connect & grow together!**
Always looking for new friends — I follow back! [Follow me on GitHub](https://github.com/saisai-web), drop a hello, and let's vibe. Mutual follows = mutual good vibes. 🚀

---

**View listening ports, check availability, and kill processes — all inside VS Code.**

No more switching to a terminal to find out what's hogging port 3000. Port Manager gives you a dedicated sidebar panel and quick commands to manage your local ports without leaving your editor.
<img width="851" height="776" alt="スクリーンショット 2026-02-21 11 28 19" src="https://github.com/user-attachments/assets/8cc76ccd-96a3-4cb0-a727-0a54fa258896" />


## Features

### 🔌 Sidebar Panel

A dedicated panel in the Activity Bar showing all listening ports in real time.

- **Search** — Filter by port number or process name instantly
- **Sort** — Click column headers to sort by port, process, PID, or state
- **Kill** — One-click kill with confirmation dialog
- **Bulk Kill** — Select multiple ports and kill them all at once
- **Range Scan** — Check how many ports are free in a given range

### ⌨️ Command Palette

Three commands accessible via `Ctrl+Shift+P` / `Cmd+Shift+P`:

| Command | Description |
|---------|-------------|
| **Port Manager: Show Listening Ports** | Quick Pick list → select a port to kill |
| **Port Manager: Check Port Availability** | Enter a port number → see if it's free or occupied |
| **Port Manager: Kill Port** | Enter port number(s) → kill immediately (comma-separated for bulk) |

### 🎨 Theme Support

Automatically adapts to your VS Code theme — dark, light, or high contrast.

## Supported Platforms

| Platform | Port Detection | Process Kill |
|----------|---------------|-------------|
| **macOS** | `lsof` | `kill -9` |
| **Linux** | `lsof` / `ss` | `kill -9` |
| **Windows** | `netstat` + `tasklist` | `taskkill /F` |

## Usage Tips

- **Can't kill a port?** On macOS/Linux, some system ports require `sudo`. On Windows, run VS Code as Administrator.
- **Port still showing after kill?** Hit the ↻ Refresh button — the OS may take a moment to release the port.
- **Use Range Scan** to quickly find an available port for your dev server.

## Requirements

- VS Code 1.80.0 or later
- No additional dependencies

## Release Notes

### 1.0.0

- Initial release
- Sidebar webview panel with search, sort, and kill
- Command palette integration (show / check / kill)
- Cross-platform support (macOS, Windows, Linux)
- Bulk kill support
- Range scan

## Development

### Project Structure

```
src/
├── extension.js       # Entry point
├── constants.js       # Constants
├── portService.js     # Port detection & management
├── commands.js        # VS Code commands
├── webviewProvider.js # Webview handler
└── webview/
    ├── index.js       # HTML generator
    ├── styles.js      # CSS
    └── script.js      # Client-side JS
```

### Publishing to VS Code Marketplace

#### 1. Prerequisites

```bash
npm install -g @vscode/vsce
```

#### 2. Create a Publisher (First time only)

1. Go to [Visual Studio Marketplace Publisher Management](https://marketplace.visualstudio.com/manage/publishers/)
2. Sign in with your Microsoft account
3. Click "Create publisher"
4. Enter Publisher ID and Display Name

#### 3. Create a Personal Access Token (PAT)

1. Go to [Azure DevOps](https://dev.azure.com/)
2. Click on your profile icon (top right) → "Personal access tokens"
3. Click "New Token"
4. Configure:
   - **Name**: Any name (e.g., "vsce-publish")
   - **Organization**: Select "All accessible organizations"
   - **Scopes**: Click "Custom defined" → Check "Marketplace" → "Manage"
5. Click "Create" and copy the token (save it securely)

#### 4. Login and Publish

```bash
# Login to your publisher account
vsce login <your-publisher-id>
# Enter your PAT when prompted

# Package the extension (creates .vsix file)
vsce package

# Publish to Marketplace
vsce publish
```

#### 5. Update Version (for subsequent releases)

```bash
# Bump version and publish
vsce publish patch  # 1.0.0 -> 1.0.1
vsce publish minor  # 1.0.0 -> 1.1.0
vsce publish major  # 1.0.0 -> 2.0.0
```

### Notes

- The extension will be available on the Marketplace within a few minutes after publishing
- Make sure to update `CHANGELOG.md` before publishing new versions
- Never commit your PAT to the repository

## License

[MIT](LICENSE)
