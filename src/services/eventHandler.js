// src/services/eventHandler.js
const { getDatabase } = require("../config/couchdb");

async function saveEvent(event) {
    try {
        const db = await getDatabase();
        event.timestamp = new Date().toISOString();
        event.status = "PENDING";
        await db.insert(event);
        console.log("Event save on CouchDB.");
    } catch (error) {
        console.error("Error saving event on CouchDB:", error.message);
        throw error;
    }
}

module.exports = { saveEvent };
