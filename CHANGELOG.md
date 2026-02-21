# Change Log

All notable changes to the "Port Manager" extension will be documented in this file.

## [1.0.0] - 2025-02-21

### Added
- Sidebar webview panel showing all listening TCP ports
- Real-time search filtering by port number and process name
- Sortable columns (port, state, process, PID)
- One-click kill with confirmation dialog
- Bulk select and kill multiple ports
- Range scan to check port availability in a range
- Command palette: Show Listening Ports (Quick Pick with kill)
- Command palette: Check Port Availability
- Command palette: Kill Port (supports comma-separated bulk input)
- Cross-platform support: macOS (`lsof`), Linux (`lsof`/`ss`), Windows (`netstat`/`tasklist`)
- Automatic VS Code theme adaptation (dark, light, high contrast)
