const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Note: Cursor/VS Code "Live Server" commonly squats port 5500 and only serves
// static files (no /api). Use a dedicated port so the donate checkout API works.
const PORT = process.env.PORT || 3000;

// Load .env into process.env (no external dependency) so the checkout API
// can read STRIPE_SECRET_KEY / MOCK_CHECKOUT / PUBLIC_SITE_URL during local dev.
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
  let raw;
  try {
    raw = fs.readFileSync(envPath, 'utf8');
  } catch (e) {
    return;
  }
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eq = trimmed.indexOf('=');
    if (eq === -1) return;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key && !(key in process.env)) process.env[key] = value;
  });
}

loadEnvFile();

// Local dev convenience: ensure success/cancel redirect URLs point at this server.
if (!process.env.PUBLIC_SITE_URL) {
  process.env.PUBLIC_SITE_URL = `http://127.0.0.1:${PORT}`;
}

// Reuse the same serverless handlers used in production (Vercel-style signature).
const checkoutHandler = require('./api/create-checkout-session');
const webhookHandler = require('./api/stripe-webhook');

// Adapt a Node http (req, res) pair to the Express/Vercel-style API the handler expects,
// reading the request body first, then delegating.
function handleCheckoutApi(req, res) {
  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', () => {
    req.body = Buffer.concat(chunks).toString('utf8');
    res.status = function (code) {
      res.statusCode = code;
      return res;
    };
    res.json = function (obj) {
      if (!res.headersSent) res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(obj));
      return res;
    };
    Promise.resolve(checkoutHandler(req, res)).catch((err) => {
      console.error(err);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
      }
      res.end(JSON.stringify({ error: 'Internal server error' }));
    });
  });
}

// The webhook handler reads the raw request stream itself (for Stripe signature
// verification), so unlike the checkout route we must NOT pre-consume the body —
// just attach the Express/Vercel-style res helpers and delegate.
function handleWebhookApi(req, res) {
  res.status = function (code) {
    res.statusCode = code;
    return res;
  };
  res.json = function (obj) {
    if (!res.headersSent) res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(obj));
    return res;
  };
  Promise.resolve(webhookHandler(req, res)).catch((err) => {
    console.error(err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
    }
    res.end(JSON.stringify({ error: 'Internal server error' }));
  });
}

const server = http.createServer((req, res) => {
  let pathname = url.parse(req.url).pathname;

  // Route the checkout API to the shared serverless handler.
  if (pathname === '/api/create-checkout-session') {
    handleCheckoutApi(req, res);
    return;
  }

  // Route the Stripe webhook to the shared serverless handler.
  if (pathname === '/api/stripe-webhook') {
    handleWebhookApi(req, res);
    return;
  }
  
  // Remove query parameters for file resolution
  const queryIndex = pathname.indexOf('?');
  if (queryIndex !== -1) {
    pathname = pathname.substring(0, queryIndex);
  }
  
  // Serve the root as index.html
  if (pathname === '/') {
    pathname = '/index.html';
  }
  
  // If path doesn't have an extension, try adding .html
  if (!path.extname(pathname)) {
    pathname += '.html';
  }
  
  const filePath = path.join(__dirname, pathname);
  
  // Security: prevent directory traversal
  const realPath = path.resolve(filePath);
  const rootPath = path.resolve(__dirname);
  
  if (!realPath.startsWith(rootPath)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // If .html file not found, try without the .html extension was added
      if (filePath.endsWith('.html')) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      }
      return;
    }
    
    // Set content type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp'
    };
    
    const contentType = contentTypes[ext] || 'text/plain';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://127.0.0.1:${PORT}/`);
  console.log(`Clean URLs enabled - visit http://127.0.0.1:${PORT}/contact`);
  console.log(`Donate API:        POST http://127.0.0.1:${PORT}/api/create-checkout-session`);
  console.log(`Webhook API:       POST http://127.0.0.1:${PORT}/api/stripe-webhook`);
  const hasKey = !!process.env.STRIPE_SECRET_KEY;
  const placeholder = process.env.STRIPE_SECRET_KEY === 'sk_test_your_secret_key';
  const mock =
    process.env.MOCK_CHECKOUT === '1' ||
    String(process.env.MOCK_CHECKOUT).toLowerCase() === 'true';
  if (mock) {
    console.log('Checkout mode:     MOCK (MOCK_CHECKOUT set) - no real Stripe calls');
  } else if (!hasKey || placeholder) {
    console.log(
      'Checkout mode:     NOT READY - set a real sk_test_ key in .env (currently a placeholder)'
    );
  } else {
    console.log(`Checkout mode:     LIVE Stripe ${process.env.STRIPE_SECRET_KEY.slice(0, 8)}…`);
  }
});
