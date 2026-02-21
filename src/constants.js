/**
 * Port Manager - Constants
 */

const os = require("os");

module.exports = {
  PLATFORM: os.platform(),

  // Timeout values (ms)
  TIMEOUT: {
    COMMAND: 10000,
    KILL: 5000,
  },

  // Port range limits
  PORT: {
    MIN: 1,
    MAX: 65535,
    DEFAULT_SCAN_FROM: 3000,
    DEFAULT_SCAN_TO: 9999,
  },

  // Message types for webview communication
  MESSAGE_TYPE: {
    PORTS: "ports",
    KILLED: "killed",
    KILL_ERROR: "killError",
    SCAN_RESULT: "scanResult",
  },

  // Commands from webview
  COMMAND: {
    REFRESH: "refresh",
    KILL: "kill",
    BULK_KILL: "bulkKill",
    SCAN: "scan",
  },

  // Port states
  STATE: {
    LISTEN: "LISTEN",
    FREE: "FREE",
  },
};
