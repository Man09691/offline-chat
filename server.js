const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// Store connected users
let users = {};

io.on('connection', (socket) => {
    console.log('A device connected');

    // User joins
    socket.on('user joined', (username) => {
        users[socket.id] = username;
        io.emit('user joined', username);
        io.emit('online count', Object.keys(users).length);
    });

    // Message received
    socket.on('chat message', (data) => {
        io.emit('chat message', data);
    });

    // Typing indicator
    socket.on('typing', (username) => {
        socket.broadcast.emit('typing', username);
    });

    socket.on('stop typing', () => {
        socket.broadcast.emit('stop typing');
    });

    // User disconnects
    socket.on('disconnect', () => {
        const username = users[socket.id];
        if (username) {
            delete users[socket.id];
            io.emit('user left', username);
            io.emit('online count', Object.keys(users).length);
        }
    });
});

// Show IP in terminal
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