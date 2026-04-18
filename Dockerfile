FROM node:18-slim
WORKDIR /app
COPY package_clean.json package.json
RUN npm install
COPY server_clean.js server.js
EXPOSE 8080
CMD ["npm", "start"]
