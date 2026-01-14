// 1. CHARGEMENT AUTO DE LA LIBRAIRIE D'ICÔNES (LUCIDE)
const scriptLucide = document.createElement('script');
scriptLucide.src = 'https://unpkg.com/lucide@latest';
scriptLucide.onload = () => { if (window.lucide) lucide.createIcons(); };
document.head.appendChild(scriptLucide);

// 2. STYLES COMPLETS (NAVIGATION + BANDEAU TRANSLUCIDE + ANIMATIONS)
const styleNav = document.createElement('style');
styleNav.innerHTML = `
    /* Animation de l'icône active */
    @keyframes activePulse { 0% { transform: scale(1); } 50% { transform: scale(1.12); } 100% { transform: scale(1); } }
    .nav-item.active .nav-icon-wrapper { animation: activePulse 2s infinite ease-in-out; display: inline-block; }

    /* Structure des icônes et badges */
    .nav-icon-wrapper { position: relative; display: flex; align-items: center; justify-content: center; margin-bottom: 2px; }
    .nav-indicator { position: absolute; bottom: -10px; width: 4px; height: 4px; background-color: #b91c1c; border-radius: 50%; }
    .badge-dot { position: absolute; top: -2px; right: -4px; width: 10px; height: 10px; background-color: #ef4444; border-radius: 50%; border: 2px solid white; display: none; }
    
    @media (prefers-color-scheme: dark) { 
        .badge-dot { border-color: #1e293b; } 
        .ticker-container { background: rgba(30, 41, 59, 0.7) !important; color: white !important; border-color: rgba(255,255,255,0.1) !important; }
    }

    /* Style du Menu */
    .bottom-nav { min-height: 80px; display: flex; align-items: center; justify-content: space-around; }

    /* --- STYLES DU BANDEAU DÉFILANT TRANSLUCIDE --- */
    .ticker-container {
        position: fixed;
        top: 10px;
        left: 10px;
        right: 10px;
        background: rgba(255, 255, 255, 0.7); /* Fond blanc très transparent */
        backdrop-filter: blur(12px); /* L'effet de flou translucide */
        -webkit-backdrop-filter: blur(12px);
        color: #1e293b;
        z-index: 2000;
        height: 38px;
        display: flex;
        align-items: center;
        overflow: hidden;
        font-size: 13px;
        font-weight: 600;
        border-radius: 20px; /* Bords très arrondis pour le look moderne */
        border: 1px solid rgba(255, 255, 255, 0.4);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    }
    .ticker-text {
        white-space: nowrap;
        display: inline-block;
        padding-left: 100%;
        animation: tickerMove 25s linear infinite;
    }
    @keyframes tickerMove {
        0% { transform: translate3d(0, 0, 0); }
        100% { transform: translate3d(-100%, 0, 0); }
    }
    .ticker-close {
        padding: 0 15px;
        background: transparent;
        border: none;
        color: #64748b;
        font-size: 18px;
        cursor: pointer;
        z-index: 2001;
        font-family: sans-serif;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
    }
`;
document.head.appendChild(styleNav);

async function loadMenu() {
    const nav = document.querySelector('.bottom-nav');
    if (!nav) return;

    const menuItems = [
        { href: 'index.html', icon: 'home', label: 'Accueil', id: 'home' },
        { href: 'annonces.html', icon: 'megaphone', label: 'Annonces', id: 'annonces' },
        { href: 'entraide.html', icon: 'hand-helping', label: 'Entraide', id: 'entraide' },
        { href: 'agenda.html', icon: 'calendar', label: 'Agenda', id: 'agenda' },
        { href: 'priere.html', icon: 'sparkles', label: 'Prières', id: 'priere' },
        { href: 'groupes.html', icon: 'users', label: 'Groupes', id: 'groupes' },
        { href: 'don.html', icon: 'heart', label: 'Don', id: 'don' },
        { href: 'contact.html', icon: 'mail', label: 'Contact', id: 'contact' }
    ];

    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    
    nav.innerHTML = menuItems.map(item => {
        const isActive = (currentPath === item.href) || (currentPath === "" && item.href === "index.html");
        return `
            <a href="${item.href}" 
               class="nav-item ${isActive ? 'active' : ''}" 
               onclick="hapticFeedback(); markAsRead('${item.id}')">
                <div class="nav-icon-wrapper">
                    <i data-lucide="${item.icon}" style="width: 20px; height: 20px;"></i>
                    <div id="dot-${item.id}" class="badge-dot"></div>
                    ${isActive ? '<div class="nav-indicator"></div>' : ''}
                </div>
                ${item.label}
            </a>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();

    updateBadges(); 
    loadTicker();
    setupScrollTop();
}

if (document.readyState === 'interactive' || document.readyState === 'complete') {
    loadMenu();
} else {
    document.addEventListener('DOMContentLoaded', loadMenu);
}

function markAsRead(id) {
    const dot = document.getElementById(`dot-${id}`);
    if (dot) dot.style.display = 'none';
    localStorage.setItem(`last_visit_${id}`, new Date().toISOString());
}

async function updateBadges() {
    try {
        const categories = [
            { id: 'annonces', table: 'annonces' },
            { id: 'entraide', table: 'entraide' },
            { id: 'priere', table: 'prieres' }
        ];
        categories.forEach(async (cat) => {
            const lastViewed = localStorage.getItem(`last_visit_${cat.id}`) || new Date(0).toISOString();
            const { count, error } = await sb.from(cat.table).select('*', { count: 'exact', head: true }).gt('created_at', lastViewed);
            if (!error && count > 0) {
                const dot = document.getElementById(`dot-${cat.id}`);
                if (dot) dot.style.display = 'block';
            }
        });
    } catch (e) { console.error("Erreur badges:", e); }
}

async function loadTicker() {
    try {
        if (sessionStorage.getItem('ticker_hidden')) return;
        const { data: tickerData } = await sb.from('app_settings').select('value').eq('id', 'ticker_message').single();
        if (tickerData && tickerData.value.trim() !== "") {
            const ticker = document.createElement('div');
            ticker.id = 'ticker-bar';
            ticker.className = 'ticker-container';
            ticker.innerHTML = `
                <div class="ticker-text">
                    ${tickerData.value} &nbsp;&nbsp;&nbsp;&nbsp; • &nbsp;&nbsp;&nbsp;&nbsp; ${tickerData.value}
                </div>
                <button onclick="document.getElementById('ticker-bar').remove(); sessionStorage.setItem('ticker_hidden', 'true')" class="ticker-close">✕</button>
            `;
            document.body.appendChild(ticker);
        }
    } catch (e) { console.error("Erreur ticker:", e); }
}

function setupScrollTop() {
    if (document.getElementById('scrollTop')) return;
    const scrollBtn = document.createElement('button');
    scrollBtn.id = 'scrollTop';
    scrollBtn.innerHTML = '⬆️';
    scrollBtn.className = 'fixed bottom-28 right-6 shadow-2xl rounded-full w-12 h-12 flex items-center justify-center z-50 transition-all duration-300 opacity-0 invisible scale-50 border border-gray-100';
    scrollBtn.style.backgroundColor = 'white';
    document.body.appendChild(scrollBtn);
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            scrollBtn.classList.remove('opacity-0', 'invisible', 'scale-50');
            scrollBtn.classList.add('opacity-100', 'visible', 'scale-100');
        } else {
            scrollBtn.classList.add('opacity-0', 'invisible', 'scale-50');
            scrollBtn.classList.remove('opacity-100', 'visible', 'scale-100');
        }
    });
    scrollBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
}

function hapticFeedback() { if (window.navigator?.vibrate) window.navigator.vibrate(15); }
