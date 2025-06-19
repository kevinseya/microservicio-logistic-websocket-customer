// src/config/couchdb.js
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const nano = require("nano")(process.env.COUCHDB_URL);
const dbName = "websocket_events_customer";
let db;

async function setupDatabase() {
    try {
        const dbList = await nano.db.list();
        if (!dbList.includes(dbName)) {
            await nano.db.create(dbName);
            console.log(`Base de datos '${dbName}' creada con éxito.`);
        } else {
            console.log(`Base de datos '${dbName}' ya existe.`);
        }
        db = nano.use(dbName);

// Create index to be able to use sort on the "timestamp" field
// If you also filter by "status", it is convenient to include it in the index.
        const indexDefinition = {
            index: {
                fields: ["status", "timestamp"]
            },
            name: "status_timestamp_index",
            type: "json"
        };

        await db.createIndex(indexDefinition);
        console.log("Index 'status_timestamp_index' created or verified.");

    } catch (error) {
        console.error("Error connecting to CouchDB:", error.message);
        process.exit(1);
    }
}

async function getDatabase() {
    if (!db) {
        throw new Error(" The database is not yet initialized.");
    }
    return db;
}

module.exports = { setupDatabase, getDatabase };
