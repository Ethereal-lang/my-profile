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
    setInterval(drawMatrix, 45);
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
    setTimeout(typeEffect, isDeleting ? 25 : 50);
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
}, 5000);

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
