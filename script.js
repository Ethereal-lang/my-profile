/**
 * VOID.NEXUS — Main Script
 * Modes: visitor | admin | developer
 */

/* ══════════════════════════════════════════
   MATRIX RAIN
   ══════════════════════════════════════════ */
const canvas = document.getElementById('matrix');
if (canvas) {
    const ctx = canvas.getContext('2d');
    function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>/{}[]|&^%$#@';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);
    function drawMatrix() {
        ctx.fillStyle = 'rgba(10, 10, 15, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00ffc8';
        ctx.font = `${fontSize}px monospace`;
        for (let i = 0; i < drops.length; i++) {
            ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * fontSize, drops[i] * fontSize);
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
    }
    let matrixInterval = setInterval(drawMatrix, 120);
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        clearInterval(matrixInterval);
    } else {
        matrixInterval = setInterval(drawMatrix, 120);
    }
});
}

/* ══════════════════════════════════════════
   TYPEWRITER
   ══════════════════════════════════════════ */
const phrases = [
    '系统提示: 发现一个有趣的人类',
    '>> 正在学习中文... 已完成 98%',
    '$ echo "你好，世界"  # 已连接',
    '📍 当前位置: 地球 SOL-3',
    '/* 在0和1之间寻找诗意 */',
    '>> 跨国交友协议已初始化',
    '$ whoami  # 一个永远在路上的灵魂',
    '> 正在跨越第12个时区...',
];
let phraseIdx = 0, charIdx = 0, isDeleting = false;
const typewriterEl = document.getElementById('typewriter');
function typeEffect() {
    if (!typewriterEl) return;
    const current = phrases[phraseIdx];
    if (!isDeleting) {
        typewriterEl.textContent = current.substring(0, charIdx + 1);
        charIdx++;
        if (charIdx === current.length) setTimeout(() => { isDeleting = true; }, 2000);
    } else {
        typewriterEl.textContent = current.substring(0, charIdx);
        charIdx--;
        if (charIdx === 0) { isDeleting = false; phraseIdx = (phraseIdx + 1) % phrases.length; }
    }
    setTimeout(typeEffect, isDeleting ? 35 : 60);
}
if (typewriterEl) setTimeout(typeEffect, 1500);

/* ══════════════════════════════════════════
   COUNTER ANIMATION
   ══════════════════════════════════════════ */
const counters = document.querySelectorAll('.stat-num');
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.dataset.target);
            animateCounter(el, target);
            counterObserver.unobserve(el);
        }
    });
}, { threshold: 0.5 });
function animateCounter(el, target) {
    let current = 0;
    const step = Math.ceil(target / 60);
    const interval = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(interval); }
        el.textContent = current + '+';
    }, 20);
}
counters.forEach(c => counterObserver.observe(c));

/* ══════════════════════════════════════════
   NAV & SMOOTH SCROLL
   ══════════════════════════════════════════ */
const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('.nav-menu');
if (toggle) {
    toggle.addEventListener('click', () => menu.classList.toggle('active'));
}
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => menu.classList.remove('active'));
});
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            const top = target.getBoundingClientRect().top + window.pageYOffset - 80;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    });
});

/* ══════════════════════════════════════════
   CLOCK & TIMEZONE
   ══════════════════════════════════════════ */
function updateClock() {
    const now = new Date();
    const utc = now.toUTCString().split(' ')[4];
    const clock = document.getElementById('utcClock');
    if (clock) clock.textContent = utc;
}
updateClock();
setInterval(updateClock, 1000);

const tzDisplay = document.getElementById('timezoneDisplay');
if (tzDisplay) {
    const offset = -new Date().getTimezoneOffset() / 60;
    tzDisplay.textContent = `UTC${offset >= 0 ? '+' : ''}${offset}`;
}

/* ══════════════════════════════════════════
   CONTACT FORM
   ══════════════════════════════════════════ */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('.btn-submit');
        btn.textContent = '[ 信号已发送 ✦ ]';
        btn.style.borderColor = '#00ffc8';
        setTimeout(() => { btn.textContent = '[ 发送信号 → ]'; contactForm.reset(); }, 3000);
    });
}

/* ══════════════════════════════════════════════════════════════
   ═══  CONTENT MANAGEMENT SYSTEM  ═══
   ══════════════════════════════════════════════════════════════ */

const ADMIN_PASSWORD = 'admin123';
const STORAGE_KEY = 'void_nexus_content';
const ROLE_KEY = 'void_nexus_role';

// ———— Default Content ————
const defaultContent = {
    heroName: 'Elias Chen',
    heroTagline: ' · 数字游民 · 跨文化探索者',
    heroDesc: '穿越 8 个时区，用 3 种语言交谈，在代码与人文的交界处寻找共鸣。',
    profile: 'Elias Chen · 27 · Digital Nomad',
    origin1: '生于上海，留学东京，工作旧金山，',
    origin2: '现在背着背包和一台 MBP 旅居世界。',
    passion1: '白天写代码，晚上写故事。',
    passion2: '相信最好的创新发生在文化的碰撞之处。',
    mission1: '连接不同大陆的人与想法，',
    mission2: '让技术与善意跨越国境。',
    location: '📍 此时此地 · 不定',
    timezone: 'UTC+8 → UTC-8 随时切换',
    languages: '中文 · English · 日本語 · Español · Français',
    interests: 'AI · 摄影 · 咖啡 · 攀岩 · 跨文化人类学',
    status: '🟢 在线 · 欢迎聊天',
    motto: '"Code has no borders."',
    connectQuote1: '"我始终相信，真正的连接不需要护照。',
    connectQuote2: ' 一个有趣灵魂的信号，可以穿透任何防火墙。"',
    card1Title: '语言交换',
    card1Desc: '我正在学法语和西班牙语，可以帮你练中文或英语。每周一次视频，30分钟语言+30分钟人生。',
    card2Title: '数字游民碰头',
    card2Desc: '路过曼谷、柏林或巴厘岛？给我发消息，请你喝杯咖啡，聊聊代码和人生。',
    card3Title: '跨国协作',
    card3Desc: '有个需要跨越时区的项目想法？我有技术、资源和遍布20+国家的靠谱朋友网络。',
    card4Title: '笔友计划',
    card4Desc: '在这个AI时代，来点复古的。每月一封长邮件，分享各自文化的趣事、思考和书影推荐。',
    contactEmail: 'elias@void.nexus',
    contactTelegram: 'Telegram: @elias_void',
    contactGithub: 'GitHub /elias-chen',
    contactInstagram: 'Instagram @elias.vision',
    footerName: 'Elias Chen',
    statCountries: 28,
    statLanguages: 5,
    statFriends: 300,
};

let contentData = { ...defaultContent };

// ———— Load/Save ————
function loadContent() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            contentData = { ...defaultContent, ...parsed };
        }
    } catch (e) { /* ignore */ }
}

function saveContent() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contentData));
}

function applyContent() {
    // Apply all data-editable elements
    document.querySelectorAll('[data-editable]').forEach(el => {
        const key = el.dataset.editable;
        if (contentData[key] !== undefined) {
            el.textContent = contentData[key];
        }
    });
    // Hero name
    const heroName = document.getElementById('heroName');
    if (heroName) heroName.textContent = contentData.heroName;
    // Contact name in form
    const contactName = document.getElementById('contactNameDisplay');
    if (contactName) contactName.textContent = `"${contentData.heroName}"`;
    // Stats
    const statEls = {
        statCountries: document.getElementById('statCountries'),
        statLanguages: document.getElementById('statLanguages'),
        statFriends: document.getElementById('statFriends'),
    };
    if (statEls.statCountries) statEls.statCountries.textContent = contentData.statCountries + '+';
    if (statEls.statLanguages) statEls.statLanguages.textContent = contentData.statLanguages + '+';
    if (statEls.statFriends) statEls.statFriends.textContent = contentData.statFriends + '+';
}

// ———— Initialize ————
loadContent();
applyContent();

/* ══════════════════════════════════════════════════════════════
   ═══  ADMIN MODE  ═══
   ══════════════════════════════════════════════════════════════ */

let adminLoggedIn = false;
let clickCount = 0;
let clickTimer = null;

// ———— Easter Egg: click glitch title 7 times ————
const glitchTitle = document.getElementById('glitchTitle');
if (glitchTitle) {
    glitchTitle.addEventListener('click', () => {
        clickCount++;
        if (clickCount === 1) {
            clickTimer = setTimeout(() => { clickCount = 0; }, 2000);
        }
        if (clickCount >= 7) {
            clearTimeout(clickTimer);
            clickCount = 0;
            showLoginModal();
        }
    });
}

// ———— Show Login Modal ————
function showLoginModal() {
    document.getElementById('adminLogin').style.display = 'flex';
    document.getElementById('adminPasswordInput').value = '';
    document.getElementById('loginError').style.display = 'none';
    document.getElementById('adminPasswordInput').focus();
}

// ———— Login ————
function handleLogin() {
    const pwd = document.getElementById('adminPasswordInput').value;
    if (pwd === ADMIN_PASSWORD) {
        document.getElementById('adminLogin').style.display = 'none';
        enableAdminMode();
    } else {
        document.getElementById('loginError').style.display = 'block';
    }
}

document.getElementById('adminLoginBtn').addEventListener('click', handleLogin);
document.getElementById('adminPasswordInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleLogin();
});
document.getElementById('adminLoginCancel').addEventListener('click', () => {
    document.getElementById('adminLogin').style.display = 'none';
});

// ———— Enable Admin Mode ————
function enableAdminMode() {
    adminLoggedIn = true;
    document.body.classList.add('admin-mode');
    document.getElementById('roleIndicator').style.display = 'flex';
    document.getElementById('roleBadge').textContent = 'ADMIN';
    document.getElementById('navDevToggle').style.display = 'list-item';
    document.getElementById('adminPanel').style.display = 'flex';
    populateEditorFields();
}

// ———— Logout ————
document.getElementById('roleLogout').addEventListener('click', () => {
    adminLoggedIn = false;
    document.body.classList.remove('admin-mode');
    document.getElementById('roleIndicator').style.display = 'none';
    document.getElementById('navDevToggle').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('devModeToggle').checked = false;
    document.getElementById('devModeToggle2').checked = false;
    document.getElementById('devPanel').style.display = 'none';
});

// ———— Populate Editor Fields ————
function populateEditorFields() {
    const container = document.getElementById('editorFields');
    container.innerHTML = '';
    const editableKeys = Object.keys(contentData).filter(k => !k.startsWith('stat'));
    editableKeys.forEach(key => {
        const val = contentData[key];
        const field = document.createElement('div');
        field.className = 'editor-field';
        const label = document.createElement('label');
        label.textContent = key;
        let input;
        if (String(val).length > 40) {
            input = document.createElement('textarea');
            input.rows = 2;
        } else {
            input = document.createElement('input');
            input.type = 'text';
        }
        input.value = val;
        input.dataset.key = key;
        input.addEventListener('input', (e) => {
            contentData[key] = e.target.value;
            saveContent();
            applyContent();
        });
        field.appendChild(label);
        field.appendChild(input);
        container.appendChild(field);
    });
}

// ———— Inline Edit ————
document.addEventListener('click', (e) => {
    if (!adminLoggedIn) return;
    const target = e.target.closest('[data-editable]');
    if (!target) return;
    if (e.target.closest('.admin-panel')) return;

    const key = target.dataset.editable;
    const currentVal = contentData[key] || target.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentVal;
    input.className = 'inline-editor';
    input.style.cssText = 'background:rgba(0,255,200,0.06);border:1px solid rgba(0,255,200,0.3);color:#c0c0d0;font-family:inherit;font-size:inherit;padding:2px 6px;border-radius:2px;width:100%;outline:none;';

    target.textContent = '';
    target.appendChild(input);
    input.focus();
    input.select();

    function saveInline() {
        const newVal = input.value;
        contentData[key] = newVal;
        saveContent();
        applyContent();
    }

    input.addEventListener('blur', saveInline);
    input.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') { input.blur(); }
        if (ev.key === 'Escape') { applyContent(); }
    });
});

// ———— Stats Editor ————
document.getElementById('saveStats').addEventListener('click', () => {
    contentData.statCountries = parseInt(document.getElementById('editStatCountries').value) || 0;
    contentData.statLanguages = parseInt(document.getElementById('editStatLanguages').value) || 0;
    contentData.statFriends = parseInt(document.getElementById('editStatFriends').value) || 0;
    saveContent();
    applyContent();
});

// ———— Admin Tabs ————
document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
    });
});

// ———— Export / Import ————
document.getElementById('exportData').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(contentData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'void-nexus-backup.json';
    a.click();
    URL.revokeObjectURL(url);
});

document.getElementById('importData').addEventListener('click', () => {
    document.getElementById('importFileInput').click();
});

document.getElementById('importFileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const data = JSON.parse(ev.target.result);
            contentData = { ...defaultContent, ...data };
            saveContent();
            applyContent();
            populateEditorFields();
            // Update stat inputs
            document.getElementById('editStatCountries').value = contentData.statCountries;
            document.getElementById('editStatLanguages').value = contentData.statLanguages;
            document.getElementById('editStatFriends').value = contentData.statFriends;
            alert('导入成功！');
        } catch (err) {
            alert('导入失败：' + err.message);
        }
    };
    reader.readAsText(file);
});

// ———— Admin Panel Close ————
document.getElementById('adminClose').addEventListener('click', () => {
    document.getElementById('adminPanel').style.display = 'none';
});

/* ══════════════════════════════════════════════════════════════
   ═══  DEVELOPER MODE  ═══
   ══════════════════════════════════════════════════════════════ */

let devModeActive = false;

function toggleDevMode(active) {
    devModeActive = active;
    document.getElementById('devModeToggle').checked = active;
    document.getElementById('devModeToggle2').checked = active;
    document.getElementById('devPanel').style.display = active ? 'flex' : 'none';
    document.body.classList.toggle('dev-mode-active', active);
    if (active) updateDevPanel();
}

document.getElementById('devModeToggle').addEventListener('change', (e) => {
    toggleDevMode(e.target.checked);
});
document.getElementById('devModeToggle2').addEventListener('change', (e) => {
    toggleDevMode(e.target.checked);
});
document.getElementById('devPanelClose').addEventListener('click', () => {
    toggleDevMode(false);
});

// ———— Dev Panel Data ————
function updateDevPanel() {
    // Role
    document.getElementById('devRole').textContent = adminLoggedIn ? 'admin' : 'visitor';
    // Load time
    if (window.performance) {
        const loadTime = (performance.now() / 1000).toFixed(2);
        document.getElementById('devLoadTime').textContent = loadTime + 's';
    }
    // Memory
    if (navigator.deviceMemory) {
        document.getElementById('devMemory').textContent = navigator.deviceMemory + ' GB';
    } else {
        document.getElementById('devMemory').textContent = 'N/A';
    }
    // UA
    document.getElementById('devUA').textContent = navigator.userAgent.substring(0, 80) + '...';
    // localStorage
    const storageData = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        try {
            storageData[key] = JSON.parse(localStorage.getItem(key));
        } catch {
            storageData[key] = localStorage.getItem(key);
        }
    }
    document.getElementById('devStorage').textContent = JSON.stringify(storageData, null, 2) || '(empty)';
    // Sections
    const sections = [];
    document.querySelectorAll('section[id]').forEach(s => {
        sections.push({ id: s.id, visible: s.getBoundingClientRect().top < window.innerHeight });
    });
    document.getElementById('devSections').textContent = JSON.stringify(sections, null, 2);
}

// Auto-refresh dev panel every 5s when active
setInterval(() => {
    if (devModeActive) updateDevPanel();
}, 10000);

/* ══════════════════════════════════════════════════════════════
   ═══  KEYBOARD SHORTCUTS  ═══
   ══════════════════════════════════════════════════════════════ */
document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+A: toggle admin panel
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        if (adminLoggedIn) {
            const panel = document.getElementById('adminPanel');
            panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
        }
    }
    // Ctrl+Shift+D: toggle dev mode
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        if (adminLoggedIn) toggleDevMode(!devModeActive);
    }
    // Escape: close panels
    if (e.key === 'Escape') {
        if (devModeActive) toggleDevMode(false);
    }
});

console.log('%c VOID.NEXUS ',
    'background:#0a0a0f;color:#00ffc8;font-size:14px;padding:4px 8px;border:1px solid #00ffc8;');
console.log('%c Try clicking the glitch title 7 times... ',
    'color:#7b61ff;font-size:11px;');

/* ══════════════════════════════════════════════════════════════
   ═══  CHAT — WebSocket + Friend System + Private Chat  ═══
   ══════════════════════════════════════════════════════════════ */

const CHAT_SERVER = 'https://0ec3b2182791fb.lhr.life';
let chatSocket = null;
let chatJoined = false;
let chatUserId = '';
let chatNickname = '';
let chatCountry = '';
let chatRegion = 'china';
let chatMode = 'international';
let currentChat = 'room'; // 'room' or friendUserId
let friendList = [];
let pendingFriendReq = [];

// Generate persistent user ID
function getUserId() {
    let uid = localStorage.getItem('void_chat_userId');
    if (!uid) {
        uid = 'u_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
        localStorage.setItem('void_chat_userId', uid);
    }
    return uid;
}

// ———— Chat FAB ————
const chatFab = document.getElementById('chatFab');
const chatPanel = document.getElementById('chatPanel');
const chatClose = document.getElementById('chatClose');

chatFab.addEventListener('click', () => {
    const isOpen = chatPanel.style.display !== 'none';
    chatPanel.style.display = isOpen ? 'none' : 'flex';
    if (isOpen && chatSocket) document.getElementById('chatInput').blur();
    if (!isOpen && chatJoined) document.getElementById('chatInput').focus();
    if (!isOpen && !chatJoined) {
        // Detect location when opening login
        detectLocation();
    }
    // Clear badge
    badgeCount = 0;
    document.getElementById('chatBadge').style.display = 'none';
});

chatClose.addEventListener('click', () => {
    chatPanel.style.display = 'none';
});

// ———— Auto-detect user location ————
let locationDetected = false;
function detectLocation() {
    if (locationDetected) return;
    locationDetected = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    fetch('https://ipapi.co/json/', { signal: controller.signal })
        .then(r => r.json())
        .then(data => {
            clearTimeout(timeout);
            const country = data.country_name || '';
            const countryCode = data.country_code || '';
            const city = data.city || '';
            const isChina = countryCode === 'CN' || country === 'China';
            const detectedRegion = isChina ? 'china' : 'international';
            chatRegion = detectedRegion;
            document.querySelectorAll('.region-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.region === detectedRegion);
            });
            const countrySelect = document.getElementById('chatCountry');
            if (countrySelect) {
                for (const opt of countrySelect.options) {
                    if (opt.text.includes(country)) {
                        countrySelect.value = opt.value;
                        break;
                    }
                }
            }
            updateRouteInfo();
            console.log('[location]', city, country, '→', isChina ? '🇨🇳 国内' : '🌍 国际');
        })
        .catch(() => {
            clearTimeout(timeout);
            console.log('[location] detection failed, using default');
        });
}

function getFlagEmoji(countryCode) {
    if (!countryCode || countryCode.length !== 2) return '🌍';
    const codePoints = countryCode.toUpperCase().split('').map(c => 127397 + c.charCodeAt());
    return String.fromCodePoint(...codePoints);
}

// ———— Chat Login ————
const chatJoinBtn = document.getElementById('chatJoinBtn');
const chatNicknameInput = document.getElementById('chatNickname');
const chatCountrySelect = document.getElementById('chatCountry');

chatJoinBtn.addEventListener('click', connectToChat);
chatNicknameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') connectToChat();
});

// Region selector
document.querySelectorAll('.region-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.region-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        chatRegion = btn.dataset.region;
        updateRouteInfo();
    });
});

function connectToChat() {
    const nick = chatNicknameInput.value.trim();
    if (!nick) {
        chatNicknameInput.style.borderColor = '#ff5f57';
        chatNicknameInput.focus();
        return;
    }
    chatNicknameInput.style.borderColor = '';
    chatNickname = nick;
    chatCountry = chatCountrySelect.value;

    if (chatSocket) chatSocket.disconnect();

    chatSocket = io(CHAT_SERVER, {
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionDelay: 2000
    });

    chatSocket.on('connect', () => {
        chatUserId = getUserId();
        chatSocket.emit('join', {
            userId: chatUserId,
            nickname: chatNickname,
            avatar: chatNickname.charAt(0).toUpperCase(),
            country: chatCountry,
            region: chatRegion,
            chatMode: chatMode
        });
        chatJoined = true;
        updateRouteInfo();
        document.getElementById('chatLogin').style.display = 'none';
        document.getElementById('chatMain').style.display = 'flex';
        document.getElementById('chatInput').focus();
        chatFab.style.display = 'none';
    });

    // Room history
    chatSocket.on('history', (messages) => {
        if (currentChat === 'room') {
            const container = document.getElementById('chatMessages');
            container.innerHTML = '';
            messages.forEach(msg => renderMessage(msg, 'room'));
            scrollChatBottom('room');
        }
    });

    // Room message
    chatSocket.on('message', (msg) => {
        if (currentChat === 'room') {
            renderMessage(msg, 'room');
            scrollChatBottom('room');
        }
        if (chatPanel.style.display === 'none' || document.hidden) showChatBadge();
    });

    // Online users
    chatSocket.on('users', (users) => {
        renderUserList(users);
    });

    // Room users (filtered by mode)
    chatSocket.on('room_users', (users) => {
        renderRoomUsers(users);
    });

    // Mode changed
    chatSocket.on('mode_changed', ({ chatMode: mode }) => {
        chatMode = mode;
        document.querySelectorAll('.mode-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.mode === mode);
        });
        const info = document.getElementById('chatRouteInfo');
        if (info) {
            info.textContent = mode === 'domestic' ? '🏠 国内模式 · 仅显示同地区用户' : '🌐 国际模式 · 显示所有用户';
        }
    });

    // Room typing
    chatSocket.on('typing', (data) => {
        if (currentChat !== 'room') return;
        const typingEl = document.getElementById('chatTyping');
        if (data.typing && data.id !== chatSocket.id) {
            typingEl.textContent = `${data.nickname} 正在输入...`;
            typingEl.style.display = 'block';
        } else {
            typingEl.style.display = 'none';
        }
    });

    // ─── Friend Events ───
    chatSocket.on('friends_list', (list) => {
        friendList = list;
        renderFriendList(list);
    });

    chatSocket.on('friend_requests', (requests) => {
        pendingFriendReq = requests;
    });

    chatSocket.on('friend_request_sent', (data) => {
        document.getElementById('addFriendResult').textContent =
            `✓ 好友请求已发送给 ${data.toNickname}`;
        document.getElementById('addFriendResult').style.color = '#00ffc8';
        setTimeout(() => {
            document.getElementById('addFriendModal').style.display = 'none';
        }, 1500);
    });

    chatSocket.on('friend_request_received', (data) => {
        pendingFriendReq.push(data);
        showFriendToast(data);
    });

    chatSocket.on('friend_error', (data) => {
        document.getElementById('addFriendResult').textContent = `✕ ${data.msg}`;
        document.getElementById('addFriendResult').style.color = '#ff5f57';
    });

    chatSocket.on('friend_added', (data) => {
        // Refresh friend list
        chatSocket.emit('friend_request', { toUserId: '__refresh__' }); // no-op trigger
    });

    chatSocket.on('friend_removed', (data) => {
        if (currentChat === data.friendUserId) {
            switchChat('room');
        }
    });

    // ─── Private Chat Events ───
    chatSocket.on('private_history', (data) => {
        if (currentChat === data.withUserId) {
            const container = document.getElementById('chatMessages');
            container.innerHTML = '';
            (data.messages || []).forEach(msg => {
                renderPrivateMessage(msg, data.withUserId);
            });
            scrollChatBottom('room');
        }
    });

    chatSocket.on('private_message', (data) => {
        const fromId = data.fromUserId === chatUserId ? data.toUserId : data.fromUserId;
        // If currently chatting with this person, show it
        if (currentChat === fromId) {
            renderPrivateMessage(data, fromId);
            scrollChatBottom('room');
        }
        // Show badge
        if (chatPanel.style.display === 'none' || document.hidden) showChatBadge();
        // Flash the tab
        const tab = document.querySelector(`.chat-tab[data-chat="${fromId}"]`);
        if (tab && currentChat !== fromId) {
            tab.style.color = '#00ffc8';
        }
    });

    chatSocket.on('private_typing', (data) => {
        if (currentChat !== data.fromUserId) return;
        const typingEl = document.getElementById('chatTyping');
        if (data.typing) {
            typingEl.textContent = `${data.nickname} 正在输入...`;
            typingEl.style.display = 'block';
        } else {
            typingEl.style.display = 'none';
        }
    });

    chatSocket.on('disconnect', () => {
        const container = document.getElementById('chatMessages');
        if (currentChat === 'room') {
            renderMessage({ type: 'system', text: '⚠ 连接断开，正在重连...', time: Date.now() }, 'room');
        }
    });

    chatSocket.on('connect_error', (err) => {
        console.log('[socket] connection error:', err.message);
        if (currentChat === 'room') {
            renderMessage({ type: 'system', text: '⚠ 连接失败，正在重试...', time: Date.now() }, 'room');
        }
    });

    // Friend request by nickname result
    chatSocket.on('friend_request_by_nickname_result', (data) => {
        if (data.found) {
            // Send actual friend request
            chatSocket.emit('friend_request', { toUserId: data.userId });
            addFriendResult.textContent = `✓ 已向 ${data.nickname} 发送好友请求`;
            addFriendResult.style.color = '#00ffc8';
            setTimeout(() => {
                document.getElementById('addFriendModal').style.display = 'none';
            }, 1500);
        } else {
            addFriendResult.textContent = '✕ 未找到该用户，确认昵称是否正确';
            addFriendResult.style.color = '#ff5f57';
        }
    });

    // ─── Match Events ───
    chatSocket.on('matches', (data) => {
        if (currentMatchInterest && data.interest === currentMatchInterest) {
            renderMatchUsers(data.users);
        }
    });

    chatSocket.on('match_request_received', (data) => {
        currentMatchReq = data;
        const interestName = INTEREST_NAMES[data.interest] || data.interest;
        matchToastText.textContent = `${data.fromNickname} 想与你${interestName} ✦`;
        matchToast.style.display = 'block';
        setTimeout(() => { matchToast.style.display = 'none'; }, 10000);
    });

    chatSocket.on('match_accepted', (data) => {
        showChatNotification(`✨ ${data.friendNickname} 接受了匹配，快去聊天吧！`);
        openPrivateChat(data.friendUserId);
    });

    // Auto-set interests
    chatSocket.emit('set_interests', INTEREST_LIST);
}

// ═══ ROUTE INFO ═══
function updateRouteInfo() {
    const infoEl = document.getElementById('chatRouteInfo');
    if (!infoEl) return;
    const isCrossRegion = (chatRegion === 'china' && chatMode === 'international') ||
                          (chatRegion === 'international' && chatMode === 'domestic');
    if (isCrossRegion) {
        infoEl.innerHTML = '🌐 境外中转 · 跨地区通信经海外服务器转发';
        infoEl.style.color = '#ffbd2e';
    } else if (chatRegion === 'china') {
        infoEl.innerHTML = '🇨🇳 国内直连 · 同地区通信';
        infoEl.style.color = '#28c840';
    } else {
        infoEl.innerHTML = '🌍 境外直连 · 同地区通信';
        infoEl.style.color = '#28c840';
    }
}

// ═══ MODE SWITCH ═══
document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (!chatSocket) return;
        const mode = btn.dataset.mode;
        chatSocket.emit('set_chat_mode', { chatMode: mode });
        updateRouteInfo();
    });
});

// ═══ SEND MESSAGE ═══
const chatInput = document.getElementById('chatInput');
const chatSendBtn = document.getElementById('chatSendBtn');

function sendChatMessage() {
    const text = chatInput.value.trim();
    if (!text || !chatSocket) return;

    if (currentChat === 'room') {
        chatSocket.emit('message', text);
    } else {
        chatSocket.emit('private_message', { toUserId: currentChat, text });
        // Render locally
        renderPrivateMessage({
            fromUserId: chatUserId,
            fromNickname: chatNickname,
            text: text,
            time: Date.now(),
            toUserId: currentChat
        }, currentChat);
        scrollChatBottom('room');
    }
    chatInput.value = '';
    chatInput.focus();
}

chatSendBtn.addEventListener('click', sendChatMessage);
chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
    }
});

// ———— Typing ————
let typingTimer = null;
chatInput.addEventListener('input', () => {
    if (!chatSocket) return;
    if (currentChat === 'room') {
        chatSocket.emit('typing', true);
    } else {
        chatSocket.emit('private_typing', { toUserId: currentChat, typing: true });
    }
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        if (currentChat === 'room') {
            chatSocket.emit('typing', false);
        } else {
            chatSocket.emit('private_typing', { toUserId: currentChat, typing: false });
        }
    }, 1500);
});

// ═══ CHAT TABS ═══
function switchChat(chatId) {
    currentChat = chatId;
    const container = document.getElementById('chatMessages');
    container.innerHTML = '';
    document.getElementById('chatTyping').style.display = 'none';

    // Update tabs
    document.querySelectorAll('.chat-tab').forEach(t => t.classList.remove('active'));
    let tab = document.querySelector(`.chat-tab[data-chat="${chatId}"]`);
    if (tab) tab.classList.add('active');

    // Request history
    if (chatId === 'room') {
        // Room - already have history via socket
        document.getElementById('chatInput').placeholder = '输入消息...';
    } else {
        // Private chat - request history
        document.getElementById('chatInput').placeholder = `给 ${getFriendNickname(chatId)} 发消息...`;
        chatSocket.emit('private_history', { withUserId: chatId });
    }
}

function getFriendNickname(userId) {
    const f = friendList.find(f => f.userId === userId);
    return f ? f.nickname : '好友';
}

function openPrivateChat(userId) {
    const friend = friendList.find(f => f.userId === userId);
    if (!friend) return;

    // Check if tab already exists
    if (document.querySelector(`.chat-tab[data-chat="${userId}"]`)) {
        switchChat(userId);
        return;
    }

    // Add new tab
    const tabs = document.getElementById('chatTabs');
    const btn = document.createElement('button');
    btn.className = 'chat-tab';
    btn.dataset.chat = userId;
    btn.innerHTML = `${friend.nickname} <span class="chat-tab-close">✕</span>`;
    btn.querySelector('.chat-tab-close').addEventListener('click', (e) => {
        e.stopPropagation();
        closePrivateChat(userId);
    });
    btn.addEventListener('click', () => switchChat(userId));
    tabs.appendChild(btn);

    switchChat(userId);
}

function closePrivateChat(userId) {
    if (currentChat === userId) switchChat('room');
    const tab = document.querySelector(`.chat-tab[data-chat="${userId}"]`);
    if (tab) tab.remove();
}

// ═══ RENDER: Room Users (filtered sidebar) ═══
function renderRoomUsers(users) {
    const container = document.getElementById('chatUserList');
    if (!container) return;
    container.innerHTML = '';
    users.forEach(u => {
        if (u.userId === chatUserId) return;
        const isFriend = friendList.some(f => f.userId === u.userId);
        const region = u.region || 'international';
        const item = document.createElement('div');
        item.className = 'chat-user-item';
        item.innerHTML = ;
        const btn = item.querySelector('.chat-add-friend');
        if (!isFriend) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                sendFriendRequest(u.userId, u.nickname);
            });
        }
        container.appendChild(item);
    });
}

// ═══ RENDER: Room Message ═══
function renderMessage(msg, chatId) {
    if (chatId && chatId !== currentChat) return;
    const container = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = 'chat-msg';

    if (msg.type === 'system') {
        div.classList.add('system');
        div.innerHTML = `<div class="chat-msg-bubble">${msg.text}</div>`;
    } else {
        const isSelf = msg.userId === chatUserId;
        div.classList.add(isSelf ? 'self' : 'other');
        const time = new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const msgRegion = msg.region || 'international';
        const regionBadge = msgRegion === 'china' ? '🇨🇳' : '🌍';
        div.innerHTML = `
            <div class="chat-msg-header">
                <span class="chat-msg-name">${escapeHtml(msg.nickname)}</span>
                <span class="msg-region-badge ${msgRegion}">${regionBadge}</span>
                <span class="chat-msg-country">${msg.country || ''}</span>
                <span class="chat-msg-time">${time}</span>
            </div>
            <div class="chat-msg-bubble">${escapeHtml(msg.text)}</div>
        `;
    }
    container.appendChild(div);
}

// ═══ RENDER: Private Message ═══
function renderPrivateMessage(data, chatWithId) {
    if (currentChat !== chatWithId) return;
    const container = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = 'chat-msg';

    const isSelf = data.fromUserId === chatUserId;
    div.classList.add(isSelf ? 'self' : 'other');

    const time = new Date(data.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const name = isSelf ? chatNickname : (data.fromNickname || '好友');
    div.innerHTML = `
        <div class="chat-msg-header">
            <span class="chat-msg-name">${escapeHtml(name)}</span>
            <span class="chat-msg-time">${time}</span>
        </div>
        <div class="chat-msg-bubble">${escapeHtml(data.text)}</div>
    `;
    container.appendChild(div);
}

// ═══ RENDER: User List (with add friend) ═══
function renderUserList(users) {
    const container = document.getElementById('chatUserList');
    const onlineCount = document.getElementById('chatOnlineCount');
    const onlineSidebar = document.getElementById('chatOnlineSidebar');

    container.innerHTML = '';
    users.forEach(u => {
        if (u.userId === chatUserId) return; // skip self
        const isFriend = friendList.some(f => f.userId === u.userId);
        const item = document.createElement('div');
        item.className = 'chat-user-item';
        item.innerHTML = `
            <span class="chat-user-dot"></span>
            <span class="chat-user-name">${escapeHtml(u.nickname)}</span>
            ${isFriend
                ? '<button class="chat-add-friend friend-ok">✓ 好友</button>'
                : '<button class="chat-add-friend">+ 好友</button>'
            }
        `;
        const btn = item.querySelector('.chat-add-friend');
        if (!isFriend) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                sendFriendRequest(u.userId, u.nickname);
            });
        } else {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                openPrivateChat(u.userId);
            });
        }
        container.appendChild(item);
    });

    const count = users.length;
    if (onlineCount) onlineCount.textContent = `${count} 人在线`;
    if (onlineSidebar) onlineSidebar.textContent = count;
}

// ═══ RENDER: Friend List ═══
function renderFriendList(list) {
    const container = document.getElementById('chatFriendList');
    const countEl = document.getElementById('chatFriendCount');
    container.innerHTML = '';

    if (list.length === 0) {
        container.innerHTML = '<div style="color:#404050;font-size:0.7rem;padding:20px 12px;text-align:center">还没有好友<br>在「在线」列表添加吧</div>';
    }

    list.forEach(f => {
        const item = document.createElement('div');
        item.className = 'chat-user-item';
        item.style.cursor = 'pointer';
        item.innerHTML = `
            <span class="chat-user-dot ${f.online ? '' : 'offline'}"></span>
            <span class="chat-user-name">${escapeHtml(f.nickname)}</span>
            <span style="font-size:0.6rem;color:#505060;margin-left:auto">${f.country || ''}</span>
        `;
        item.addEventListener('click', () => openPrivateChat(f.userId));
        container.appendChild(item);
    });

    if (countEl) countEl.textContent = list.length;
}

// ═══ ADD FRIEND ═══
const addFriendBtn = document.getElementById('chatAddFriendBtn');
const addFriendModal = document.getElementById('addFriendModal');
const addFriendInput = document.getElementById('addFriendInput');
const addFriendConfirm = document.getElementById('addFriendConfirm');
const addFriendCancel = document.getElementById('addFriendCancel');
const addFriendResult = document.getElementById('addFriendResult');

addFriendBtn.addEventListener('click', () => {
    addFriendModal.style.display = 'flex';
    addFriendInput.value = '';
    addFriendResult.textContent = '';
    addFriendInput.focus();
});

addFriendConfirm.addEventListener('click', () => {
    const name = addFriendInput.value.trim();
    if (!name) return;
    // Find user by nickname from socket
    addFriendResult.textContent = ' searching...';
    addFriendResult.style.color = '#808090';
    // We'll search by emitting to server; for simplicity, ask the user to type
    // the exact nickname and we'll match on our user list
    if (!chatSocket) return;

    // Find matching online user
    // The server doesn't have a search-by-nickname endpoint, so we use
    // the friend_request event with the nickname, and the server resolves it
    // Actually our server uses userId for friend requests.
    // Let's find the user by nickname from our known data.
    // We'll emit a special event to look up by nickname

    // Simple approach: lookup in current known users
    // We'll ask server to find by nickname
    chatSocket.emit('friend_request_by_nickname', { nickname: name });
});

addFriendInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addFriendConfirm.click();
});

addFriendCancel.addEventListener('click', () => {
    addFriendModal.style.display = 'none';
});

function sendFriendRequest(userId, nickname) {
    if (!chatSocket) return;
    chatSocket.emit('friend_request', { toUserId: userId });
    showChatNotification(`好友请求已发送给 ${nickname}`);
}

// Friend request by nickname handler (runs on addFriendConfirm click)
addFriendConfirm.addEventListener('click', function localLookup() {
    const name = addFriendInput.value.trim();
    if (!name || !chatSocket) return;

    chatSocket.emit('friend_request_by_nickname', { nickname: name });
    addFriendResult.textContent = '⏳ 搜索中...';
    addFriendResult.style.color = '#808090';
});

// ═══ FRIEND REQUEST TOAST ═══
let currentFriendReq = null;
const friendToast = document.getElementById('friendRequestToast');
const friendReqText = document.getElementById('friendReqText');
const friendReqAccept = document.getElementById('friendReqAccept');
const friendReqReject = document.getElementById('friendReqReject');

function showFriendToast(data) {
    currentFriendReq = data;
    friendReqText.textContent = `${data.fromNickname} 发来好友请求 ✦`;
    friendToast.style.display = 'block';
    setTimeout(() => { friendToast.style.display = 'none'; }, 10000);
}

friendReqAccept.addEventListener('click', () => {
    if (currentFriendReq && chatSocket) {
        chatSocket.emit('friend_accept', { fromUserId: currentFriendReq.fromUserId });
        friendToast.style.display = 'none';
        showChatNotification(`已添加 ${currentFriendReq.fromNickname} 为好友`);
    }
});

friendReqReject.addEventListener('click', () => {
    if (currentFriendReq && chatSocket) {
        chatSocket.emit('friend_reject', { fromUserId: currentFriendReq.fromUserId });
        friendToast.style.display = 'none';
    }
});

// ═══ SIDEBAR TABS ═══
document.querySelectorAll('.chat-stab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.chat-stab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.chat-sidebar-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('stab-' + tab.dataset.stab).classList.add('active');
    });
});

// ═══ BADGE ═══
let badgeCount = 0;
function showChatBadge() {
    const badge = document.getElementById('chatBadge');
    badgeCount++;
    badge.textContent = badgeCount;
    badge.style.display = 'flex';
}

// ═══ NOTIFICATION ═══
function showChatNotification(text) {
    const container = document.getElementById('chatMessages');
    if (currentChat !== 'room') return;
    const div = document.createElement('div');
    div.className = 'chat-msg system';
    div.innerHTML = `<div class="chat-msg-bubble">${text}</div>`;
    container.appendChild(div);
    scrollChatBottom('room');
}

// ═══ SCROLL ═══
function scrollChatBottom() {
    const container = document.getElementById('chatMessages');
    setTimeout(() => { container.scrollTop = container.scrollHeight; }, 50);
}

// ═══ UTIL ═══
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/* ══════════════════════════════════════════════════════════════
   ═══  MATCH SYSTEM — 语言交换 / 数字游民 / 协作 / 笔友  ═══
   ══════════════════════════════════════════════════════════════ */

const INTEREST_NAMES = {
    language: '🌐 语言交换',
    nomad: '🤝 数字游民碰头',
    project: '💡 跨国协作',
    penpal: '✉️ 笔友计划'
};
const INTEREST_LIST = ['language', 'nomad', 'project', 'penpal'];
let currentMatchInterest = null;
let currentMatchData = null;

// Auto-set interests when joining chat
function setMyInterests() {
    if (!chatSocket || !chatUserId) return;
    // User is interested in all 4 by default
    chatSocket.emit('set_interests', INTEREST_LIST);
}

// Hook into connectToChat to call setMyInterests after joining
// (already connected at this point, so we add a handler)
// We'll call it from the connect handler
// Actually, let's just patch it - add a listener on 'connect' event

// Patch the chatSocket connect handler
const origEmit = io?.prototype?.emit;
// Simpler approach: add to the connect event listener

// Open match panel
function openMatchPanel(interest) {
    if (!chatSocket || !chatJoined) {
        alert('请先加入聊天室再使用匹配功能');
        return;
    }

    currentMatchInterest = interest;
    const titleEl = document.getElementById('matchPanelTitle');
    const cmdEl = document.getElementById('matchPanelCmd');
    const listEl = document.getElementById('matchUserList');
    const panel = document.getElementById('matchPanel');

    titleEl.textContent = INTEREST_NAMES[interest] || interest;
    cmdEl.textContent = `./find --interest=${interest}`;
    listEl.innerHTML = '<p class="output" id="matchLoading">⏳ 搜索中...</p>';
    panel.style.display = 'flex';

    // Set our interests
    chatSocket.emit('set_interests', INTEREST_LIST);

    // Request matches
    chatSocket.emit('get_matches', { interest });

    // Listen for matches result (one-time)
    chatSocket.off('matches');
    chatSocket.on('matches', (data) => {
        if (data.interest !== interest) return;
        renderMatchUsers(data.users);
    });
}

function renderMatchUsers(users) {
    const listEl = document.getElementById('matchUserList');
    if (!users || users.length === 0) {
        listEl.innerHTML = '<div class="match-empty">暂无其他人在线<br>试试切换标签页或稍后再来</div>';
        return;
    }

    listEl.innerHTML = '';
    users.forEach(u => {
        const div = document.createElement('div');
        div.className = 'match-user-item';
        const alreadyFriend = friendList.some(f => f.userId === u.userId);
        div.innerHTML = `
            <div class="match-user-info">
                <div class="match-user-name">${escapeHtml(u.nickname)}</div>
                <div class="match-user-meta">${u.country || '未知'} · ${alreadyFriend ? '✓ 已是好友' : ''}</div>
            </div>
            ${alreadyFriend
                ? '<button class="btn-match-send sent">已好友</button>'
                : '<button class="btn-match-send">发请求</button>'
            }
        `;

        const btn = div.querySelector('.btn-match-send');
        if (!alreadyFriend) {
            btn.addEventListener('click', () => {
                btn.textContent = '已发送';
                btn.classList.add('sent');
                chatSocket.emit('match_request', {
                    toUserId: u.userId,
                    interest: currentMatchInterest
                });
            });
        }

        listEl.appendChild(div);
    });
}

// Match panel close
document.getElementById('matchPanelClose').addEventListener('click', () => {
    document.getElementById('matchPanel').style.display = 'none';
});

// ─── Socket event: match_request_received ───
// Add this in the connectToChat function - we need to ensure it's set up
// We'll add it as a one-time setup that runs when chatSocket is created

// Match request toast
const matchToast = document.getElementById('matchToast');
const matchToastText = document.getElementById('matchToastText');
const matchToastAccept = document.getElementById('matchToastAccept');
const matchToastReject = document.getElementById('matchToastReject');
let currentMatchReq = null;

// These handlers need to be set up after chatSocket connects
// We'll add them in the connectToChat handler

// For the initial setup, let's add global event listeners
// that work whenever chatSocket is available

// Match accept button
matchToastAccept.addEventListener('click', () => {
    if (currentMatchReq && chatSocket) {
        chatSocket.emit('match_accept', { fromUserId: currentMatchReq.fromUserId });
        matchToast.style.display = 'none';
        showChatNotification(`✨ 已接受 ${currentMatchReq.fromNickname} 的匹配请求，自动添加为好友`);
        currentMatchReq = null;
    }
});

matchToastReject.addEventListener('click', () => {
    if (currentMatchReq && chatSocket) {
        chatSocket.emit('match_reject', { fromUserId: currentMatchReq.fromUserId });
        matchToast.style.display = 'none';
        currentMatchReq = null;
    }
});

// No patching needed - handlers are set up in connectToChat directly
