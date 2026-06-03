const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 3000;
const MAX_ROOM_HISTORY = 100;
const SERVER_VERSION = '2.0.0'; // friend system + private chat

// Data stores
let roomHistory = [];
let users = {};             // userId -> user object
let socketToUser = {};      // socketId -> userId
let friends = {};           // userId -> [userId, ...]
let pendingRequests = {};   // userId -> [{fromUserId, fromNickname}, ...]
let privateMessages = {};   // "userA_userB" -> [msg, ...]

app.use(express.static(__dirname + '/..'));

app.get('/health', (req, res) => {
    res.json({ status: 'ok', online: Object.keys(socketToUser).length, users: Object.keys(users).length, version: SERVER_VERSION });
});

function getConversationKey(a, b) {
    return [a, b].sort().join('_');
}

function addPrivateMsg(fromId, toId, text) {
    const key = getConversationKey(fromId, toId);
    if (!privateMessages[key]) privateMessages[key] = [];
    const msg = {
        from: fromId,
        text: text,
        time: Date.now()
    };
    privateMessages[key].push(msg);
    if (privateMessages[key].length > 100) privateMessages[key].shift();
    return msg;
}

function getUser(userId) {
    return users[userId] || null;
}

function getOnlineUserList() {
    return Object.values(users).filter(u => u.online).map(u => ({
        userId: u.userId,
        nickname: u.nickname,
        country: u.country,
        avatar: u.avatar
    }));
}

io.on('connection', (socket) => {
    console.log(`[connect] ${socket.id}`);

    // ─── JOIN ───
    socket.on('join', (userData) => {
        const { userId, nickname, avatar, country, friendNicknames } = userData;
        if (!userId) return;

        // If user already exists (reconnect), keep their friends
        const existingUser = users[userId];
        const existingFriends = existingUser ? (friends[userId] || []) : [];

        users[userId] = {
            userId, nickname: nickname || 'Anonymous',
            avatar: avatar || '?', country: country || '🌍 未知',
            online: true, socketId: socket.id
        };
        socketToUser[socket.id] = userId;
        friends[userId] = existingFriends;
        if (!pendingRequests[userId]) pendingRequests[userId] = [];

        socket.userId = userId;
        socket.nickname = nickname;

        // Send room history
        socket.emit('history', roomHistory);

        // Send user their friends list
        const friendList = getFriendList(userId);
        socket.emit('friends_list', friendList);

        // Send pending friend requests
        socket.emit('friend_requests', pendingRequests[userId] || []);

        // Broadcast online users
        io.emit('users', getOnlineUserList());

        // Room join system message
        const sysMsg = {
            type: 'system',
            text: `${nickname} 加入了聊天室 🌍`,
            time: Date.now()
        };
        roomHistory.push(sysMsg);
        if (roomHistory.length > MAX_ROOM_HISTORY) roomHistory.shift();
        io.emit('message', sysMsg);

        console.log(`[join] ${nickname} (${country}) [${userId.slice(0,6)}] friends:${friendList.length}`);
    });

    // ─── ROOM MESSAGE ───
    socket.on('message', (text) => {
        const user = users[socketToUser[socket.id]];
        if (!user || !text || !text.trim()) return;
        const msg = {
            type: 'user', userId: user.userId,
            nickname: user.nickname, avatar: user.avatar,
            country: user.country, text: text.trim(), time: Date.now()
        };
        roomHistory.push(msg);
        if (roomHistory.length > MAX_ROOM_HISTORY) roomHistory.shift();
        io.emit('message', msg);
    });

    // ─── FRIEND REQUEST ───
    socket.on('friend_request', ({ toUserId }) => {
        const fromUser = users[socketToUser[socket.id]];
        const toUser = users[toUserId];
        if (!fromUser || !toUser || fromUser.userId === toUserId) return;

        // Check if already friends
        if (friends[fromUser.userId] && friends[fromUser.userId].includes(toUserId)) {
            socket.emit('friend_error', { toUserId, msg: '已经是好友了' });
            return;
        }
        // Check if already requested
        if (pendingRequests[toUserId] && pendingRequests[toUserId].some(r => r.fromUserId === fromUser.userId)) {
            socket.emit('friend_error', { toUserId, msg: '已经发送过好友请求' });
            return;
        }

        // Add to pending
        const request = {
            fromUserId: fromUser.userId,
            fromNickname: fromUser.nickname,
            fromCountry: fromUser.country
        };
        if (!pendingRequests[toUserId]) pendingRequests[toUserId] = [];
        pendingRequests[toUserId].push(request);

        // Notify recipient (if online)
        if (toUser.online) {
            io.to(toUser.socketId).emit('friend_request_received', request);
        }

        socket.emit('friend_request_sent', { toUserId, toNickname: toUser.nickname });
        console.log(`[friend_req] ${fromUser.nickname} -> ${toUser.nickname}`);
    });

    // ─── FRIEND ACCEPT ───
    socket.on('friend_accept', ({ fromUserId }) => {
        const user = users[socketToUser[socket.id]];
        const fromUser = users[fromUserId];
        if (!user || !fromUser) return;

        // Remove from pending
        if (pendingRequests[user.userId]) {
            pendingRequests[user.userId] = pendingRequests[user.userId]
                .filter(r => r.fromUserId !== fromUserId);
        }

        // Add to both friends lists
        if (!friends[user.userId]) friends[user.userId] = [];
        if (!friends[fromUserId]) friends[fromUserId] = [];
        if (!friends[user.userId].includes(fromUserId)) friends[user.userId].push(fromUserId);
        if (!friends[fromUserId].includes(user.userId)) friends[fromUserId].push(user.userId);

        // Notify both
        socket.emit('friend_added', { friendUserId: fromUserId, friendNickname: fromUser.nickname });
        if (fromUser.online) {
            io.to(fromUser.socketId).emit('friend_added', { friendUserId: user.userId, friendNickname: user.nickname });
        }

        // Update both friends lists
        socket.emit('friends_list', getFriendList(user.userId));
        if (fromUser.online) {
            io.to(fromUser.socketId).emit('friends_list', getFriendList(fromUserId));
        }

        console.log(`[friend_accept] ${user.nickname} + ${fromUser.nickname}`);
    });

    // ─── FRIEND REJECT ───
    socket.on('friend_reject', ({ fromUserId }) => {
        const user = users[socketToUser[socket.id]];
        if (!user) return;
        if (pendingRequests[user.userId]) {
            pendingRequests[user.userId] = pendingRequests[user.userId]
                .filter(r => r.fromUserId !== fromUserId);
        }
        socket.emit('friend_requests', pendingRequests[user.userId] || []);
    });

    // ─── FRIEND REMOVE ───
    socket.on('friend_remove', ({ friendUserId }) => {
        const user = users[socketToUser[socket.id]];
        if (!user) return;
        if (friends[user.userId]) {
            friends[user.userId] = friends[user.userId].filter(id => id !== friendUserId);
        }
        if (friends[friendUserId]) {
            friends[friendUserId] = friends[friendUserId].filter(id => id !== user.userId);
        }
        socket.emit('friends_list', getFriendList(user.userId));
        socket.emit('friend_removed', { friendUserId });
        const friendUser = users[friendUserId];
        if (friendUser && friendUser.online) {
            io.to(friendUser.socketId).emit('friends_list', getFriendList(friendUserId));
        }
    });

    // ─── FRIEND REQUEST BY NICKNAME ───
    socket.on('friend_request_by_nickname', ({ nickname }) => {
        const fromUser = users[socketToUser[socket.id]];
        if (!fromUser || !nickname) return;

        // Find user by nickname (case-insensitive, online only)
        const target = Object.values(users).find(u =>
            u.online && u.nickname.toLowerCase() === nickname.toLowerCase() &&
            u.userId !== fromUser.userId
        );

        if (target) {
            socket.emit('friend_request_by_nickname_result', {
                found: true, userId: target.userId, nickname: target.nickname
            });
        } else {
            socket.emit('friend_request_by_nickname_result', {
                found: false, nickname
            });
        }
    });

    // ─── PRIVATE CHAT HISTORY ───
    socket.on('private_history', ({ withUserId }) => {
        const user = users[socketToUser[socket.id]];
        if (!user) return;
        const key = getConversationKey(user.userId, withUserId);
        socket.emit('private_history', {
            withUserId,
            messages: privateMessages[key] || []
        });
    });

    // ─── PRIVATE MESSAGE ───
    socket.on('private_message', ({ toUserId, text }) => {
        const fromUser = users[socketToUser[socket.id]];
        const toUser = users[toUserId];
        if (!fromUser || !toUser || !text || !text.trim()) return;

        const msg = addPrivateMsg(fromUser.userId, toUserId, text.trim());

        // Send to recipient
        if (toUser.online) {
            io.to(toUser.socketId).emit('private_message', {
                fromUserId: fromUser.userId,
                fromNickname: fromUser.nickname,
                text: text.trim(),
                time: msg.time
            });
        }
        // Send to sender
        socket.emit('private_message', {
            fromUserId: fromUser.userId,
            fromNickname: fromUser.nickname,
            text: text.trim(),
            time: msg.time,
            toUserId: toUserId
        });
    });

    // ─── PRIVATE TYPING ───
    socket.on('private_typing', ({ toUserId, typing }) => {
        const fromUser = users[socketToUser[socket.id]];
        const toUser = users[toUserId];
        if (!fromUser || !toUser) return;
        if (toUser.online) {
            io.to(toUser.socketId).emit('private_typing', {
                fromUserId: fromUser.userId,
                nickname: fromUser.nickname,
                typing
            });
        }
    });

    // ─── DISCONNECT ───
    socket.on('disconnect', () => {
        const userId = socketToUser[socket.id];
        if (userId && users[userId]) {
            users[userId].online = false;
            if (users[userId].nickname) {
                const sysMsg = {
                    type: 'system',
                    text: `${users[userId].nickname} 离开了聊天室 👋`,
                    time: Date.now()
                };
                roomHistory.push(sysMsg);
                if (roomHistory.length > MAX_ROOM_HISTORY) roomHistory.shift();
                io.emit('message', sysMsg);
            }
        }
        delete socketToUser[socket.id];
        io.emit('users', getOnlineUserList());
    });
});

function getFriendList(userId) {
    const friendIds = friends[userId] || [];
    return friendIds.map(id => {
        const u = users[id];
        return u ? {
            userId: u.userId, nickname: u.nickname,
            country: u.country, avatar: u.avatar, online: u.online
        } : { userId: id, nickname: '(已离线)', online: false };
    }).filter(f => f.nickname !== '(已离线)');
}

server.listen(PORT, '0.0.0.0', () => {
    console.log(`✦ VOID.NEXUS Chat Server running on port ${PORT}`);
});
