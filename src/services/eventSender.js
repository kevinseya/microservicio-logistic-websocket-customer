// src/services/eventSender.js
const { sendMessageToClients } = require("../config/websocket");

function sendWebSocketMessage(operation, event) {
    // Se reenvía el mensaje a todos los clientes conectados
    sendMessageToClients(operation, event);
}

module.exports = { sendWebSocketMessage };
