const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 3000;
const MAX_HISTORY = 100;

// In-memory message history
let messageHistory = [];
let onlineUsers = {};

// Serve static files from parent (for dev)
app.use(express.static(__dirname + '/..'));

app.get('/health', (req, res) => {
    res.json({ status: 'ok', online: Object.keys(onlineUsers).length });
});

io.on('connection', (socket) => {
    console.log(`[connect] ${socket.id}`);

    // --- Join Chat ---
    socket.on('join', (userData) => {
        const { nickname, avatar, country } = userData;
        socket.nickname = nickname || 'Anonymous';
        socket.avatar = avatar || '?';
        socket.country = country || '未知';

        // Store user
        onlineUsers[socket.id] = {
            id: socket.id,
            nickname: socket.nickname,
            avatar: socket.avatar,
            country: socket.country,
            onlineAt: Date.now()
        };

        // Send history to the new user
        socket.emit('history', messageHistory);

        // Broadcast updated user list
        io.emit('users', Object.values(onlineUsers));

        // System message
        const sysMsg = {
            type: 'system',
            text: `${socket.nickname} 加入了聊天室 🌍`,
            time: Date.now()
        };
        messageHistory.push(sysMsg);
        if (messageHistory.length > MAX_HISTORY) messageHistory.shift();
        io.emit('message', sysMsg);

        console.log(`[join] ${socket.nickname} (${socket.country})`);
    });

    // --- Send Message ---
    socket.on('message', (text) => {
        if (!text || !text.trim()) return;
        const msg = {
            type: 'user',
            id: socket.id,
            nickname: socket.nickname,
            avatar: socket.avatar,
            country: socket.country,
            text: text.trim(),
            time: Date.now()
        };
        messageHistory.push(msg);
        if (messageHistory.length > MAX_HISTORY) messageHistory.shift();
        io.emit('message', msg);
    });

    // --- Private Message ---
    socket.on('private_message', ({ to, text }) => {
        if (!text || !text.trim() || !to) return;
        const msg = {
            type: 'private',
            from: socket.id,
            to: to,
            nickname: socket.nickname,
            avatar: socket.avatar,
            text: text.trim(),
            time: Date.now()
        };
        // Send to both sender and receiver
        io.to(to).emit('private_message', msg);
        socket.emit('private_message', msg);
    });

    // --- Typing ---
    socket.on('typing', (isTyping) => {
        socket.broadcast.emit('typing', {
            id: socket.id,
            nickname: socket.nickname,
            typing: isTyping
        });
    });

    // --- Disconnect ---
    socket.on('disconnect', () => {
        const nickname = socket.nickname || 'Someone';
        delete onlineUsers[socket.id];

        io.emit('users', Object.values(onlineUsers));

        if (socket.nickname) {
            const sysMsg = {
                type: 'system',
                text: `${nickname} 离开了聊天室 👋`,
                time: Date.now()
            };
            messageHistory.push(sysMsg);
            if (messageHistory.length > MAX_HISTORY) messageHistory.shift();
            io.emit('message', sysMsg);
        }

        console.log(`[disconnect] ${nickname}`);
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`✦ VOID.NEXUS Chat Server running on port ${PORT}`);
});
