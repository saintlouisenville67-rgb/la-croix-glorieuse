async function loadMenu() {
    const nav = document.querySelector('.bottom-nav');
    if (!nav) return;

    // 1. STYLES VISUELS (Pulse, Badges, Indicateur)
    if (!document.getElementById('nav-enhanced-style')) {
        const style = document.createElement('style');
        style.id = 'nav-enhanced-style';
        style.innerHTML = `
            @keyframes activePulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.12); }
                100% { transform: scale(1); }
            }
            .nav-item.active span:first-child { 
                animation: activePulse 2s infinite ease-in-out;
                display: inline-block;
            }
            .nav-indicator {
                position: absolute; bottom: 8px; width: 4px; height: 4px;
                background-color: #b91c1c; border-radius: 50%;
            }
            .badge-dot {
                position: absolute; top: -2px; right: -4px;
                width: 10px; height: 10px; background-color: #ef4444;
                border-radius: 50%; border: 2px solid var(--card-light);
                box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
                display: none;
            }
        `;
        document.head.appendChild(style);
    }

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
    
    nav.innerHTML = menuItems.map(item => {
        const isActive = currentPath === item.href;
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

    updateBadges(); 
    loadTicker();
    setupScrollTop();
}

// GESTION DES ALERTES : Disparition au clic et stockage de la lecture
function markAsRead(id) {
    const dot = document.getElementById(`dot-${id}`);
    if (dot) {
        dot.style.display = 'none'; // Disparition visuelle immédiate
    }
    // On enregistre que l'utilisateur a consulté cette section à cet instant précis
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
            // On récupère la date propre à chaque catégorie (ou une date très ancienne par défaut)
            const lastViewed = localStorage.getItem(`last_visit_${cat.id}`) || new Date(0).toISOString();

            const { count, error } = await sb
                .from(cat.table)
                .select('*', { count: 'exact', head: true })
                .gt('created_at', lastViewed);

            if (!error && count > 0) {
                const dot = document.getElementById(`dot-${cat.id}`);
                if (dot) dot.style.display = 'block';
            }
        });
    } catch (e) { console.error("Erreur badges:", e); }
}

// --- Les autres fonctions (loadTicker, setupScrollTop, hapticFeedback) restent strictement identiques ---

async function loadTicker() {
    try {
        if (sessionStorage.getItem('ticker_hidden')) return;
        const { data: tickerData } = await sb.from('app_settings').select('value').eq('id', 'ticker_message').single();
        if (tickerData && tickerData.value.trim() !== "") {
            if (!document.getElementById('ticker-style')) {
                const style = document.createElement('style');
                style.id = 'ticker-style';
                style.innerHTML = `
                    @keyframes scrollTicker { 0% { transform: translateX(100vw); } 100% { transform: translateX(-100%); } }
                    .ticker-container {
                        position: fixed; bottom: 95px; left: 12px; right: 12px; 
                        width: calc(100% - 24px); background: var(--primary-gradient);
                        color: white; height: 38px; z-index: 99; border-radius: 12px; 
                        box-shadow: 0 8px 20px rgba(185, 28, 28, 0.3);
                        font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.8px;
                        overflow: hidden; display: flex; align-items: center; border: 1px solid rgba(255,255,255,0.15);
                    }
                    .ticker-text { white-space: nowrap; display: inline-block; animation: scrollTicker 25s linear infinite; padding-right: 50px; }
                    .ticker-close { position: absolute; right: 8px; background: rgba(0,0,0,0.25); border: none; border-radius: 8px; width: 26px; height: 26px; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; }
                `;
                document.head.appendChild(style);
            }
            const ticker = document.createElement('div');
            ticker.id = 'ticker-bar';
            ticker.className = 'ticker-container';
            ticker.innerHTML = `
                <div class="ticker-text">${tickerData.value} &nbsp;&nbsp; • &nbsp;&nbsp; ${tickerData.value}</div>
                <button onclick="document.getElementById('ticker-bar').remove(); sessionStorage.setItem('ticker_hidden', 'true')" class="ticker-close">✕</button>
            `;
            document.body.appendChild(ticker);
        }
    } catch (e) { console.error("Bandeau non disponible"); }
}

function setupScrollTop() {
    if (document.getElementById('scrollTop')) return;
    const scrollBtn = document.createElement('button');
    scrollBtn.id = 'scrollTop';
    scrollBtn.innerHTML = '⬆️';
    scrollBtn.className = 'fixed bottom-28 right-6 shadow-2xl rounded-full w-12 h-12 flex items-center justify-center z-50 transition-all duration-300 opacity-0 invisible scale-50 border border-gray-100 dark:border-slate-700';
    scrollBtn.style.backgroundColor = 'var(--card-light)';
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

document.addEventListener('DOMContentLoaded', loadMenu);
