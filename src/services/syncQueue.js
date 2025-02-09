const { getDatabase } = require("../config/couchdb");
const { sendWebSocketMessage } = require("../services/eventSender");
const getSqlServerConnection = require("../config/sqlserverConfig");
const postgresConnection = require("../config/postgresConfig");
const sql = require('mssql');

// Function to convert UUID to Buffer (useful for PostgreSQL)
function uuidToBuffer(uuid) {
  const hex = uuid.replace(/-/g, "");
  return Buffer.from(hex, "hex");
}

// Create a user in SQL Server using named parameters
async function createUserInSQLServer(customer) {
    try {
        const pool = await getSqlServerConnection();
        const query = `
            INSERT INTO [customer] (id, email, lastname, name, password, phone, address, active)
            VALUES (@id, @email, @lastname, @name, @password, @phone, @address, @active)
        `;
        const request = pool.request();
        // We use the UniqueIdentifier type for the id and VarChar for the other fields
        request.input('id', sql.UniqueIdentifier, customer.id);
        request.input('email', sql.VarChar, customer.email);
        request.input('lastname', sql.VarChar, customer.lastname);
        request.input('name', sql.VarChar, customer.name);
        request.input('password', sql.VarChar, customer.password);
        request.input('phone', sql.VarChar, customer.phone);
        request.input('address', sql.VarChar, customer.address);
        request.input('active', sql.Bit, customer.active);

        
        await request.query(query);
        console.log("Customer created on SQLServer.");
    } catch (error) {
        console.error("Error creating customer on SQLServer:", error.message);
        throw error;
    }
}

// Update a user in SQL Server using named parameters
async function updateUserInSQLServer(customer) {
    try {
        const pool = await getSqlServerConnection();
        let query = `UPDATE [customer] SET email = @email, lastname = @lastname, name = @name`;
        if (customer.password && customer.password.trim() !== '') {
            query += `, password = @password`;
        }
        query += `, phone = @phone, address = @address WHERE id = @id`;
        
        const request = pool.request();
        request.input('email', sql.VarChar, customer.email);
        request.input('lastname', sql.VarChar, customer.lastname);
        request.input('name', sql.VarChar, customer.name);
        if (customer.password && customer.password.trim() !== '') {
            request.input('password', sql.VarChar, customer.password);
        }
        request.input('phone', sql.VarChar, customer.phone);
        request.input('address', sql.VarChar, customer.address);
        request.input('id', sql.UniqueIdentifier, customer.id);
        
        await request.query(query);
        console.log("Customer updated on SQLServer.");
    } catch (error) {
        console.error("Error updating customer on SQLServer:", error.message);
        throw error;
    }
}

// Delete a user in PostgreSQL (stays the same)
async function deleteUserFromPostgreSQL(customer) {
    try {
        const query = `UPDATE customer SET active = false WHERE id = $1`;
        await postgresConnection.query(query, [uuidToBuffer(customer)]);
        console.log("Customer deleted on PostgreSQL.");
    } catch (error) {
        console.error("Error deleting customer on PostgreSQL:", error.message);
        throw error;
    }
}

async function processPendingEvents() {
    try {
        console.log("Processing pending events...");
        const db = await getDatabase();

        if (!db) {
            console.error("The database is not initialized.");
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
            console.log(`Processing event: ${event.operation} for ${event.customer?.email || event.customerId}`);
            
            try {
               // Send the event via WebSocket to all services
                sendWebSocketMessage(event.operation, event);

                // Synchronize between databases according to the type of operation
                if (event.operation === "CREATE") {
                    await createUserInSQLServer(event.customer);
                } else if (event.operation === "UPDATE") {
                    await updateUserInSQLServer(event.customer);
                } else if (event.operation === "DELETE") {
                    await deleteUserFromPostgreSQL(event.customer);
                }
                
                event.status = "PROCESSED";
                await db.insert(event);
                console.log(`Event ${event.operation} processed and marked as PROCESSED.`);
            } catch (err) {
                console.error(`Error processing event ${event.operation}: ${err.message}`);
            }
        }
    } catch (error) {
        console.error("Error processing events:", error.message);
    }
}

module.exports = { processPendingEvents };
