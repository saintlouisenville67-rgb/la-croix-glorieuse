// 1. CHARGEMENT AUTO DE LA LIBRAIRIE D'ICÔNES (LUCIDE)
const scriptLucide = document.createElement('script');
scriptLucide.src = 'https://unpkg.com/lucide@latest';
scriptLucide.onload = () => { if (window.lucide) lucide.createIcons(); };
document.head.appendChild(scriptLucide);

// 2. STYLES COMPLETS (NAVIGATION + POPUP TEXTE PUR)
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
    }

    /* Style du Menu */
    .bottom-nav { min-height: 80px; display: flex; align-items: center; justify-content: space-around; }

    /* --- STYLES DU POPUP ÉPURÉ --- */
    .popup-overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    }
    .popup-overlay.active {
        opacity: 1;
        visibility: visible;
    }
    .popup-card {
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        width: 80%;
        max-width: 320px;
        padding: 40px 25px 25px 25px;
        border-radius: 30px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        text-align: center;
        transform: translateY(20px);
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .popup-overlay.active .popup-card {
        transform: translateY(0);
    }
    .popup-message {
        font-size: 17px;
        color: #1e293b;
        line-height: 1.6;
        font-weight: 600;
        margin-bottom: 30px;
        white-space: pre-wrap; /* Respecte les sauts de ligne si besoin */
    }
    .popup-btn {
        background: #1e293b;
        color: white;
        border: none;
        padding: 14px;
        border-radius: 18px;
        font-weight: 700;
        font-size: 15px;
        cursor: pointer;
        width: 100%;
        transition: opacity 0.2s;
    }
    .popup-btn:active { opacity: 0.8; }
    
    @media (prefers-color-scheme: dark) { 
        .popup-card { background: rgba(30, 41, 59, 0.9); border-color: rgba(255, 255, 255, 0.1); }
        .popup-message { color: white; }
        .popup-btn { background: white; color: #1e293b; }
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
        if (sessionStorage.getItem('popup_viewed')) return;

        const { data: tickerData } = await sb.from('app_settings').select('value').eq('id', 'ticker_message').single();
        
        if (tickerData && tickerData.value.trim() !== "") {
            const overlay = document.createElement('div');
            overlay.id = 'app-popup';
            overlay.className = 'popup-overlay';
            overlay.innerHTML = `
                <div class="popup-card">
                    <div class="popup-message">${tickerData.value}</div>
                    <button class="popup-btn" onclick="closePopup()">Continuer</button>
                </div>
            `;
            document.body.appendChild(overlay);
            setTimeout(() => overlay.classList.add('active'), 100);
        }
    } catch (e) { console.error("Erreur popup:", e); }
}

function closePopup() {
    const overlay = document.getElementById('app-popup');
    if (overlay) {
        overlay.classList.remove('active');
        sessionStorage.setItem('popup_viewed', 'true');
        setTimeout(() => overlay.remove(), 400);
    }
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
