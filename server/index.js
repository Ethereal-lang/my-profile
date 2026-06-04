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
const SERVER_VERSION = '3.0.0';

// Data stores
let roomHistory = [];
let users = {};             // userId -> user object
let socketToUser = {};      // socketId -> userId
let friends = {};           // userId -> [userId, ...]
let pendingRequests = {};   // userId -> [{fromUserId, fromNickname}, ...]
let privateMessages = {};   // "userA_userB" -> [msg, ...]
let userInterests = {};     // userId -> [interest, ...]
let matchRequests = {};     // userId -> [{fromUserId, interest}, ...]

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
    const msg = { from: fromId, text, time: Date.now() };
    privateMessages[key].push(msg);
    if (privateMessages[key].length > 100) privateMessages[key].shift();
    return msg;
}

function getOnlineUserList() {
    return Object.values(users).filter(u => u.online).map(u => ({
        userId: u.userId, nickname: u.nickname,
        country: u.country, avatar: u.avatar,
        region: u.region || 'international',
        chatMode: u.chatMode || 'international'
    }));
}

function getFilteredUserList(region, chatMode) {
    let all = Object.values(users).filter(u => u.online);
    if (chatMode === 'domestic') {
        all = all.filter(u => u.region === region);
    }
    return all.map(u => ({
        userId: u.userId, nickname: u.nickname,
        country: u.country, avatar: u.avatar,
        region: u.region || 'international'
    }));
}

io.on('connection', (socket) => {
    console.log(`[connect] ${socket.id}`);

    // ─── JOIN ───
    socket.on('join', (userData) => {
        const { userId, nickname, avatar, country, region, chatMode } = userData;
        if (!userId) return;

        const existingUser = users[userId];
        const existingFriends = existingUser ? (friends[userId] || []) : [];

        users[userId] = {
            userId, nickname: nickname || 'Anonymous',
            avatar: avatar || '?', country: country || '🌍 未知',
            region: region || 'international',
            chatMode: chatMode || 'international',
            online: true, socketId: socket.id
        };
        socketToUser[socket.id] = userId;
        friends[userId] = existingFriends;
        if (!pendingRequests[userId]) pendingRequests[userId] = [];

        socket.userId = userId;
        socket.nickname = nickname;

        socket.emit('history', roomHistory);
        const friendList = getFriendList(userId);
        socket.emit('friends_list', friendList);
        socket.emit('friend_requests', pendingRequests[userId] || []);
        socket.emit('room_users', getFilteredUserList(users[userId].region, users[userId].chatMode));
        io.emit('users', getOnlineUserList());

        const sysMsg = {
            type: 'system',
            text: `${nickname} 加入了聊天室 [${region === 'china' ? '🇨🇳' : '🌍'}${region === 'china' ? '国内' : '国际'}]`,
            time: Date.now()
        };
        roomHistory.push(sysMsg);
        if (roomHistory.length > MAX_ROOM_HISTORY) roomHistory.shift();
        io.emit('message', sysMsg);

        console.log(`[join] ${nickname} [${region}] mode:${chatMode}`);
    });

    // ─── SET CHAT MODE ───
    socket.on('set_chat_mode', ({ chatMode }) => {
        const user = users[socketToUser[socket.id]];
        if (!user) return;
        user.chatMode = chatMode;
        socket.emit('room_users', getFilteredUserList(user.region, chatMode));
        io.emit('users', getOnlineUserList());
        socket.emit('mode_changed', { chatMode });
        console.log(`[mode] ${user.nickname} -> ${chatMode}`);
    });

    // ─── ROOM MESSAGE ───
    socket.on('message', (text) => {
        const user = users[socketToUser[socket.id]];
        if (!user || !text || !text.trim()) return;
        const msg = {
            type: 'user', userId: user.userId,
            nickname: user.nickname, avatar: user.avatar,
            country: user.country, region: user.region,
            text: text.trim(), time: Date.now()
        };
        roomHistory.push(msg);
        if (roomHistory.length > MAX_ROOM_HISTORY) roomHistory.shift();
        // Send to all, but frontend will filter based on mode
        io.emit('message', msg);
    });

    // ─── FRIEND REQUEST ───
    socket.on('friend_request', ({ toUserId }) => {
        const fromUser = users[socketToUser[socket.id]];
        const toUser = users[toUserId];
        if (!fromUser || !toUser || fromUser.userId === toUserId) return;

        if (friends[fromUser.userId] && friends[fromUser.userId].includes(toUserId)) {
            socket.emit('friend_error', { toUserId, msg: '已经是好友了' });
            return;
        }
        if (pendingRequests[toUserId] && pendingRequests[toUserId].some(r => r.fromUserId === fromUser.userId)) {
            socket.emit('friend_error', { toUserId, msg: '已经发送过好友请求' });
            return;
        }

        const request = {
            fromUserId: fromUser.userId,
            fromNickname: fromUser.nickname,
            fromCountry: fromUser.country,
            fromRegion: fromUser.region
        };
        if (!pendingRequests[toUserId]) pendingRequests[toUserId] = [];
        pendingRequests[toUserId].push(request);

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

        if (pendingRequests[user.userId]) {
            pendingRequests[user.userId] = pendingRequests[user.userId]
                .filter(r => r.fromUserId !== fromUserId);
        }

        if (!friends[user.userId]) friends[user.userId] = [];
        if (!friends[fromUserId]) friends[fromUserId] = [];
        if (!friends[user.userId].includes(fromUserId)) friends[user.userId].push(fromUserId);
        if (!friends[fromUserId].includes(user.userId)) friends[fromUserId].push(user.userId);

        socket.emit('friend_added', { friendUserId: fromUserId, friendNickname: fromUser.nickname });
        if (fromUser.online) {
            io.to(fromUser.socketId).emit('friend_added', { friendUserId: user.userId, friendNickname: user.nickname });
        }
        socket.emit('friends_list', getFriendList(user.userId));
        if (fromUser.online) {
            io.to(fromUser.socketId).emit('friends_list', getFriendList(fromUserId));
        }
        console.log(`[friend_accept] ${user.nickname} + ${fromUser.nickname}`);
    });

    // ─── FRIEND REJECT / REMOVE ───
    socket.on('friend_reject', ({ fromUserId }) => {
        const user = users[socketToUser[socket.id]];
        if (!user) return;
        if (pendingRequests[user.userId]) {
            pendingRequests[user.userId] = pendingRequests[user.userId]
                .filter(r => r.fromUserId !== fromUserId);
        }
        socket.emit('friend_requests', pendingRequests[user.userId] || []);
    });

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
        const target = Object.values(users).find(u =>
            u.online && u.nickname.toLowerCase() === nickname.toLowerCase() &&
            u.userId !== fromUser.userId
        );
        if (target) {
            socket.emit('friend_request_by_nickname_result', {
                found: true, userId: target.userId, nickname: target.nickname
            });
        } else {
            socket.emit('friend_request_by_nickname_result', { found: false, nickname });
        }
    });

    // ─── MATCH / INTERESTS ───
    socket.on('set_interests', (interests) => {
        const user = users[socketToUser[socket.id]];
        if (!user) return;
        userInterests[user.userId] = interests || [];
    });

    socket.on('get_matches', ({ interest }) => {
        const user = users[socketToUser[socket.id]];
        if (!user) return;
        let matches = Object.entries(userInterests)
            .filter(([uid, interests]) =>
                interests.includes(interest) && uid !== user.userId && users[uid]?.online
            )
            .map(([uid]) => ({
                userId: uid,
                nickname: users[uid].nickname,
                country: users[uid].country,
                region: users[uid].region || 'international'
            }));
        // Filter by chat mode
        if (user.chatMode === 'domestic') {
            matches = matches.filter(m => m.region === user.region);
        }
        socket.emit('matches', { interest, users: matches });
    });

    socket.on('match_request', ({ toUserId, interest }) => {
        const fromUser = users[socketToUser[socket.id]];
        const toUser = users[toUserId];
        if (!fromUser || !toUser) return;
        if (!matchRequests[toUserId]) matchRequests[toUserId] = [];
        matchRequests[toUserId].push({ fromUserId: fromUser.userId, fromNickname: fromUser.nickname, interest });
        if (toUser.online) {
            io.to(toUser.socketId).emit('match_request_received', {
                fromUserId: fromUser.userId, fromNickname: fromUser.nickname, interest
            });
        }
        socket.emit('match_request_sent', { toUserId, interest });
    });

    socket.on('match_accept', ({ fromUserId }) => {
        const user = users[socketToUser[socket.id]];
        const fromUser = users[fromUserId];
        if (!user || !fromUser) return;
        if (matchRequests[user.userId]) {
            matchRequests[user.userId] = matchRequests[user.userId]
                .filter(r => r.fromUserId !== fromUserId);
        }
        if (!friends[user.userId]) friends[user.userId] = [];
        if (!friends[fromUserId]) friends[fromUserId] = [];
        if (!friends[user.userId].includes(fromUserId)) friends[user.userId].push(fromUserId);
        if (!friends[fromUserId].includes(user.userId)) friends[fromUserId].push(user.userId);
        socket.emit('match_accepted', { friendUserId: fromUserId, friendNickname: fromUser.nickname });
        socket.emit('friend_added', { friendUserId: fromUserId, friendNickname: fromUser.nickname });
        socket.emit('friends_list', getFriendList(user.userId));
        if (fromUser.online) {
            io.to(fromUser.socketId).emit('match_accepted', { friendUserId: user.userId, friendNickname: user.nickname });
            io.to(fromUser.socketId).emit('friend_added', { friendUserId: user.userId, friendNickname: user.nickname });
            io.to(fromUser.socketId).emit('friends_list', getFriendList(fromUserId));
        }
    });

    socket.on('match_reject', ({ fromUserId }) => {
        const user = users[socketToUser[socket.id]];
        if (!user || !matchRequests[user.userId]) return;
        matchRequests[user.userId] = matchRequests[user.userId].filter(r => r.fromUserId !== fromUserId);
    });

    // ─── PRIVATE CHAT ───
    socket.on('private_history', ({ withUserId }) => {
        const user = users[socketToUser[socket.id]];
        if (!user) return;
        const key = getConversationKey(user.userId, withUserId);
        socket.emit('private_history', { withUserId, messages: privateMessages[key] || [] });
    });

    socket.on('private_message', ({ toUserId, text }) => {
        const fromUser = users[socketToUser[socket.id]];
        const toUser = users[toUserId];
        if (!fromUser || !toUser || !text || !text.trim()) return;
        const msg = addPrivateMsg(fromUser.userId, toUserId, text.trim());
        if (toUser.online) {
            io.to(toUser.socketId).emit('private_message', {
                fromUserId: fromUser.userId, fromNickname: fromUser.nickname, text: text.trim(), time: msg.time
            });
        }
        socket.emit('private_message', {
            fromUserId: fromUser.userId, fromNickname: fromUser.nickname, text: text.trim(), time: msg.time, toUserId
        });
    });

    socket.on('private_typing', ({ toUserId, typing }) => {
        const fromUser = users[socketToUser[socket.id]];
        const toUser = users[toUserId];
        if (!fromUser || !toUser) return;
        if (toUser.online) {
            io.to(toUser.socketId).emit('private_typing', {
                fromUserId: fromUser.userId, nickname: fromUser.nickname, typing
            });
        }
    });

    // ─── DISCONNECT ───
    socket.on('disconnect', () => {
        const userId = socketToUser[socket.id];
        if (userId && users[userId]) {
            users[userId].online = false;
            delete userInterests[userId];
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
            country: u.country, avatar: u.avatar,
            online: u.online, region: u.region || 'international'
        } : { userId: id, nickname: '(已离线)', online: false };
    }).filter(f => f.nickname !== '(已离线)');
}

server.listen(PORT, '0.0.0.0', () => {
    console.log(`✦ VOID.NEXUS Server v${SERVER_VERSION} running on port ${PORT}`);
});
