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
let seenMessages = new Map(); // id → timestamp
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

    // ── READ RECEIPTS ──
    socket.on('message delivered', (data) => {
        // data = { messageId, deliveredTo }
        // Tell the original sender their message was delivered
        // Find which socket is the sender
        const senderSocketId = Object.keys(users).find(
            id => users[id] === data.sentBy
        );
        if (senderSocketId) {
            io.to(senderSocketId).emit('delivery confirmed', {
                messageId: data.messageId
            });
        }
    });

    // ── SEEN CONFIRMED → blue double tick ──
    // ── SEEN CONFIRMED → blue double tick ──
// ── SEEN CONFIRMED → relay to sender's socket ──
    socket.on('message seen confirmed', (data) => {
        const senderSocketId = Object.keys(users).find(
            id => users[id] === data.sentBy
        );
        if (senderSocketId) {
            io.to(senderSocketId).emit('message seen confirmed', {
                messageId: data.messageId
            });
        }
    });

    socket.on('reaction', (data) => {
    io.emit('reaction', data);
});

    socket.on('chat message', (data) => {
        // For encrypted targeted messages — use id+to as unique key
        const dedupKey = data.to ? `${data.id}_${data.to}` : data.id;

        if (seenMessages.has(dedupKey)) {
            console.log('Duplicate ignored:', dedupKey);
            return;
        }
        // auto-delete after 5 minutes
        setTimeout(() => seenMessages.delete(dedupKey), 5 * 60 * 1000);
        if (data.hops >= data.maxHops) {
            console.log('Max hops reached — message stopped:', data.id);
            return;
        }
        seenMessages.set(dedupKey, Date.now());
        data.hops = data.hops + 1;
        console.log(`📨 Message ${data.id} — hop ${data.hops}/${data.maxHops}`);
        socket.broadcast.emit('chat message', data);
        // tell sender how many others are online
        socket.emit('peer count', { id: data.id, count: io.engine.clientsCount - 1 });
        socket.emit('message relayed', { id: data.id, hops: data.hops });
        socket.emit('message seen', {
            messageId: data.id,
            sentBy: data.username
        });
        console.log('👁️ Emitted seen for:', data.id, 'sentBy:', data.username);
    });

    socket.on('file message', (data) => {
        if (seenMessages.has(data.id)) {
            console.log('Duplicate file ignored:', data.id);
            return;
        }
        setTimeout(() => seenMessages.delete(data.id), 5 * 60 * 1000);
        if (data.hops >= data.maxHops) {
            console.log('Max hops reached — file stopped:', data.id);
            return;
        }
        seenMessages.set(data.id, Date.now());
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

    socket.on('message seen', (data) => {
        const senderSocketId = Object.keys(users).find(
            id => users[id] === data.sentBy
        );
        if (senderSocketId) {
            io.to(senderSocketId).emit('message seen confirmed', {
                messageId: data.messageId
            });
        }
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