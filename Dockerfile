# Usamos la imagen oficial de Node.js desde Docker Hub
FROM node:20

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiamos los archivos package.json y package-lock.json (si está disponible)
COPY package*.json ./

# Instalamos las dependencias del proyecto
RUN npm install

# Copiamos el resto de los archivos de la aplicación
COPY . .

# Exponemos el puerto en el que la aplicación va a correr
EXPOSE 5002

# Definimos el comando para ejecutar la aplicación dentro de la carpeta src
CMD ["node", "src/app.js"]
