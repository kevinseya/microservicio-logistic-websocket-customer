// src/services/eventSender.js
const { sendMessageToClients } = require("../config/websocket");

function sendWebSocketMessage(operation, event) {
// The message is forwarded to all connected clients
    sendMessageToClients(operation, event);
}

module.exports = { sendWebSocketMessage };
