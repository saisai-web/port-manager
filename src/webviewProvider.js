/**
 * Port Manager - Webview Provider
 */

const { getWebviewContent } = require("./webview");
const { getListeningPorts, killByPid } = require("./portService");
const { MESSAGE_TYPE, COMMAND } = require("./constants");

/**
 * Create the webview provider for the sidebar panel
 * @returns {Object} WebviewViewProvider
 */
function createWebviewProvider() {
  return {
    resolveWebviewView(webviewView) {
      webviewView.webview.options = { enableScripts: true };
      webviewView.webview.html = getWebviewContent();

      webviewView.webview.onDidReceiveMessage((msg) => {
        handleMessage(msg, webviewView.webview);
      });
    },
  };
}

/**
 * Handle messages from the webview
 * @param {Object} msg - Message from webview
 * @param {Object} webview - Webview instance
 */
function handleMessage(msg, webview) {
  switch (msg.command) {
    case COMMAND.REFRESH:
      handleRefresh(webview);
      break;

    case COMMAND.KILL:
      handleKill(msg, webview);
      break;

    case COMMAND.BULK_KILL:
      handleBulkKill(msg, webview);
      break;

    case COMMAND.SCAN:
      handleScan(msg, webview);
      break;
  }
}

/**
 * Send current ports to the webview
 * @param {Object} webview
 */
function handleRefresh(webview) {
  const ports = getListeningPorts();
  webview.postMessage({ type: MESSAGE_TYPE.PORTS, ports });
}

/**
 * Kill a single process
 * @param {Object} msg
 * @param {Object} webview
 */
function handleKill(msg, webview) {
  try {
    killByPid(msg.pid);
    webview.postMessage({
      type: MESSAGE_TYPE.KILLED,
      port: msg.port,
    });
  } catch (e) {
    webview.postMessage({
      type: MESSAGE_TYPE.KILL_ERROR,
      error: e.message,
    });
  }
}

/**
 * Kill multiple processes
 * @param {Object} msg
 * @param {Object} webview
 */
function handleBulkKill(msg, webview) {
  const ports = getListeningPorts();
  let killed = 0;

  for (const targetPort of msg.ports) {
    const found = ports.find((p) => p.port === targetPort);
    if (found) {
      try {
        killByPid(found.pid);
        killed++;
      } catch {
        // Continue with other ports
      }
    }
  }

  webview.postMessage({
    type: MESSAGE_TYPE.KILLED,
    port: `${killed}個のポート`,
  });
}

/**
 * Scan a port range
 * @param {Object} msg
 * @param {Object} webview
 */
function handleScan(msg, webview) {
  const ports = getListeningPorts();
  const usedSet = new Set(ports.map((p) => p.port));

  let freeCount = 0;
  let usedCount = 0;

  for (let p = msg.from; p <= msg.to; p++) {
    if (usedSet.has(p)) {
      usedCount++;
    } else {
      freeCount++;
    }
  }

  webview.postMessage({
    type: MESSAGE_TYPE.SCAN_RESULT,
    used: usedCount,
    free: freeCount,
  });
}

module.exports = { createWebviewProvider };
