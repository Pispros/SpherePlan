/**
 * Local HTTP server for Capacitor Android development.
 * Capacitor's Android WebView cannot load `file://` URLs directly —
 * it needs an `http://` or `https://` origin.
 *
 * Usage:  npx cap run android   (Capacitor CLI starts its own server)
 *         node android-server.js (manual start for debugging)
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT = path.resolve(__dirname);

// MIME type map
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".map": "application/json",
};

const server = http.createServer((req, res) => {
  // Normalize path — strip query string
  let filePath = req.url.split("?")[0];
  if (filePath === "/") filePath = "/index.html";

  const fullPath = path.join(ROOT, filePath);

  // Prevent directory traversal
  if (!fullPath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        // SPA fallback — serve index.html for any non-file route
        const indexPath = path.join(ROOT, "index.html");
        fs.readFile(indexPath, (idxErr, idxData) => {
          if (idxErr) {
            res.writeHead(500);
            res.end("Internal Server Error");
          } else {
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            res.end(idxData);
          }
        });
      } else {
        res.writeHead(500);
        res.end("Internal Server Error");
      }
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || "application/octet-stream";

    res.writeHead(200, {
      "Content-Type": contentType,
      // Disable caching in dev to avoid stale assets
      "Cache-Control": "no-store",
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n  ✓ SpherePlan dev server running at http://localhost:${PORT}\n`);
});
