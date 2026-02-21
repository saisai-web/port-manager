# ⚡ Port Manager

[![Visual Studio Marketplace](https://img.shields.io/visual-studio-marketplace/v/saiki.port-manager?style=flat-square&label=VS%20Code%20Marketplace)](https://marketplace.visualstudio.com/items?itemName=saiki.port-manager)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/saiki.port-manager?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=saiki.port-manager)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

**View listening ports, check availability, and kill processes — all inside VS Code.**

No more switching to a terminal to find out what's hogging port 3000. Port Manager gives you a dedicated sidebar panel and quick commands to manage your local ports without leaving your editor.

![Port Manager Screenshot](images/screenshot.png)

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

## License

[MIT](LICENSE)
