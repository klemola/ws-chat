#!/usr/bin/env node
const argv = require('minimist')(process.argv.slice(2));
const WebSocketClient = require('websocket').client;

const client = new WebSocketClient();
const userName = argv.username || 'TestClient';

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log("Received: '" + message.utf8Data + "'");
        }
    });

    (function sendMessage() {
        if (connection.connected) {
            const number = Math.round(Math.random() * 0xFFFFFF);
            const msg = {content: number.toString(), sentOn: new Date().getTime(), sentBy: userName};
            connection.sendUTF(JSON.stringify(msg));
            setTimeout(sendMessage, 10000);
        }
    })();
});

client.connect('ws://localhost:3000/', 'echo-protocol');
