/**
 * Configuration du menu et des fonctions UX globales
 * Version Optimisée : Fluidité Maximale
 */

async function loadMenu() {
    const nav = document.querySelector('.bottom-nav');
    if (!nav) return;

    // 1. AFFICHAGE IMMÉDIAT DU MENU (Priorité n°1 pour la fluidité)
    const menuItems = [
        { href: 'index.html', icon: '🏠', label: 'Accueil' },
        { href: 'annonces.html', icon: '📢', label: 'Annonces' },
        { href: 'entraide.html', icon: '🤝', label: 'Entraide' },
        { href: 'agenda.html', icon: '📅', label: 'Agenda' },
        { href: 'priere.html', icon: '🕯️', label: 'Prières' },
        { href: 'groupes.html', icon: '👥', label: 'Groupes' },
        { href: 'don.html', icon: '❤️', label: 'Don' },
        { href: 'contact.html', icon: '✉️', label: 'Contact' }
    ];

    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    nav.innerHTML = menuItems.map(item => `
        <a href="${item.href}" class="nav-item ${currentPath === item.href ? 'active' : ''} relative" onclick="hapticFeedback()">
            <span class="block text-lg">${item.icon}</span>
            ${item.label}
        </a>
    `).join('');

    // 2. LANCEMENT DU BANDEAU EN ARRIÈRE-PLAN (Ne bloque pas l'affichage)
    displayTicker();

    // 3. BOUTON RETOUR EN HAUT (Lazy loading)
    setupScrollButton();
}

async function displayTicker() {
    if (sessionStorage.getItem('ticker_hidden')) return;

    try {
        // Timeout de 3 secondes pour ne pas ralentir l'appli si connexion lente
        const { data: tickerData, error } = await sb.from('app_settings')
            .select('value')
            .eq('id', 'ticker_message')
            .single();
        
        if (error || !tickerData || !tickerData.value.trim()) return;

        // Injection du CSS
        if (!document.getElementById('ticker-style')) {
            const style = document.createElement('style');
            style.id = 'ticker-style';
            style.innerHTML = `
                @keyframes scrollTicker {
                    0% { transform: translateX(100vw); }
                    100% { transform: translateX(-100%); }
                }
                .ticker-container {
                    position: fixed; bottom: 80px; left: 0; width: 100%;
                    background: #b91c1c; color: white; height: 32px; z-index: 9999; 
                    font-size: 10px; font-weight: 900; text-transform: uppercase;
                    overflow: hidden; display: flex; align-items: center;
                    box-shadow: 0 -4px 10px rgba(0,0,0,0.1); pointer-events: auto;
                }
                .ticker-text {
                    white-space: nowrap; display: inline-block;
                    animation: scrollTicker 30s linear infinite; padding-right: 50px;
                }
                .ticker-close {
                    position: absolute; right: 8px; background: rgba(0,0,0,0.3);
                    color: white; border: none; border-radius: 6px; width: 24px; height: 24px;
                    display: flex; align-items: center; justify-content: center; cursor: pointer;
                }
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

    } catch (e) { console.error("Bandeau non disponible"); }
}

function setupScrollButton() {
    if (document.getElementById('scrollTop')) return;
    const btn = document.createElement('button');
    btn.id = 'scrollTop';
    btn.innerHTML = '⬆️';
    btn.className = 'fixed bottom-24 right-6 bg-white shadow-xl rounded-full w-12 h-12 flex items-center justify-center border border-slate-100 z-50 transition-all opacity-0 invisible';
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            btn.classList.replace('opacity-0', 'opacity-100');
            btn.classList.replace('invisible', 'visible');
        } else {
            btn.classList.replace('opacity-100', 'opacity-0');
            btn.classList.replace('visible', 'invisible');
        }
    });
    btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
}

function hapticFeedback() {
    if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(15);
}

document.addEventListener('DOMContentLoaded', loadMenu);
