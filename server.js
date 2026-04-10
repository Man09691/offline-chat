const express = require('express');
const https = require('https');
const http = require('http');
const { Server } = require('socket.io');
const os = require('os');
const fs = require('fs');

const app = express();

const sslOptions = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

const server = https.createServer(sslOptions, app);
const io = new Server(server);

app.use(express.static('public'));

app.get('/getip', (req, res) => {
    const interfaces = os.networkInterfaces();
    let ip = 'localhost';
    Object.values(interfaces).forEach(iface => {
        iface.forEach(details => {
            if (details.family === 'IPv4' && !details.internal) {
                ip = details.address;
            }
        });
    });
    res.json({ ip: ip, port: 3443 });  // ← changed port
});

let users = {};
let seenMessages = new Set();
let publicKeys = {};

io.on('connection', (socket) => {
    console.log('A device connected');
    io.emit('online count', io.engine.clientsCount);

    socket.on('user joined', (username) => {
        users[socket.id] = username;
        io.emit('user joined', username);
        io.emit('online count', io.engine.clientsCount);
        io.emit('user list', Object.values(users));
    });

    socket.on('share public key', (data) => {
        publicKeys[data.username] = data.publicKey;
        console.log(`🔑 Public key received from ${data.username}`);
        io.emit('public key shared', data);
        socket.emit('all public keys', publicKeys);
    });

    socket.on('reaction', (data) => {
    io.emit('reaction', data);
});

    socket.on('chat message', (data) => {
        if (seenMessages.has(data.id)) {
            console.log('Duplicate ignored:', data.id);
            return;
        }
        if (data.hops >= data.maxHops) {
            console.log('Max hops reached — message stopped:', data.id);
            return;
        }
        seenMessages.add(data.id);
        data.hops = data.hops + 1;
        console.log(`📨 Message ${data.id} — hop ${data.hops}/${data.maxHops}`);
        socket.broadcast.emit('chat message', data);
        socket.emit('message relayed', { id: data.id, hops: data.hops });
    });

    socket.on('file message', (data) => {
        if (seenMessages.has(data.id)) {
            console.log('Duplicate file ignored:', data.id);
            return;
        }
        if (data.hops >= data.maxHops) {
            console.log('Max hops reached — file stopped:', data.id);
            return;
        }
        seenMessages.add(data.id);
        data.hops = data.hops + 1;
        console.log(`📁 File ${data.fileName} — hop ${data.hops}/${data.maxHops}`);
        socket.broadcast.emit('file message', data);
        socket.emit('file relayed', { id: data.id, hops: data.hops });
    });

    socket.on('typing', (username) => {
        socket.broadcast.emit('typing', username);
    });

    socket.on('stop typing', () => {
        socket.broadcast.emit('stop typing');
    });

    socket.on('disconnect', () => {
        const username = users[socket.id];
        if (username) {
            delete users[socket.id];
            delete publicKeys[username];
            io.emit('user left', username);
            io.emit('user list', Object.values(users));
        }
        io.emit('online count', io.engine.clientsCount);
    });
});

const interfaces = os.networkInterfaces();
console.log('\n============================');
console.log('🚀 Server is running!');
console.log('============================');
Object.values(interfaces).forEach(iface => {
    iface.forEach(details => {
        if (details.family === 'IPv4' && !details.internal) {
            console.log(`📱 Open this on other device:`);
            console.log(`   https://${details.address}:3443`);  // ← https + 3443
        }
    });
});
console.log('============================\n');

server.listen(3443);  // ← changed port