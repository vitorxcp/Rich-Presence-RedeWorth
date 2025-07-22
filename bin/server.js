const { dialog } = require('electron');
const http = require('http');
const { URL } = require('url');
const fetch = require('node-fetch');
const EventEmitter = require('events');
const { db } = require('./plugins/dataDB');

const authEvents = new EventEmitter();
module.exports = authEvents;

const CLIENT_ID = '1313170068997275648';
const CLIENT_SECRET = 'XxdAE9-2yo5yQOJMLxsFHgfJfzTSwmW-';
const REDIRECT_URI = 'http://localhost:7847/callback';
let ports = [7847, 2345, 2142, 6785, 25345, 6754, 1244, 7869, 2341, 7856]
const PORT = 7847;

async function exchangeCodeForToken(code) {
    const data = new URLSearchParams();
    data.append('client_id', CLIENT_ID);
    data.append('client_secret', CLIENT_SECRET);
    data.append('grant_type', 'authorization_code');
    data.append('code', code);
    data.append('redirect_uri', REDIRECT_URI);
    data.append('scope', 'identify email');

    const response = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        body: data,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    return await response.json();
}

async function getUserData(access_token) {
    const res = await fetch('https://discord.com/api/users/@me', {
        headers: {
            Authorization: `Bearer ${access_token}`
        }
    });

    return await res.json();
}

const server = http.createServer(async (req, res) => {
    if (req.url.startsWith('/callback')) {
        const url = new URL(req.url, `http://localhost:${PORT}`);
        const code = url.searchParams.get('code');

        if (!code) {
            res.writeHead(400);
            return res.end('Código de autorização não encontrado.');
        }

        try {
            const tokenData = await exchangeCodeForToken(code);
            const userData = await getUserData(tokenData.access_token);

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`<h2>Bem-vindo, ${userData.username}!</h2><p>Você pode fechar esta janela.</p>`);

            authEvents.emit('authenticated', tokenData.access_token, userData);
        } catch (err) {
            console.error('Erro:', err);
            if (!res.headersSent) {
                res.writeHead(500);
                res.end('Erro interno do servidor.');
            }
        }
    } else if (req.url.startsWith('/api/user')) {
        const url = new URL(req.url, `http://localhost:${PORT}`);
        const code = db.get("tokenUser");

        if (!code) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Código de autorização não encontrado." }));
        }

        try {
            const userData = await getUserData(code);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(userData));
        } catch (err) {
            if (!res.headersSent) {
                res.writeHead(500);
                res.end('Erro interno do servidor.');
            }
        }
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
})
server.listen(PORT, () => {
    console.log(`Servidor de callback rodando em http://localhost:${PORT}/callback`);
})

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`A porta ${PORT} já está em uso.`);
        dialog.showErrorBox('Erro ao iniciar o servidor', `A porta ${PORT} já está em uso. Feche outras instâncias do programa.`);
    } else {
        console.error('Erro desconhecido ao iniciar o servidor:', err);
    }
});