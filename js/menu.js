// 1. CHARGEMENT AUTO DE LA LIBRAIRIE D'ICÔNES (LUCIDE)
const scriptLucide = document.createElement('script');
scriptLucide.src = 'https://unpkg.com/lucide@latest';
scriptLucide.onload = () => { if (window.lucide) lucide.createIcons(); };
document.head.appendChild(scriptLucide);

// 2. STYLES COMPLETS (NAVIGATION + BANDEAU DÉFILANT HARMONISÉ + ANIMATIONS)
const styleNav = document.createElement('style');
styleNav.innerHTML = `
    /* Animation de l'icône active */
    @keyframes activePulse { 0% { transform: scale(1); } 50% { transform: scale(1.12); } 100% { transform: scale(1); } }
    .nav-item.active .nav-icon-wrapper { animation: activePulse 2s infinite ease-in-out; display: inline-block; }

    /* Structure des icônes et badges */
    .nav-icon-wrapper { position: relative; display: flex; align-items: center; justify-content: center; margin-bottom: 2px; }
    .nav-indicator { position: absolute; bottom: -10px; width: 4px; height: 4px; background-color: #b91c1c; border-radius: 50%; }
    .badge-dot { position: absolute; top: -2px; right: -4px; width: 10px; height: 10px; background-color: #ef4444; border-radius: 50%; border: 2px solid white; display: none; }
    
    @media (prefers-color-scheme: dark) { .badge-dot { border-color: #1e293b; } }

    /* Style du Menu pour éviter le saut visuel */
    .bottom-nav { min-height: 80px; display: flex; align-items: center; justify-content: space-around; }

    /* --- STYLES DU BANDEAU DÉFILANT (TICKER) HARMONISÉ --- */
    .ticker-container {
        position: fixed;
        top: 12px;
        left: 12px;
        right: 12px;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        color: #1e293b;
        z-index: 1000;
        height: 40px;
        display: flex;
        align-items: center;
        overflow: hidden;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        border-radius: 12px;
        border: 1px solid rgba(226, 232, 240, 0.8);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
    .ticker-container::before {
        content: "📢";
        padding-left: 12px;
        padding-right: 8px;
        z-index: 1002;
    }
    .ticker-text {
        white-space: nowrap;
        display: inline-block;
        padding-left: 100%;
        animation: tickerMove 30s linear infinite;
    }
    @keyframes tickerMove {
        0% { transform: translate3d(0, 0, 0); }
        100% { transform: translate3d(-100%, 0, 0); }
    }
    .ticker-close {
        padding: 0 12px;
        background: none;
        border: none;
        color: #94a3b8;
        font-size: 16px;
        cursor: pointer;
        z-index: 1002;
        margin-left: auto;
    }
`;
document.head.appendChild(styleNav);

async function loadMenu() {
    const nav = document.querySelector('.bottom-nav');
    if (!nav) return;

    // Configuration des icônes Lucide
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
    
    // Injection du HTML du menu
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

    // Rendu des icônes Lucide
    if (window.lucide) lucide.createIcons();

    // Lancement des fonctions satellites (Badges, Ticker, Scroll)
    updateBadges(); 
    loadTicker();
    setupScrollTop();
}

// Lancement automatique au chargement
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    loadMenu();
} else {
    document.addEventListener('DOMContentLoaded', loadMenu);
}

// --- FONCTIONS DE GESTION (INTACTES) ---

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
                    ${tickerData.value} &nbsp;&nbsp;&nbsp;&nbsp; • &nbsp;&nbsp;&nbsp;&nbsp; ${tickerData.value} &nbsp;&nbsp;&nbsp;&nbsp; • &nbsp;&nbsp;&nbsp;&nbsp; ${tickerData.value}
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
