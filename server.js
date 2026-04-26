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
const io = new Server(server, {
    maxHttpBufferSize: 10 * 1024 * 1024  // 10MB
});

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
let rooms = {};
let seenMessages = new Map(); // id → timestamp
let publicKeys = {};

io.on('connection', (socket) => {
    console.log('A device connected');
    // send each socket their own room count
    Object.keys(users).forEach(socketId => {
        const uname = users[socketId];
        const uroom = rooms[uname] || 'general';
        const count = Object.values(rooms).filter(r => r === uroom).length;
        io.to(socketId).emit('online count', count);
    });

    socket.on('user joined', (data) => {
        const name = typeof data === 'string' ? data : data.username;
        const room = typeof data === 'object' ? data.room : 'general';
        users[socket.id] = name;
        rooms[name] = room;
        const joinRoom = rooms[name] || 'general';
        Object.keys(users).forEach(socketId => {
            const uroom = rooms[users[socketId]] || 'general';
            if (uroom === joinRoom) {
                io.to(socketId).emit('user joined', name);
            }
        });
        // send each socket their own room count
        Object.keys(users).forEach(socketId => {
            const uname = users[socketId];
            const uroom = rooms[uname] || 'general';
            const count = Object.values(rooms).filter(r => r === uroom).length;
            io.to(socketId).emit('online count', count);
        });
        // send each socket only users in their room
        Object.keys(users).forEach(socketId => {
            const uname = users[socketId];
            const uroom = rooms[uname] || 'general';
            const roomUsers = Object.keys(users)
                .filter(id => (rooms[users[id]] || 'general') === uroom)
                .map(id => users[id]);
            io.to(socketId).emit('user list', roomUsers);
        });
    });

    socket.on('share public key', (data) => {
        publicKeys[data.username] = data.publicKey;
        console.log(`🔑 Public key received from ${data.username}`);
        // Only share key with users in same room
        const keyRoom = rooms[data.username] || 'general';
        Object.keys(users).forEach(socketId => {
            const uroom = rooms[users[socketId]] || 'general';
            if (uroom === keyRoom) {
                io.to(socketId).emit('public key shared', data);
            }
        });
        const myRoom = rooms[data.username] || 'general';
        const roomKeys = {};
        Object.keys(publicKeys).forEach(uname => {
            if ((rooms[uname] || 'general') === myRoom && uname !== data.username) {
                roomKeys[uname] = publicKeys[uname];
            }
        });
        socket.emit('all public keys', roomKeys);
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
        if (data.hops >= data.maxHops) {
            console.log('Max hops reached — message stopped:', data.id);
            return;
        }
        // Drop message if sender has no room assigned yet
        if (!rooms[data.username]) {
            console.log('No room for sender — message dropped:', data.username);
            return;
        }
        console.log(`📨 Message ${data.id} — hop ${data.hops}/${data.maxHops}`);
        // Only send to users in the same room
        // Only send to users in the same room
        Object.keys(users).forEach(socketId => {
            if (socketId !== socket.id) {
                const recipientRoom = rooms[users[socketId]] || 'general';
                const senderRoom = rooms[data.username] || 'general';
                const isDMForThisUser = data.to && users[socketId] === data.to;
                const sameRoom = !data.to && recipientRoom === senderRoom;
                if (sameRoom || isDMForThisUser) {
                    io.to(socketId).emit('chat message', data);
                }
            }
        });
        // tell sender how many others are online
        const senderRoom = rooms[data.username] || 'general';
        const roomCount = Object.values(rooms).filter(r => r === senderRoom).length - 1;
        socket.emit('peer count', { id: data.id, count: roomCount });
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
            const leftRoom = rooms[username] || 'general';
            delete users[socket.id];
            delete rooms[username];
            delete publicKeys[username];
            Object.keys(users).forEach(socketId => {
                const uroom = rooms[users[socketId]] || 'general';
                if (uroom === leftRoom) {
                    io.to(socketId).emit('user left', username);
                }
            });
            // send each socket only users in their room
        Object.keys(users).forEach(socketId => {
            const uname = users[socketId];
            const uroom = rooms[uname] || 'general';
            const roomUsers = Object.keys(users)
                .filter(id => (rooms[users[id]] || 'general') === uroom)
                .map(id => users[id]);
            io.to(socketId).emit('user list', roomUsers);
        });
        }
        // send each socket their own room count
        Object.keys(users).forEach(socketId => {
            const uname = users[socketId];
            const uroom = rooms[uname] || 'general';
            const count = Object.values(rooms).filter(r => r === uroom).length;
            io.to(socketId).emit('online count', count);
        });
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