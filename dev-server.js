const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 5500;

const server = http.createServer((req, res) => {
  let pathname = url.parse(req.url).pathname;
  
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
});
