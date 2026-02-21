/**
 * Port Manager - Webview HTML Generator
 */

const getStyles = require("./styles");
const getScript = require("./script");

/**
 * Generate the complete webview HTML content
 * @returns {string} HTML content
 */
function getWebviewContent() {
  return /*html*/ `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${getStyles()}</style>
</head>
<body>
  ${getToolbar()}
  ${getScanPanel()}
  <div class="stats" id="stats"></div>
  ${getTable()}
  <div class="empty" id="empty" style="display:none">該当するポートがありません</div>
  <div id="toastContainer"></div>
  <script>${getScript()}</script>
</body>
</html>`;
}

function getToolbar() {
  return /*html*/ `
<div class="toolbar">
  <input type="text" id="search" placeholder="ポート番号 / プロセス名で検索...">
  <button class="btn" onclick="refresh()">更新</button>
  <button class="btn btn-outline" onclick="toggleScan()">範囲スキャン</button>
  <button class="btn btn-danger" id="bulkKillBtn" style="display:none" onclick="bulkKill()">選択をKILL</button>
</div>`;
}

function getScanPanel() {
  return /*html*/ `
<div class="scan-panel" id="scanPanel" style="display:none">
  <label>範囲:</label>
  <input type="number" id="scanFrom" value="3000">
  <span style="opacity:0.4">〜</span>
  <input type="number" id="scanTo" value="9999">
  <button class="btn btn-sm" onclick="scanRange()">実行</button>
</div>`;
}

function getTable() {
  return /*html*/ `
<table>
  <thead>
    <tr>
      <th style="width:36px">
        <input type="checkbox" id="selectAll" onchange="toggleAll(this.checked)">
      </th>
      <th data-sort="port" onclick="sortBy('port')" class="sorted">ポート ▲</th>
      <th data-sort="state" onclick="sortBy('state')">状態</th>
      <th data-sort="process" onclick="sortBy('process')">プロセス</th>
      <th data-sort="pid" onclick="sortBy('pid')">PID</th>
      <th style="text-align:right">操作</th>
    </tr>
  </thead>
  <tbody id="tbody"></tbody>
</table>`;
}

module.exports = { getWebviewContent };
