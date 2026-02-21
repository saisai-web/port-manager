/**
 * Port Manager - VS Code Extension
 *
 * View listening ports, check availability, and kill processes.
 * Works on macOS, Windows, and Linux.
 */

const vscode = require("vscode");
const { createWebviewProvider } = require("./webviewProvider");
const { registerCommands } = require("./commands");

/**
 * Extension activation
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Register sidebar webview provider
  const provider = createWebviewProvider();
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("portManager.panel", provider)
  );

  // Register commands
  registerCommands(context);
}

/**
 * Extension deactivation
 */
function deactivate() {}

module.exports = { activate, deactivate };
