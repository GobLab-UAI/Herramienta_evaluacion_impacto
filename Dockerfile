# Usamos una imagen base de Node.js
FROM node:18-alpine

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar el package.json y package-lock.json
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar el resto de los archivos del proyecto
COPY . .

# Compilar la aplicación Next.js
RUN npm run build

# Exponer el puerto en el que Next.js correrá (el puerto por defecto de Next.js es 3000)
EXPOSE 3000

# Comando para correr la aplicación
CMD ["npm", "start"]