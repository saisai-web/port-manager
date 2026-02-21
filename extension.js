const vscode = require("vscode");
const { execSync } = require("child_process");
const os = require("os");
const net = require("net");

const PLATFORM = os.platform();

// ── ポート取得 ──────────────────────────────────────────
function getListeningPorts() {
  if (PLATFORM === "darwin" || PLATFORM === "linux") return getPortsUnix();
  if (PLATFORM === "win32") return getPortsWindows();
  return [];
}

function getPortsUnix() {
  const ports = [];
  try {
    const out = execSync("lsof -iTCP -sTCP:LISTEN -nP 2>/dev/null || true", {
      encoding: "utf-8",
      timeout: 10000,
    });
    const seen = new Set();
    for (const line of out.split("\n").slice(1)) {
      const parts = line.trim().split(/\s+/);
      if (parts.length < 9) continue;
      const proc = parts[0];
      const pid = parseInt(parts[1]);
      const match = (parts[8] || "").match(/:(\d+)$/);
      if (!match) continue;
      const port = parseInt(match[1]);
      if (seen.has(port)) continue;
      seen.add(port);
      ports.push({ port, pid, process: proc });
    }
  } catch (e) {
    try {
      const out = execSync("ss -tlnp 2>/dev/null || true", {
        encoding: "utf-8",
        timeout: 10000,
      });
      for (const line of out.split("\n").slice(1)) {
        const parts = line.trim().split(/\s+/);
        if (parts.length < 5) continue;
        const match = (parts[3] || "").match(/:(\d+)$/);
        if (!match) continue;
        const port = parseInt(match[1]);
        const pidMatch = (parts[6] || "").match(/pid=(\d+)/);
        const nameMatch = (parts[6] || "").match(/\("([^"]+)"/);
        ports.push({
          port,
          pid: pidMatch ? parseInt(pidMatch[1]) : null,
          process: nameMatch ? nameMatch[1] : "unknown",
        });
      }
    } catch (e2) {}
  }
  return ports.sort((a, b) => a.port - b.port);
}

function getPortsWindows() {
  const ports = [];
  try {
    const out = execSync("netstat -ano -p TCP", {
      encoding: "utf-8",
      timeout: 10000,
    });
    const pidToName = {};
    try {
      const tasks = execSync("tasklist /fo csv /nh", {
        encoding: "utf-8",
        timeout: 10000,
      });
      for (const line of tasks.split("\n")) {
        const m = line.match(/"([^"]+)","(\d+)"/);
        if (m) pidToName[m[2]] = m[1];
      }
    } catch (e) {}

    const seen = new Set();
    for (const line of out.split("\n")) {
      if (!line.includes("LISTENING")) continue;
      const parts = line.trim().split(/\s+/);
      const match = (parts[1] || "").match(/:(\d+)$/);
      if (!match) continue;
      const port = parseInt(match[1]);
      if (seen.has(port)) continue;
      seen.add(port);
      const pid = parseInt(parts[parts.length - 1]);
      ports.push({
        port,
        pid,
        process: pidToName[String(pid)] || `PID:${pid}`,
      });
    }
  } catch (e) {}
  return ports.sort((a, b) => a.port - b.port);
}

// ── プロセスKILL ────────────────────────────────────────
function killByPid(pid) {
  if (PLATFORM === "win32") {
    execSync(`taskkill /F /PID ${pid}`, { timeout: 5000 });
  } else {
    execSync(`kill -9 ${pid}`, { timeout: 5000 });
  }
}

// ── ポート空き確認 ──────────────────────────────────────
function checkPortFree(port) {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.once("error", () => resolve(false));
    srv.once("listening", () => {
      srv.close();
      resolve(true);
    });
    srv.listen(port, "127.0.0.1");
  });
}

// ── Webview HTML生成 ────────────────────────────────────
function getWebviewContent(webview, extensionUri) {
  return /*html*/ `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
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

  /* ── Toolbar ── */
  .toolbar {
    display: flex; gap: 6px; padding: 10px 12px;
    border-bottom: 1px solid var(--border);
    align-items: center; flex-wrap: wrap;
    position: sticky; top: 0; background: var(--bg); z-index: 10;
  }
  .toolbar input[type="text"] {
    flex: 1; min-width: 120px;
    padding: 5px 10px; border-radius: 4px;
    border: 1px solid var(--input-border);
    background: var(--input-bg); color: var(--input-fg);
    font-family: inherit; font-size: 12px; outline: none;
  }
  .toolbar input:focus { border-color: var(--accent); }
  .btn {
    padding: 5px 12px; border-radius: 4px; border: none;
    font-size: 12px; font-family: inherit; cursor: pointer;
    background: var(--btn-bg); color: var(--btn-fg);
    white-space: nowrap;
  }
  .btn:hover { background: var(--btn-hover); }
  .btn-danger { background: var(--danger); color: #fff; }
  .btn-danger:hover { opacity: 0.85; }
  .btn-outline {
    background: transparent; border: 1px solid var(--border);
    color: var(--fg);
  }
  .btn-outline:hover { background: var(--hover); }
  .btn-sm { padding: 3px 8px; font-size: 11px; }

  /* ── Stats ── */
  .stats {
    display: flex; gap: 16px; padding: 8px 12px;
    border-bottom: 1px solid var(--border);
    font-size: 12px; opacity: 0.7;
  }
  .stats span { display: flex; align-items: center; gap: 4px; }
  .dot {
    width: 8px; height: 8px; border-radius: 50%; display: inline-block;
  }

  /* ── Table ── */
  table { width: 100%; border-collapse: collapse; }
  th {
    text-align: left; padding: 7px 12px; font-size: 11px;
    font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
    opacity: 0.5; border-bottom: 1px solid var(--border);
    cursor: pointer; user-select: none; position: sticky; top: 72px;
    background: var(--bg); z-index: 5;
  }
  th:hover { opacity: 0.8; }
  th.sorted { opacity: 1; color: var(--accent); }
  td { padding: 6px 12px; border-bottom: 1px solid var(--border); }
  tr:hover td { background: var(--hover); }
  tr.selected td { background: rgba(0, 230, 118, 0.08); }

  .badge {
    display: inline-block; padding: 2px 8px; border-radius: 10px;
    font-size: 11px; font-weight: 600;
  }
  .badge-listen { background: var(--badge-listen-bg); color: var(--badge-listen-fg); }
  .badge-free { background: var(--badge-free-bg); color: var(--badge-free-fg); }

  .port-num { font-weight: 700; font-family: var(--vscode-editor-font-family, monospace); }
  .process-name { color: var(--accent); }
  .pid { opacity: 0.5; font-family: var(--vscode-editor-font-family, monospace); font-size: 12px; }

  .kill-btn {
    padding: 2px 10px; border-radius: 4px; font-size: 11px;
    border: 1px solid var(--danger); background: transparent;
    color: var(--danger); cursor: pointer; font-family: inherit;
    transition: all 0.15s;
  }
  .kill-btn:hover { background: var(--danger); color: #fff; }

  .confirm-group { display: inline-flex; gap: 4px; }

  /* ── Empty ── */
  .empty { text-align: center; padding: 40px; opacity: 0.4; }

  /* ── Toast ── */
  .toast {
    position: fixed; bottom: 16px; right: 16px;
    padding: 10px 18px; border-radius: 6px;
    font-size: 12px; font-weight: 600; z-index: 100;
    animation: slideUp 0.3s ease;
  }
  .toast-success { background: var(--accent); color: #003311; }
  .toast-error { background: var(--danger); color: #fff; }
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  /* ── Checkbox ── */
  input[type="checkbox"] { accent-color: var(--accent); }

  /* ── Scan Panel ── */
  .scan-panel {
    padding: 10px 12px; border-bottom: 1px solid var(--border);
    display: flex; gap: 8px; align-items: center; flex-wrap: wrap;
  }
  .scan-panel input[type="number"] {
    width: 80px; padding: 4px 8px; border-radius: 4px;
    border: 1px solid var(--input-border);
    background: var(--input-bg); color: var(--input-fg);
    font-family: inherit; font-size: 12px;
  }
  .scan-panel label { font-size: 12px; opacity: 0.6; }
</style>
</head>
<body>

<div class="toolbar">
  <input type="text" id="search" placeholder="🔍 ポート番号 / プロセス名で検索...">
  <button class="btn" onclick="refresh()">↻ 更新</button>
  <button class="btn btn-outline" onclick="toggleScan()">🔎 範囲スキャン</button>
  <button class="btn btn-danger" id="bulkKillBtn" style="display:none" onclick="bulkKill()">🗑 選択をKILL</button>
</div>

<div class="scan-panel" id="scanPanel" style="display:none">
  <label>範囲:</label>
  <input type="number" id="scanFrom" value="3000">
  <span style="opacity:0.4">〜</span>
  <input type="number" id="scanTo" value="9999">
  <button class="btn btn-sm" onclick="scanRange()">実行</button>
</div>

<div class="stats" id="stats"></div>

<table>
  <thead>
    <tr>
      <th style="width:36px"><input type="checkbox" id="selectAll" onchange="toggleAll(this.checked)"></th>
      <th data-sort="port" onclick="sortBy('port')" class="sorted">ポート ▲</th>
      <th data-sort="state" onclick="sortBy('state')">状態</th>
      <th data-sort="process" onclick="sortBy('process')">プロセス</th>
      <th data-sort="pid" onclick="sortBy('pid')">PID</th>
      <th style="text-align:right">操作</th>
    </tr>
  </thead>
  <tbody id="tbody"></tbody>
</table>

<div class="empty" id="empty" style="display:none">該当するポートがありません</div>
<div id="toastContainer"></div>

<script>
  const vscode = acquireVsCodeApi();
  let ports = [];
  let selected = new Set();
  let currentSort = { col: "port", dir: "asc" };
  let filter = "";
  let confirmingKill = null;

  // ── VSCode からのメッセージ受信 ──
  window.addEventListener("message", (e) => {
    const msg = e.data;
    switch (msg.type) {
      case "ports":
        ports = msg.ports;
        render();
        break;
      case "killed":
        showToast("✅ :" + msg.port + " を終了しました", "success");
        confirmingKill = null;
        selected.delete(msg.port);
        vscode.postMessage({ command: "refresh" });
        break;
      case "killError":
        showToast("❌ 終了失敗: " + msg.error, "error");
        confirmingKill = null;
        render();
        break;
      case "scanResult":
        showToast("🔎 使用中: " + msg.used + " / 空き: " + msg.free, "success");
        break;
    }
  });

  // ── 描画 ──
  function render() {
    let list = ports.filter((p) => {
      if (!filter) return true;
      const f = filter.toLowerCase();
      return String(p.port).includes(f) || (p.process || "").toLowerCase().includes(f);
    });

    list.sort((a, b) => {
      let cmp = 0;
      const col = currentSort.col;
      if (col === "port") cmp = a.port - b.port;
      else if (col === "state") cmp = (a.state || "").localeCompare(b.state || "");
      else if (col === "process") cmp = (a.process || "").localeCompare(b.process || "");
      else if (col === "pid") cmp = (a.pid || 0) - (b.pid || 0);
      return currentSort.dir === "asc" ? cmp : -cmp;
    });

    const tbody = document.getElementById("tbody");
    const listenCount = ports.filter(p => p.state === "LISTEN").length;
    const freeCount = ports.filter(p => p.state === "FREE").length;
    document.getElementById("stats").innerHTML =
      '<span><span class="dot" style="background:#FF5252"></span> 使用中 ' + listenCount + '</span>' +
      '<span><span class="dot" style="background:#00E676"></span> 空き ' + freeCount + '</span>' +
      '<span>合計 ' + ports.length + '</span>';

    if (list.length === 0) {
      tbody.innerHTML = "";
      document.getElementById("empty").style.display = "block";
      return;
    }
    document.getElementById("empty").style.display = "none";

    tbody.innerHTML = list.map((p) => {
      const isSelected = selected.has(p.port);
      const isListen = p.state === "LISTEN";
      const badgeClass = isListen ? "badge-listen" : "badge-free";
      const badgeText = isListen ? "使用中" : "空き";
      const isConfirming = confirmingKill === p.port;

      let actionHtml = "";
      if (isListen) {
        if (isConfirming) {
          actionHtml =
            '<span class="confirm-group">' +
            '<button class="btn btn-sm btn-danger" onclick="confirmKill(' + p.port + ',' + p.pid + ')">確認</button>' +
            '<button class="btn btn-sm btn-outline" onclick="cancelKill()">取消</button>' +
            '</span>';
        } else {
          actionHtml = '<button class="kill-btn" onclick="startKill(' + p.port + ')">KILL</button>';
        }
      }

      return '<tr class="' + (isSelected ? "selected" : "") + '">' +
        '<td><input type="checkbox" ' + (isSelected ? "checked" : "") + ' onchange="togglePort(' + p.port + ')"></td>' +
        '<td class="port-num">:' + p.port + '</td>' +
        '<td><span class="badge ' + badgeClass + '">' + badgeText + '</span></td>' +
        '<td class="process-name">' + (p.process || "-") + '</td>' +
        '<td class="pid">' + (p.pid || "-") + '</td>' +
        '<td style="text-align:right">' + actionHtml + '</td>' +
        '</tr>';
    }).join("");

    // bulk kill button
    const activeSelected = [...selected].filter(p => ports.find(pp => pp.port === p && pp.state === "LISTEN"));
    document.getElementById("bulkKillBtn").style.display = activeSelected.length > 0 ? "inline-block" : "none";
    document.getElementById("bulkKillBtn").textContent = "🗑 選択をKILL (" + activeSelected.length + ")";

    // update header sort indicators
    document.querySelectorAll("th[data-sort]").forEach((th) => {
      const col = th.dataset.sort;
      th.classList.toggle("sorted", col === currentSort.col);
      if (col === currentSort.col) {
        th.textContent = th.textContent.replace(/ [▲▼]$/, "") + (currentSort.dir === "asc" ? " ▲" : " ▼");
      } else {
        th.textContent = th.textContent.replace(/ [▲▼]$/, "");
      }
    });
  }

  // ── イベント ──
  document.getElementById("search").addEventListener("input", (e) => {
    filter = e.target.value;
    render();
  });

  function refresh() { vscode.postMessage({ command: "refresh" }); }

  function sortBy(col) {
    if (currentSort.col === col) {
      currentSort.dir = currentSort.dir === "asc" ? "desc" : "asc";
    } else {
      currentSort = { col, dir: "asc" };
    }
    render();
  }

  function togglePort(port) {
    if (selected.has(port)) selected.delete(port); else selected.add(port);
    render();
  }

  function toggleAll(checked) {
    if (checked) ports.forEach((p) => selected.add(p.port));
    else selected.clear();
    render();
  }

  function startKill(port) {
    confirmingKill = port;
    render();
  }

  function cancelKill() {
    confirmingKill = null;
    render();
  }

  function confirmKill(port, pid) {
    vscode.postMessage({ command: "kill", port, pid });
  }

  function bulkKill() {
    const targets = [...selected].filter(p => ports.find(pp => pp.port === p && pp.state === "LISTEN"));
    if (targets.length === 0) return;
    vscode.postMessage({ command: "bulkKill", ports: targets });
    selected.clear();
  }

  function toggleScan() {
    const panel = document.getElementById("scanPanel");
    panel.style.display = panel.style.display === "none" ? "flex" : "none";
  }

  function scanRange() {
    const from = parseInt(document.getElementById("scanFrom").value) || 3000;
    const to = parseInt(document.getElementById("scanTo").value) || 9999;
    vscode.postMessage({ command: "scan", from, to });
  }

  function showToast(msg, type) {
    const container = document.getElementById("toastContainer");
    const el = document.createElement("div");
    el.className = "toast toast-" + type;
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }

  // 初回読み込み
  vscode.postMessage({ command: "refresh" });
</script>
</body>
</html>`;
}

// ── 拡張機能のメインロジック ────────────────────────────
function activate(context) {
  // サイドバー Webview Provider
  const provider = {
    resolveWebviewView(webviewView) {
      webviewView.webview.options = { enableScripts: true };
      webviewView.webview.html = getWebviewContent(
        webviewView.webview,
        context.extensionUri
      );

      webviewView.webview.onDidReceiveMessage(async (msg) => {
        switch (msg.command) {
          case "refresh": {
            const ports = getListeningPorts();
            webviewView.webview.postMessage({ type: "ports", ports });
            break;
          }
          case "kill": {
            try {
              killByPid(msg.pid);
              webviewView.webview.postMessage({
                type: "killed",
                port: msg.port,
              });
            } catch (e) {
              webviewView.webview.postMessage({
                type: "killError",
                error: e.message,
              });
            }
            break;
          }
          case "bulkKill": {
            const ports = getListeningPorts();
            let killed = 0;
            for (const targetPort of msg.ports) {
              const found = ports.find((p) => p.port === targetPort);
              if (found) {
                try {
                  killByPid(found.pid);
                  killed++;
                } catch (e) {}
              }
            }
            webviewView.webview.postMessage({
              type: "killed",
              port: `${killed}個のポート`,
            });
            break;
          }
          case "scan": {
            const ports = getListeningPorts();
            const usedSet = new Set(ports.map((p) => p.port));
            let freeCount = 0;
            let usedCount = 0;
            for (let p = msg.from; p <= msg.to; p++) {
              if (usedSet.has(p)) usedCount++;
              else freeCount++;
            }
            webviewView.webview.postMessage({
              type: "scanResult",
              used: usedCount,
              free: freeCount,
            });
            break;
          }
        }
      });
    },
  };

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("portManager.panel", provider)
  );

  // コマンド: ポート一覧 (QuickPick)
  context.subscriptions.push(
    vscode.commands.registerCommand("portManager.show", async () => {
      const ports = getListeningPorts();
      if (ports.length === 0) {
        vscode.window.showInformationMessage("使用中のポートはありません");
        return;
      }
      const items = ports.map((p) => ({
        label: `:${p.port}`,
        description: `${p.process} (PID: ${p.pid})`,
        port: p.port,
        pid: p.pid,
        process: p.process,
      }));
      const picked = await vscode.window.showQuickPick(items, {
        placeHolder: "使用中のポート一覧 — 選択してKILL",
      });
      if (picked) {
        const confirm = await vscode.window.showWarningMessage(
          `ポート :${picked.port} (${picked.process}) を終了しますか？`,
          { modal: true },
          "KILL"
        );
        if (confirm === "KILL") {
          try {
            killByPid(picked.pid);
            vscode.window.showInformationMessage(
              `✅ ポート :${picked.port} を終了しました`
            );
          } catch (e) {
            vscode.window.showErrorMessage(`❌ 終了失敗: ${e.message}`);
          }
        }
      }
    })
  );

  // コマンド: ポート空き確認
  context.subscriptions.push(
    vscode.commands.registerCommand("portManager.checkPort", async () => {
      const input = await vscode.window.showInputBox({
        prompt: "確認するポート番号を入力",
        placeHolder: "例: 3000",
        validateInput: (v) => {
          const n = parseInt(v);
          if (!n || n < 1 || n > 65535) return "1-65535 の範囲で入力してください";
          return null;
        },
      });
      if (!input) return;
      const port = parseInt(input);
      const free = await checkPortFree(port);
      if (free) {
        vscode.window.showInformationMessage(`✅ ポート :${port} は空いています`);
      } else {
        const ports = getListeningPorts();
        const found = ports.find((p) => p.port === port);
        const detail = found
          ? ` (${found.process}, PID: ${found.pid})`
          : "";
        const action = await vscode.window.showWarningMessage(
          `❌ ポート :${port} は使用中です${detail}`,
          "KILL"
        );
        if (action === "KILL" && found) {
          try {
            killByPid(found.pid);
            vscode.window.showInformationMessage(
              `✅ ポート :${port} を終了しました`
            );
          } catch (e) {
            vscode.window.showErrorMessage(`❌ 終了失敗: ${e.message}`);
          }
        }
      }
    })
  );

  // コマンド: ポートKILL (直接入力)
  context.subscriptions.push(
    vscode.commands.registerCommand("portManager.killPort", async () => {
      const input = await vscode.window.showInputBox({
        prompt: "閉じるポート番号を入力 (カンマ区切りで複数可)",
        placeHolder: "例: 3000 または 3000,8080,5432",
      });
      if (!input) return;

      const ports = getListeningPorts();
      const targets = input
        .split(",")
        .map((s) => parseInt(s.trim()))
        .filter((n) => n > 0)
        .map((n) => ports.find((p) => p.port === n))
        .filter(Boolean);

      if (targets.length === 0) {
        vscode.window.showWarningMessage("該当するポートが見つかりません");
        return;
      }

      const desc = targets
        .map((t) => `:${t.port} (${t.process})`)
        .join(", ");
      const confirm = await vscode.window.showWarningMessage(
        `${targets.length} 個のポートを終了: ${desc}`,
        { modal: true },
        "KILL"
      );

      if (confirm === "KILL") {
        let ok = 0,
          fail = 0;
        for (const t of targets) {
          try {
            killByPid(t.pid);
            ok++;
          } catch (e) {
            fail++;
          }
        }
        vscode.window.showInformationMessage(
          `完了: 成功 ${ok} / 失敗 ${fail}`
        );
      }
    })
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
