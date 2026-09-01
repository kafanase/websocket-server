const http = require('http');
const httpProxy = require('http-proxy');

// Отключаем строгую проверку SSL на уровне всего процесса Node.js
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Целевой WSS/HTTPS сервер
const TARGET_URL = process.env.TARGET_URL || 'https://node9.quaxly.com:25724';

const proxy = httpProxy.createProxyServer({
  target: TARGET_URL,
  changeOrigin: true,
  ws: true,
  secure: false // Игнорировать ошибки невалидных/самоподписанных сертификатов
});

proxy.on('error', (err, req, res) => {
  console.error('[PROXY ERROR]:', err.message);
  if (res && res.writeHead) {
    res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad Gateway: Не удалось соединиться с VPN сервером');
  }
});

proxy.on('proxyReqWs', (proxyReq, req, socket, options, head) => {
  proxyReq.setHeader('Host', 'node9.quaxly.com:25724');
  proxyReq.setHeader('Origin', '[https://node9.quaxly.com:25724](https://node9.quaxly.com:25724)');
});

const server = http.createServer((req, res) => {
  proxy.web(req, res);
});

server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`Прокси запущен на порту: ${PORT}`);
  console.log(`Целевой сервер: ${TARGET_URL}`);
  console.log(`Проверка SSL: ОТКЛЮЧЕНА`);
  console.log(`=================================`);
});
