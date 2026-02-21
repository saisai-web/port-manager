/**
 * Port Manager - Webview Styles
 */

module.exports = function getStyles() {
  return /*css*/ `
  :root {
    --bg: var(--vscode-editor-background);
    --fg: var(--vscode-editor-foreground);
    --border: var(--vscode-panel-border, #333);
    --accent: #00E676;
    --danger: #FF5252;
    --hover: var(--vscode-list-hoverBackground);
    --badge-listen-bg: #FF5252;
    --badge-listen-fg: #fff;
    --badge-free-bg: #00E676;
    --badge-free-fg: #003311;
    --header-bg: var(--vscode-sideBarSectionHeader-background, #1e1e2e);
    --input-bg: var(--vscode-input-background);
    --input-fg: var(--vscode-input-foreground);
    --input-border: var(--vscode-input-border, #444);
    --btn-bg: var(--vscode-button-background);
    --btn-fg: var(--vscode-button-foreground);
    --btn-hover: var(--vscode-button-hoverBackground);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--bg);
    color: var(--fg);
    font-family: var(--vscode-font-family, system-ui);
    font-size: 13px;
    padding: 0;
  }

  /* Toolbar */
  .toolbar {
    display: flex;
    gap: 6px;
    padding: 10px 12px;
    border-bottom: 1px solid var(--border);
    align-items: center;
    flex-wrap: wrap;
    position: sticky;
    top: 0;
    background: var(--bg);
    z-index: 10;
  }

  .toolbar input[type="text"] {
    flex: 1;
    min-width: 120px;
    padding: 5px 10px;
    border-radius: 4px;
    border: 1px solid var(--input-border);
    background: var(--input-bg);
    color: var(--input-fg);
    font-family: inherit;
    font-size: 12px;
    outline: none;
  }

  .toolbar input:focus { border-color: var(--accent); }

  /* Buttons */
  .btn {
    padding: 5px 12px;
    border-radius: 4px;
    border: none;
    font-size: 12px;
    font-family: inherit;
    cursor: pointer;
    background: var(--btn-bg);
    color: var(--btn-fg);
    white-space: nowrap;
  }

  .btn:hover { background: var(--btn-hover); }
  .btn-danger { background: var(--danger); color: #fff; }
  .btn-danger:hover { opacity: 0.85; }

  .btn-outline {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--fg);
  }

  .btn-outline:hover { background: var(--hover); }
  .btn-sm { padding: 3px 8px; font-size: 11px; }

  /* Stats */
  .stats {
    display: flex;
    gap: 16px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--border);
    font-size: 12px;
    opacity: 0.7;
  }

  .stats span { display: flex; align-items: center; gap: 4px; }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
  }

  /* Table */
  table { width: 100%; border-collapse: collapse; }

  th {
    text-align: left;
    padding: 7px 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    opacity: 0.5;
    border-bottom: 1px solid var(--border);
    cursor: pointer;
    user-select: none;
    position: sticky;
    top: 72px;
    background: var(--bg);
    z-index: 5;
  }

  th:hover { opacity: 0.8; }
  th.sorted { opacity: 1; color: var(--accent); }

  td {
    padding: 6px 12px;
    border-bottom: 1px solid var(--border);
  }

  tr:hover td { background: var(--hover); }
  tr.selected td { background: rgba(0, 230, 118, 0.08); }

  /* Badges */
  .badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 600;
  }

  .badge-listen { background: var(--badge-listen-bg); color: var(--badge-listen-fg); }
  .badge-free { background: var(--badge-free-bg); color: var(--badge-free-fg); }

  /* Port display */
  .port-num {
    font-weight: 700;
    font-family: var(--vscode-editor-font-family, monospace);
  }

  .process-name { color: var(--accent); }

  .pid {
    opacity: 0.5;
    font-family: var(--vscode-editor-font-family, monospace);
    font-size: 12px;
  }

  /* Kill button */
  .kill-btn {
    padding: 2px 10px;
    border-radius: 4px;
    font-size: 11px;
    border: 1px solid var(--danger);
    background: transparent;
    color: var(--danger);
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;
  }

  .kill-btn:hover { background: var(--danger); color: #fff; }

  .confirm-group { display: inline-flex; gap: 4px; }

  /* Empty state */
  .empty { text-align: center; padding: 40px; opacity: 0.4; }

  /* Toast notifications */
  .toast {
    position: fixed;
    bottom: 16px;
    right: 16px;
    padding: 10px 18px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    z-index: 100;
    animation: slideUp 0.3s ease;
  }

  .toast-success { background: var(--accent); color: #003311; }
  .toast-error { background: var(--danger); color: #fff; }

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  /* Checkbox */
  input[type="checkbox"] { accent-color: var(--accent); }

  /* Scan panel */
  .scan-panel {
    padding: 10px 12px;
    border-bottom: 1px solid var(--border);
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }

  .scan-panel input[type="number"] {
    width: 80px;
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid var(--input-border);
    background: var(--input-bg);
    color: var(--input-fg);
    font-family: inherit;
    font-size: 12px;
  }

  .scan-panel label { font-size: 12px; opacity: 0.6; }
`;
};
