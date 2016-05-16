'use strict';

const WebSocketServer = require('websocket').server;
const http = require('http');
const fs = require('fs');
const crypto = require('crypto');

const PORT = process.env.PORT || 5000;

function handler(request, response) {
  console.log((new Date()) + ' Received request for ' + request.url);
  response.writeHead(404);
  response.end();
}

function upgrade(request, socket) {
  const key = request.headers['sec-websocket-key'];
  const hashedKey = crypto
    .createHash('sha1')
    .update(key+"258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
    .digest('base64');

  const sResponse = "HTTP/1.1 101 Switching Protocols\r\n" +
      "Upgrade: websocket\r\n" + "Connection: Upgrade\r\n" +
      "Sec-WebSocket-Accept: " + key + "\r\n\r\n";
      socket.write(sResponse,'ascii');
}

const httpServer = http.createServer(handler);

const wsServer = new WebSocketServer({
    httpServer: httpServer,
    autoAcceptConnections: false
});

const greeting = {
  content: 'Welcome to Convo Supreme 😎',
  sentOn: new Date().getTime(),
  sentBy: 'Server'
};

let messageHistory = [];

httpServer.onupgrade = upgrade;
httpServer.listen(PORT, function() {
  console.log('Server up');
});

wsServer.on('request', (request) => {
    const connection = request.accept(null, request.origin);

    console.log((new Date()) + ' Connection accepted.');
    connection.sendUTF(JSON.stringify(greeting));
    messageHistory.forEach((msg) => {
      connection.sendUTF(msg);
    });

    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message', message.utf8Data);
            messageHistory.push(message.utf8Data);
            wsServer.broadcast(message.utf8Data);
        }
    });

    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});
