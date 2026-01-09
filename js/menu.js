// 1. DÉMARRAGE ULTRA-RAPIDE
// On n'attend pas la fin du chargement de la page pour préparer les styles
const styleNav = document.createElement('style');
styleNav.innerHTML = `
    @keyframes activePulse { 0% { transform: scale(1); } 50% { transform: scale(1.12); } 100% { transform: scale(1); } }
    .nav-item.active span:first-child { animation: activePulse 2s infinite ease-in-out; display: inline-block; }
    .nav-indicator { position: absolute; bottom: 8px; width: 4px; height: 4px; background-color: #b91c1c; border-radius: 50%; }
    .badge-dot { position: absolute; top: -2px; right: -4px; width: 10px; height: 10px; background-color: #ef4444; border-radius: 50%; border: 2px solid white; display: none; }
    /* Empêcher le saut visuel : on force la hauteur du nav même s'il est vide */
    .bottom-nav { min-height: 80px; display: flex; align-items: center; justify-content: space-around; background: white; }
`;
document.head.appendChild(styleNav);

async function loadMenu() {
    const nav = document.querySelector('.bottom-nav');
    if (!nav) return;

    const menuItems = [
        { href: 'index.html', icon: '🏠', label: 'Accueil', id: 'home' },
        { href: 'annonces.html', icon: '📢', label: 'Annonces', id: 'annonces' },
        { href: 'entraide.html', icon: '🤝', label: 'Entraide', id: 'entraide' },
        { href: 'agenda.html', icon: '📅', label: 'Agenda', id: 'agenda' },
        { href: 'priere.html', icon: '🕯️', label: 'Prières', id: 'priere' },
        { href: 'groupes.html', icon: '👥', label: 'Groupes', id: 'groupes' },
        { href: 'don.html', icon: '❤️', label: 'Don', id: 'don' },
        { href: 'contact.html', icon: '✉️', label: 'Contact', id: 'contact' }
    ];

    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    
    // Injection immédiate du contenu
    nav.innerHTML = menuItems.map(item => {
        const isActive = (currentPath === item.href) || (currentPath === "" && item.href === "index.html");
        return `
            <a href="${item.href}" 
               class="nav-item ${isActive ? 'active' : ''}" 
               onclick="hapticFeedback(); markAsRead('${item.id}')">
                <div class="relative">
                    <span style="font-size: 20px; margin-bottom: 2px; display: block;">${item.icon}</span>
                    <div id="dot-${item.id}" class="badge-dot"></div>
                </div>
                ${item.label}
                ${isActive ? '<div class="nav-indicator"></div>' : ''}
            </a>
        `;
    }).join('');

    // Fonctions secondaires lancées juste après
    updateBadges(); 
    loadTicker();
    setupScrollTop();
}

// 2. L'ASTUCE : Lancer la fonction le plus tôt possible
// On n'attend pas 'DOMContentLoaded' si le document est déjà prêt ou presque
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    loadMenu();
} else {
    document.addEventListener('DOMContentLoaded', loadMenu);
}

// --- Tes fonctions de gestion (Gardées intactes) ---

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
