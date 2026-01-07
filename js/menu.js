/**
 * Configuration du menu et des fonctions UX globales
 */

async function loadMenu() {
    const nav = document.querySelector('.bottom-nav');
    if (!nav) return;

    // --- LOGIQUE DU BANDEAU DÉROULANT (TICKER) ---
    try {
        const { data: tickerData } = await sb.from('app_settings').select('value').eq('id', 'ticker_message').single();
        
        // On affiche uniquement si un texte existe et n'a pas été masqué durant la session
        if (tickerData && tickerData.value.trim() !== "" && !sessionStorage.getItem('ticker_hidden')) {
            
            // 1. Injection du style CSS pour l'élégance et l'animation
            if (!document.getElementById('ticker-style')) {
                const style = document.createElement('style');
                style.id = 'ticker-style';
                style.innerHTML = `
                    @keyframes scrollTicker {
                        0% { transform: translateX(100%); }
                        100% { transform: translateX(-100%); }
                    }
                    .ticker-container {
                        position: fixed;
                        bottom: 65px; /* Juste au-dessus du menu */
                        left: 0;
                        width: 100%;
                        background: rgba(15, 23, 42, 0.95); /* Ardoise foncée semi-transparente */
                        backdrop-filter: blur(8px);
                        color: #fbbf24; /* Ambre pour la lisibilité */
                        padding: 10px 0;
                        z-index: 40;
                        font-size: 11px;
                        font-weight: 900;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                        overflow: hidden;
                        display: flex;
                        align-items: center;
                        border-top: 1px solid rgba(251, 191, 36, 0.3);
                        box-shadow: 0 -4px 15px rgba(0,0,0,0.2);
                    }
                    .ticker-text {
                        white-space: nowrap;
                        display: inline-block;
                        animation: scrollTicker 18s linear infinite;
                        padding-right: 100%; /* Espace pour la boucle */
                    }
                    .ticker-close {
                        position: absolute;
                        right: 10px;
                        background: rgba(255, 255, 255, 0.1);
                        color: white;
                        border-radius: 50%;
                        width: 20px;
                        height: 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 10px;
                        z-index: 50;
                        cursor: pointer;
                        border: none;
                    }
                `;
                document.head.appendChild(style);
            }

            // 2. Création et insertion du bandeau dans le DOM
            const ticker = document.createElement('div');
            ticker.id = 'ticker-bar';
            ticker.className = 'ticker-container';
            ticker.innerHTML = `
                <div class="ticker-text">${tickerData.value} &nbsp;&nbsp; • &nbsp;&nbsp; ${tickerData.value}</div>
                <button onclick="document.getElementById('ticker-bar').remove(); sessionStorage.setItem('ticker_hidden', 'true')" class="ticker-close">✕</button>
            `;
            nav.parentNode.insertBefore(ticker, nav);
        }
    } catch (e) {
        console.error("Erreur bandeau:", e);
    }
    // --- FIN LOGIQUE BANDEAU ---

    // 1. Liste des onglets
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

    // 2. Génération du HTML du menu
    nav.innerHTML = menuItems.map(item => `
        <a href="${item.href}" class="nav-item ${currentPath === item.href ? 'active' : ''} relative" onclick="hapticFeedback()">
            <span class="block text-lg">${item.icon}</span>
            ${item.label}
            <span id="badge-${item.label.toLowerCase()}" class="hidden absolute -top-1 -right-4 bg-red-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full animate-bounce uppercase">
                Nouveau
            </span>
        </a>
    `).join('');

    // 3. Injection du bouton "Retour en haut"
    if (!document.getElementById('scrollTop')) {
        const scrollBtn = document.createElement('button');
        scrollBtn.id = 'scrollTop';
        scrollBtn.innerHTML = '⬆️';
        scrollBtn.className = 'fixed bottom-24 right-6 bg-white dark:bg-slate-800 shadow-xl rounded-full w-12 h-12 flex items-center justify-center border border-slate-100 dark:border-slate-700 z-50 transition-all duration-300 opacity-0 invisible translate-y-4';
        document.body.appendChild(scrollBtn);

        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                scrollBtn.classList.remove('opacity-0', 'invisible', 'translate-y-4');
                scrollBtn.classList.add('opacity-100', 'visible', 'translate-y-0');
            } else {
                scrollBtn.classList.add('opacity-0', 'invisible', 'translate-y-4');
                scrollBtn.classList.remove('opacity-100', 'visible', 'translate-y-0');
            }
        });

        scrollBtn.onclick = () => {
            hapticFeedback();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
    }
}

/**
 * Fonction globale pour le retour vibratoire
 */
function hapticFeedback(intensity = 15) {
    if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(intensity);
    }
}

/**
 * Lancement automatique du menu
 */
document.addEventListener('DOMContentLoaded', loadMenu);
