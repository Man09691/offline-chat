const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

app.get('/getip', (req, res) => {
    const interfaces = os.networkInterfaces();
    let ip ='localhost';
    Object.values(interfaces).forEach(iface => {
        iface.forEach(details => {
            if (details.family === 'IPv4' && !details.internal) {
                ip = details.address;
            }
        });
    });
    res.json({ ip: ip, port: 3000 });
});

let users = {};
let seenMessages = new Set(); // ← NEW: tracks message IDs

io.on('connection', (socket) => {
    console.log('A device connected');
    // ← ADD THIS
    io.emit('online count', io.engine.clientsCount);

    // User joins
    socket.on('user joined', (username) => {
    users[socket.id] = username;
    io.emit('user joined', username);
    io.emit('online count', io.engine.clientsCount); // ← change this line
});

    // Message received
    // Message received
    socket.on('chat message', (data) => {

        // Check duplicate
        if (seenMessages.has(data.id)) {
            console.log('Duplicate ignored:', data.id);
            return;
        }

        // Check hop limit
        if (data.hops >= data.maxHops) {
            console.log('Max hops reached — message stopped:', data.id);
            return;
        }

        // Mark as seen
        seenMessages.add(data.id);

        // Increment hop
        data.hops = data.hops + 1;
        console.log(`📨 Message ${data.id} — hop ${data.hops}/${data.maxHops} — relayed by server`);

        // ── NEW: Forward to all EXCEPT the sender ──
        // Sender already has the message, no need to send back
        socket.broadcast.emit('chat message', data);

        // ── NEW: Also tell the sender their message was relayed ──
        socket.emit('message relayed', { id: data.id, hops: data.hops });
    });

    //file sharing 
    socket.on('file message', (data) => {
        if(seenMessages.has(data.id)) {
            console.log('Duplicate file ignored:', data.id);
            return;
        }
        if(data.hops >= data.maxHops) { 
            console.log('Max hops reached — file stopped:', data.id);
            return;
        }
        seenMessages.add(data.id);
        data.hops = data.hops + 1;
        console.log(`📁 File ${data.fileName} — hop ${data.hops}/${data.maxHops}`);
        socket.broadcast.emit('file message', data);
        socket.emit('file relayed', { id: data.id, hops: data.hops });
    });

    // Typing
    socket.on('typing', (username) => {
        socket.broadcast.emit('typing', username);
    });

    socket.on('stop typing', () => {
        socket.broadcast.emit('stop typing');
    });

    // Disconnect
    socket.on('disconnect', () => {
        const username = users[socket.id];
        if (username) {
            delete users[socket.id];
            io.emit('user left', username);
        }
        io.emit('online count', io.engine.clientsCount);
    });
});

// Show IP
const interfaces = os.networkInterfaces();
console.log('\n============================');
console.log('🚀 Server is running!');
console.log('============================');
Object.values(interfaces).forEach(iface => {
    iface.forEach(details => {
        if (details.family === 'IPv4' && !details.internal) {
            console.log(`📱 Open this on other device:`);
            console.log(`   http://${details.address}:3000`);
        }
    });
});
console.log('============================\n');

server.listen(3000);