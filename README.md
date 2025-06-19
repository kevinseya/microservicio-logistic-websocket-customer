# Owner-avatar-microservicio-logistic-websocket-customer

# WebSocket Microservice for Clients - Logistic System

This project is a WebSocket-based microservice that allows real-time management of client-related events in a logistics system. The application allows creating, updating, and deleting clients, storing the events in CouchDB and synchronizing them with SQL Server and PostgreSQL databases.

## 🎯 Project Structure

```
/src
/config
- couchdb.js
- postgresConfig.js
- sqlserverConfig.js
- websocket.js
/services
- eventHandler.js
- eventSender.js
- syncQueue.js
- app.js
- Dockerfile
.env.example
README.md
```
---
## 🛠 Requirements

- Node.js 20 or higher.
- Docker and Docker Compose (for deployment).
- Databases:
- CouchDB
- SQL Server
- PostgreSQL

---
## 🛢 Installation and Execution

### 1. Clone the repository
```bash
git clone https://github.com/kevinseya/microservicio-logistic-websocket-customer.git
cd microservicio-logistic-websocket-customer
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the root of the project with the following variables:
```send
COUCHDB_URL=http://couchdb-user:password@localhost:5984
PORT=5002
SQL_SERVER_HOST=your-sql-server-host
SQL_SERVER_USER=your-user
SQL_SERVER_PASSWORD=your-password
SQL_SERVER_PORT=1433
POSTGRES_HOST=your-postgres-host
POSTGRES_USER=your-user
POSTGRES_PASSWORD=your-password
POSTGRES_PORT=5432
POSTGRES_DATABASE=your-database
```

### 4. Run the service
```bash
npm start
```

The application will run on `http://localhost:5002`.

---
## 🔗 Using WebSocket

### Connecting to WebSocket
Clients can connect to the WebSocket at:
```
ws://localhost:5002/ws
```

### Format of messages sent to the WebSocket
Messages must be in JSON format with the following structure:
```json
{
"operation": "CREATE", // Can be CREATE, UPDATE or DELETE
"customer": {
"id": "123e4567-e89b-12d3-a456-426614174000",
"email": "cliente@example.com",
"name": "John",
"lastname": "Doe",
"phone": "0987654321"
}
}
```

### Response Example
```json
{
"operation": "CREATE",
"status": "PROCESSED",
"customer": {
"id": "123e4567-e89b-12d3-a456-426614174000",
"email": "customer@example.com"
}
}
```

---
## 🚀 CI/CD and Deployment to AWS EC2
The microservice uses **GitHub Actions** for automatic deployment to an **AWS EC2** instance.

### CI/CD Flow
1. **Building the Docker Image**
2. **Push to Docker Hub**
3. **Deployment to AWS EC2**
4. **Running the Container on EC2**

### Manual Commands to Deploy to Docker

```bash
docker build -t logistic_websocket_customer .
docker run -d --name logistic_websocket_customer -p 5002:5002 logistic_websocket_customer
```
---



