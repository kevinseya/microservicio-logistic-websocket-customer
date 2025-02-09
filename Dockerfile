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

# We expose the port on which the application will run
EXPOSE 5002

# We define the command to run the application inside the src folder
CMD ["node", "src/app.js"]
