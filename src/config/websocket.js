const { Server } = require("ws");
const { saveEvent } = require("../services/eventHandler"); 
//Clients
const clients = new Set();

function setupWebSocket(server) {
    const wss = new Server({ server, path: "/ws" });

    wss.on("connection", (ws) => {
        console.log("WebSocket client connected");
        clients.add(ws);

        ws.on("message", async (message) => {
            const msg = message.toString().trim();
            console.log("Message received:", msg);
            try {
                const event = JSON.parse(msg);
                if (event.operation && event.customer) {
                    await saveEvent(event);
                    console.log(`Event ${event.operation} save on CouchDB with state "PEDING".`);
                } else {
                    console.warn(" Message JSON invalid. Is required 'operation' y 'customer'.");
                }
            } catch (error) {
                console.error(" Error to parse message JSON:", error.message);
            }
        });

        ws.on("close", () => {
            console.log("Client WebSocket disconnected");
            clients.delete(ws);
        });

        ws.on("error", (error) => {
            console.error("Error on WebSocket:", error.message);
        });
    });
}


function sendMessageToClients(operation, event) {
    const message = JSON.stringify({ operation, event });
    clients.forEach((ws) => {
        if (ws.readyState === ws.OPEN) {
            ws.send(message);
        }
    });
    console.log(` Message sent to ${clients.size} client(s): ${message}`);
}

module.exports = { setupWebSocket, sendMessageToClients };
