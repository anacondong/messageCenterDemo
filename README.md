# Message Center

This project is a simple message center application with a React frontend and a Spring Boot backend.

## Prerequisites

Before you begin, ensure you have the following installed:
- Java 17 or later
- Node.js and npm
- MongoDB

## Getting Started

### 1. Start MongoDB

Make sure your MongoDB instance is running. If you installed it locally using the default settings, it should be available at `mongodb://localhost:27017`.
Here are the steps to install and start MongoDB:

   1. Import the MongoDB public GPG Key:


   1     sudo apt-get install gnupg
   2     curl -fsSL https://pgp.mongodb.com/server-6.0.asc | \
   3        sudo gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg \
   4        --dearmor


   2. Create a list file for MongoDB:


   1     echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee
     /etc/apt/sources.list.d/mongodb-org-6.0.list


   3. Reload local package database:

   1     sudo apt-get update


   4. Install the MongoDB packages:


   1     sudo apt-get install -y mongodb-org


   5. Start MongoDB:

   1     sudo systemctl start mongod


   6. Verify that MongoDB has started successfully:

   1     sudo systemctl status mongod


   7 create database = "message-center" and collection = "messages"
Monitor MongoDB
mongodb-compass


### 2. Start the Backend

The backend is a Spring Boot application.

```bash
# Navigate to the backend directory
cd /home/dong/code/messageCenter/backend/message-center

# Run the application
./mvnw spring-boot:run
```mv
The backend server will start on port 8080.

### 3. Start the Frontend

The frontend is a React application.

```bash
# Open a new terminal and navigate to the frontend directory
cd /home/dong/code/messageCenter/frontend

# Install dependencies (only needs to be done once)
npm install

# Start the development server
npm start
```
The frontend development server will start on port 3000, and your default web browser should open to `http://localhost:3000`.
