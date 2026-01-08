/**
 * Configuration du menu et des fonctions UX globales
 */

async function loadMenu() {
    const nav = document.querySelector('.bottom-nav');
    if (!nav) return;

    // 1. LISTE DES ONGLETS
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

    // 2. GÉNÉRATION DU HTML DU MENU (Affiché immédiatement pour la fluidité)
    nav.innerHTML = menuItems.map(item => `
        <a href="${item.href}" class="nav-item ${currentPath === item.href ? 'active' : ''} relative" onclick="hapticFeedback()">
            <span class="block text-lg">${item.icon}</span>
            ${item.label}
            <span id="badge-${item.label.toLowerCase()}" class="hidden absolute -top-1 -right-4 bg-red-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full animate-bounce uppercase">
                Nouveau
            </span>
        </a>
    `).join('');

    // 3. LANCEMENT DU BANDEAU DÉROULANT (En arrière-plan)
    initTicker();

    // 4. INJECTION DU BOUTON "RETOUR EN HAUT"
    initScrollButton();
}

// Fonction séparée pour ne pas bloquer loadMenu
async function initTicker() {
    try {
        const { data: tickerData } = await sb.from('app_settings').select('value').eq('id', 'ticker_message').single();
        
        if (tickerData && tickerData.value.trim() !== "" && !sessionStorage.getItem('ticker_hidden')) {
            if (!document.getElementById('ticker-style')) {
                const style = document.createElement('style');
                style.id = 'ticker-style';
                style.innerHTML = `
                    @keyframes scrollTicker {
                        0% { transform: translateX(100vw); }
                        100% { transform: translateX(-100%); }
                    }
                    .ticker-container {
                        position: fixed;
                        bottom: 80px; 
                        left: 0;
                        width: 100%;
                        background: #b91c1c; 
                        color: white;
                        height: 32px;
                        z-index: 1000; 
                        font-size: 10px;
                        font-weight: 900;
                        text-transform: uppercase;
                        letter-spacing: 0.1em;
                        overflow: hidden;
                        display: flex;
                        align-items: center;
                        box-shadow: 0 -4px 10px rgba(0,0,0,0.1);
                        border-bottom: 1px solid rgba(255,255,255,0.1);
                    }
                    .ticker-text {
                        white-space: nowrap;
                        display: inline-block;
                        animation: scrollTicker 30s linear infinite;
                        padding-right: 50px;
                        will-change: transform;
                    }
                    .ticker-close {
                        position: absolute;
                        right: 8px;
                        top: 50%;
                        transform: translateY(-50%);
                        background: rgba(0, 0, 0, 0.3);
                        color: white;
                        border: none;
                        border-radius: 6px;
                        width: 24px;
                        height: 24px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 10px;
                        cursor: pointer;
                        z-index: 1001;
                    }
                    @media (prefers-color-scheme: dark) {
                        .ticker-container { background: #7f1d1d; }
                    }
                `;
                document.head.appendChild(style);
            }

            const ticker = document.createElement('div');
            ticker.id = 'ticker-bar';
            ticker.className = 'ticker-container';
            ticker.innerHTML = `
                <div class="ticker-text">${tickerData.value} &nbsp;&nbsp;&nbsp;&nbsp; • &nbsp;&nbsp;&nbsp;&nbsp; ${tickerData.value} &nbsp;&nbsp;&nbsp;&nbsp; • &nbsp;&nbsp;&nbsp;&nbsp; ${tickerData.value}</div>
                <button onclick="document.getElementById('ticker-bar').remove(); sessionStorage.setItem('ticker_hidden', 'true')" class="ticker-close">✕</button>
            `;
            document.body.appendChild(ticker);
        }
    } catch (e) {
        console.error("Erreur bandeau:", e);
    }
}

function initScrollButton() {
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

function hapticFeedback(intensity = 15) {
    if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(intensity);
    }
}

document.addEventListener('DOMContentLoaded', loadMenu);
