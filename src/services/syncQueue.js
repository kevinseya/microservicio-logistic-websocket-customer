const { getDatabase } = require("../config/couchdb");
const { sendWebSocketMessage } = require("../services/eventSender");
const sqlserverConnection = require("../config/sqlserverConfig");
const postgresConnection = require("../config/postgresConfig");

// Function to convert UUID to 16 bytes
function uuidToBuffer(uuid) {
  const hex = uuid.replace(/-/g, "");
  return Buffer.from(hex, "hex");
}

// Create CUSTOmER on MariaDB
async function createUserInSQLServer(user) {
    try {
        const query = `
            INSERT INTO user (id, email, lastname, name, password, phone, address)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            uuidToBuffer(user.id), 
            user.email,
            user.lastname,
            user.name,
            user.password,
            user.phone,
            user.role,
        ];
        await sqlserverConnection.query(query, values);
        console.log("Customer created on SQLServer.");
    } catch (error) {
        console.error("Error creating customer on SQLServer:", error.message);
        throw error;
    }
}

// Update CUSTOMER on SQLServer
async function updateUserInSQLServer(user) {
    try {
        // Fields that are usually updated
        let query = 'UPDATE user SET email = ?, lastname = ?, name = ?';
        const values = [user.email, user.lastname, user.name];

        // If allowed password not empty, save on the update
        if (user.password && user.password.trim() !== '') {
            query += ', password = ?';
            values.push(user.password);
        }

        //Continue to the rest of the fields
        query += ', phone = ?, address = ? WHERE id = ?';
        values.push(user.phone, user.role, uuidToBuffer(user.id)); // Conversión de UUID a Buffer

        await sqlserverConnection.query(query, values);
        console.log("Customer update on SQLServer.");
    } catch (error) {
        console.error("Error updating customer on SQLServer:", error.message);
        throw error;
    }
}



//Delete CUSTOMER on PostgreSQL
async function deleteUserFromPostgreSQL(user) {
    try {
        const query = `DELETE FROM user WHERE id = ?`;
        await postgresConnection.query(query, [uuidToBuffer(user)]);
        console.log("Customer delete on PostgreSQ.");
    } catch (error) {
        console.error("Error deleting customer on PostgreSQ:", error.message);
        throw error;
    }
}

async function processPendingEvents() {
    try {
        console.log("Proccesing pending events...");
        const db = await getDatabase();

        if (!db) {
            console.error("The database not initialized.");
            return;
        }

        const response = await db.find({
            selector: { status: "PENDING" },
            sort: [{ timestamp: "asc" }]
        });

        if (response.docs.length === 0) {
            console.log("There are no pending events to process.");
            return;
        }

        for (const event of response.docs) {
            console.log(`📌 Proccesing event: ${event.operation} to ${event.user?.email || event.userId}`);
            
            try {
                // Sent event by WebSocket all services 
                sendWebSocketMessage(event.operation, event);

                // Synchronize between bases according to the type of operation: 
                if (event.operation === "CREATE") {
                    await createUserInSQLServer(event.user);
                } else if (event.operation === "UPDATE") {
                    await updateUserInSQLServer(event.user);
                } else if (event.operation === "DELETE") {
                    await deleteUserFromPostgreSQL(event.user);
                }
                
                event.status = "PROCESSED";
                await db.insert(event);
                console.log(`Event ${event.operation} proccesed and mark with PROCESSED.`);
            } catch (err) {
                console.error(`Error processing event ${event.operation}: ${err.message}`);
            }
        }
    } catch (error) {
        console.error("Error processing events:", error.message);
    }
}

module.exports = { processPendingEvents };
