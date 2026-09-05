const http = require('http'), fs = require('fs'), path = require('path');
const TYPES = {'.html':'text/html','.css':'text/css','.js':'text/javascript'};
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const file = path.join(__dirname, p);
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, {'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream'});
    res.end(data);
  });
}).listen(8123, () => console.log('serving on http://localhost:8123'));
