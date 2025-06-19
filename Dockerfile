# We use the official Node.js image from Docker Hub
FROM node:20

# We set the working directory inside the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files (if available)
COPY package*.json ./

# We install the project dependencies
RUN npm install

# We copy the rest of the application files
COPY . .

# Exponemos el puerto en el que la aplicación va a correr
EXPOSE 3002

# We define the command to run the application inside the src folder
CMD ["node", "src/app.js"]
