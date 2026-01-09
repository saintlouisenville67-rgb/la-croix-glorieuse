// 1. CHARGEMENT AUTO DE LA LIBRAIRIE D'ICÔNES
const scriptLucide = document.createElement('script');
scriptLucide.src = 'https://unpkg.com/lucide@latest';
scriptLucide.onload = () => { if (window.lucide) lucide.createIcons(); };
document.head.appendChild(scriptLucide);

// 2. STYLES (CORRESPONDANCE PARFAITE AVEC STYLE.CSS)
const styleNav = document.createElement('style');
styleNav.innerHTML = `
    @keyframes activePulse { 0% { transform: scale(1); } 50% { transform: scale(1.12); } 100% { transform: scale(1); } }
    
    /* On anime l'enveloppe de l'icône pour un effet propre */
    .nav-item.active .nav-icon-wrapper { 
        animation: activePulse 2s infinite ease-in-out; 
        display: inline-block; 
    }

    .nav-icon-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 2px;
    }

    .nav-indicator { 
        position: absolute; 
        bottom: -10px; 
        width: 4px; 
        height: 4px; 
        background-color: #b91c1c; 
        border-radius: 50%; 
    }

    .badge-dot { 
        position: absolute; 
        top: -2px; 
        right: -4px; 
        width: 10px; 
        height: 10px; 
        background-color: #ef4444; 
        border-radius: 50%; 
        border: 2px solid white; 
        display: none; 
    }

    /* Harmonisation avec le mode sombre de style.css */
    @media (prefers-color-scheme: dark) {
        .badge-dot { border-color: #1e293b; }
    }

    .bottom-nav { min-height: 80px; display: flex; align-items: center; justify-content: space-around; }
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
    
    // Injection du contenu (Structure préservée)
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

    // Important : déclencher le rendu des icônes après injection
    if (window.lucide) lucide.createIcons();

    // Lancement des fonctions satellites
    updateBadges(); 
    loadTicker();
    setupScrollTop();
}

// Lancement automatique
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    loadMenu();
} else {
    document.addEventListener('DOMContentLoaded', loadMenu);
}

// --- FONCTIONS DE GESTION (STRICTEMENT IDENTIQUES À TON ORIGINAL) ---

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
                <div class="ticker-text">${tickerData.value} &nbsp;&nbsp; • &nbsp;&nbsp; ${tickerData.value}</div>
                <button onclick="document.getElementById('ticker-bar').remove(); sessionStorage.setItem('ticker_hidden', 'true')" class="ticker-close">✕</button>
            `;
            document.body.appendChild(ticker);
        }
    } catch (e) { }
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
