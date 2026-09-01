const net = require('net');
const tls = require('tls');
const { URL } = require('url');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const TARGET = process.env.TARGET_URL || 'https://node9.quaxly.com:25724';
const parsedUrl = new URL(TARGET);

const TARGET_HOST = parsedUrl.hostname;
const TARGET_PORT = parseInt(parsedUrl.port) || (parsedUrl.protocol === 'https:' ? 443 : 80);
const IS_SECURE = parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'wss:';

const server = net.createServer((clientSocket) => {
  clientSocket.on('error', () => {});

  let targetSocket;

  if (IS_SECURE) {
    targetSocket = tls.connect({
      host: TARGET_HOST,
      port: TARGET_PORT,
      servername: TARGET_HOST,
      rejectUnauthorized: false
    });
  } else {
    targetSocket = net.connect({
      host: TARGET_HOST,
      port: TARGET_PORT
    });
  }

  targetSocket.on('error', () => {
    clientSocket.destroy();
  });

  clientSocket.pipe(targetSocket);
  targetSocket.pipe(clientSocket);
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Application started on port ${PORT}`);
});
