FROM node:18-slim
WORKDIR /app
RUN npm init -y && npm install express socket.io
COPY server.js .
EXPOSE 8080
CMD ["node", "server.js"]
