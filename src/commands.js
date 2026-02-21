/**
 * Port Manager - VS Code Commands
 */

const vscode = require("vscode");
const { getListeningPorts, killByPid, checkPortFree } = require("./portService");
const { PORT } = require("./constants");

/**
 * Register all extension commands
 * @param {vscode.ExtensionContext} context
 */
function registerCommands(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand("portManager.show", showPortsCommand),
    vscode.commands.registerCommand("portManager.checkPort", checkPortCommand),
    vscode.commands.registerCommand("portManager.killPort", killPortCommand)
  );
}

/**
 * Show listening ports in a QuickPick
 */
async function showPortsCommand() {
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

  if (!picked) return;

  const confirm = await vscode.window.showWarningMessage(
    `ポート :${picked.port} (${picked.process}) を終了しますか？`,
    { modal: true },
    "KILL"
  );

  if (confirm === "KILL") {
    await killProcess(picked.pid, picked.port);
  }
}

/**
 * Check if a port is available
 */
async function checkPortCommand() {
  const input = await vscode.window.showInputBox({
    prompt: "確認するポート番号を入力",
    placeHolder: "例: 3000",
    validateInput: validatePortNumber,
  });

  if (!input) return;

  const port = parseInt(input, 10);
  const free = await checkPortFree(port);

  if (free) {
    vscode.window.showInformationMessage(`ポート :${port} は空いています`);
    return;
  }

  const ports = getListeningPorts();
  const found = ports.find((p) => p.port === port);
  const detail = found ? ` (${found.process}, PID: ${found.pid})` : "";

  const action = await vscode.window.showWarningMessage(
    `ポート :${port} は使用中です${detail}`,
    "KILL"
  );

  if (action === "KILL" && found) {
    await killProcess(found.pid, port);
  }
}

/**
 * Kill port(s) by number input
 */
async function killPortCommand() {
  const input = await vscode.window.showInputBox({
    prompt: "閉じるポート番号を入力 (カンマ区切りで複数可)",
    placeHolder: "例: 3000 または 3000,8080,5432",
  });

  if (!input) return;

  const ports = getListeningPorts();
  const targets = parsePortInput(input, ports);

  if (targets.length === 0) {
    vscode.window.showWarningMessage("該当するポートが見つかりません");
    return;
  }

  const desc = targets.map((t) => `:${t.port} (${t.process})`).join(", ");
  const confirm = await vscode.window.showWarningMessage(
    `${targets.length} 個のポートを終了: ${desc}`,
    { modal: true },
    "KILL"
  );

  if (confirm !== "KILL") return;

  let ok = 0;
  let fail = 0;

  for (const t of targets) {
    try {
      killByPid(t.pid);
      ok++;
    } catch {
      fail++;
    }
  }

  vscode.window.showInformationMessage(`完了: 成功 ${ok} / 失敗 ${fail}`);
}

/**
 * Kill a process and show result message
 * @param {number} pid
 * @param {number} port
 */
async function killProcess(pid, port) {
  try {
    killByPid(pid);
    vscode.window.showInformationMessage(`ポート :${port} を終了しました`);
  } catch (e) {
    vscode.window.showErrorMessage(`終了失敗: ${e.message}`);
  }
}

/**
 * Validate port number input
 * @param {string} value
 * @returns {string|null} Error message or null
 */
function validatePortNumber(value) {
  const n = parseInt(value, 10);
  if (!n || n < PORT.MIN || n > PORT.MAX) {
    return `${PORT.MIN}-${PORT.MAX} の範囲で入力してください`;
  }
  return null;
}

/**
 * Parse comma-separated port input
 * @param {string} input
 * @param {Array} availablePorts
 * @returns {Array}
 */
function parsePortInput(input, availablePorts) {
  return input
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => n > 0)
    .map((n) => availablePorts.find((p) => p.port === n))
    .filter(Boolean);
}

module.exports = { registerCommands };
