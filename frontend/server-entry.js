// Startup wrapper for the Next.js standalone server.
//
// Node's HTTP server closes idle keep-alive connections after `keepAliveTimeout`
// (default 5s). A browser that reuses a just-closed connection — e.g. the order
// POST fired after the user spent >5s filling the checkout form — hits a
// connection reset, surfaced as "Network error — is the backend running?".
//
// Raising the timeout past any realistic idle gap eliminates that race at the
// source: the server keeps the connection open, so there is never a dead socket
// for the browser to reuse. We patch http.createServer BEFORE requiring the
// generated standalone server so the setting applies to the server it creates.
const http = require("http");

const originalCreateServer = http.createServer;
http.createServer = function patchedCreateServer(...args) {
  const server = originalCreateServer.apply(this, args);
  server.keepAliveTimeout = 65000; // 65s — longer than any checkout form-fill
  server.headersTimeout = 70000; // must be greater than keepAliveTimeout
  return server;
};

require("./server.js");
