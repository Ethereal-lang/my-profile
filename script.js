/* ========================
   MATRIX RAIN
   ======================== */
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
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
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

setInterval(drawMatrix, 45);

/* ========================
   TYPEWRITER EFFECT
   ======================== */
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

let phraseIdx = 0;
let charIdx = 0;
let isDeleting = false;
const typewriter = document.getElementById('typewriter');

function typeEffect() {
    const current = phrases[phraseIdx];

    if (!isDeleting) {
        typewriter.textContent = current.substring(0, charIdx + 1);
        charIdx++;
        if (charIdx === current.length) {
            setTimeout(() => { isDeleting = true; }, 2000);
        }
    } else {
        typewriter.textContent = current.substring(0, charIdx);
        charIdx--;
        if (charIdx === 0) {
            isDeleting = false;
            phraseIdx = (phraseIdx + 1) % phrases.length;
        }
    }

    const delay = isDeleting ? 25 : 50;
    setTimeout(typeEffect, delay);
}

if (typewriter) setTimeout(typeEffect, 1500);

/* ========================
   NUMBER COUNTER ANIMATION
   ======================== */
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
        if (current >= target) {
            current = target;
            clearInterval(interval);
        }
        el.textContent = current + '+';
    }, 20);
}

counters.forEach(c => counterObserver.observe(c));

/* ========================
   MOBILE NAV TOGGLE
   ======================== */
const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('.nav-menu');

if (toggle) {
    toggle.addEventListener('click', () => {
        menu.classList.toggle('active');
    });
}

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        menu.classList.remove('active');
    });
});

/* ========================
   SMOOTH SCROLL WITH OFFSET
   ======================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            const offset = 80;
            const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    });
});

/* ========================
   UTC CLOCK
   ======================== */
function updateClock() {
    const now = new Date();
    const utc = now.toUTCString().split(' ')[4];
    const clock = document.getElementById('utcClock');
    if (clock) clock.textContent = utc;
}
updateClock();
setInterval(updateClock, 1000);

/* ========================
   TIMEZONE DETECTION
   ======================== */
const tzDisplay = document.getElementById('timezoneDisplay');
if (tzDisplay) {
    const offset = -new Date().getTimezoneOffset() / 60;
    const sign = offset >= 0 ? '+' : '';
    tzDisplay.textContent = `UTC${sign}${offset}`;
}

/* ========================
   CONTACT FORM
   ======================== */
const form = document.getElementById('contactForm');
if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = form.querySelector('.btn-submit');
        btn.textContent = '[ 信号已发送 ✦ ]';
        btn.style.borderColor = '#00ffc8';
        setTimeout(() => {
            btn.textContent = '[ 发送信号 → ]';
            form.reset();
        }, 3000);
    });
}

/* ========================
   GLITCH HOVER EFFECT
   ======================== */
document.querySelectorAll('.glitch-hover').forEach(el => {
    el.addEventListener('mouseenter', () => {
        el.style.transform = 'skew(-2deg, 0)';
        setTimeout(() => { el.style.transform = ''; }, 200);
    });
});
