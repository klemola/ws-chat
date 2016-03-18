'use strict';

const WebSocketServer = require('websocket').server;
const http = require('http');

const PORT = process.env.PORT || 5000;

const server = http.createServer((request, response) => {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

const wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

const greeting = {
  content: 'Welcome to Convo Supreme 😎',
  sentOn: new Date().getTime(),
  sentBy: 'Server'
};

let messageHistory = [];

server.listen(PORT, function() {
    console.log('server up');
});

wsServer.on('request', (request) => {
    const connection = request.accept('echo-protocol', request.origin);

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
