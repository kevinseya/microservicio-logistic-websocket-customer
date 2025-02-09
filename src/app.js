// src/app.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");

const { setupDatabase } = require("./config/couchdb");
const { processPendingEvents } = require("./services/syncQueue");
const { setupWebSocket } = require("./config/websocket");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Initialize the WebSocket on the HTTP server
setupWebSocket(server);

async function startServer() {
    try {
        console.log(" Initializing Websocket Service Customer...");
        await setupDatabase();
        console.log("Database CouchDb verified.");

        // Starting service process events
        await processPendingEvents();
        console.log("Events pendings processed.");

        // Process periodic pendings events (10 seconds)
        setInterval(async () => {
            await processPendingEvents();
        }, 10000);

        const PORT = process.env.PORT || 5001;
        server.listen(PORT, () => console.log(`WebSocket Service Customer run on port ${PORT}`));
    } catch (error) {
        console.error("Error starting WebSocket Service Customer :", error.message);
        process.exit(1);
    }
}

startServer();
