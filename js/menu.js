async function loadMenu() {
    const nav = document.querySelector('.bottom-nav');
    if (!nav) return;

    // 1. ON AFFICHE LE MENU TOUT DE SUITE (Fluidité totale)
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

    // 2. ON CHARGE LE BANDEAU EN ARRIÈRE-PLAN
    loadTicker();

    // 3. BOUTON RETOUR EN HAUT
    setupScrollTop();
}

async function loadTicker() {
    try {
        if (sessionStorage.getItem('ticker_hidden')) return;

        const { data: tickerData } = await sb.from('app_settings').select('value').eq('id', 'ticker_message').single();
        
        if (tickerData && tickerData.value.trim() !== "") {
            // Injection du CSS
            if (!document.getElementById('ticker-style')) {
                const style = document.createElement('style');
                style.id = 'ticker-style';
                style.innerHTML = `
                    @keyframes scrollTicker { 0% { transform: translateX(100vw); } 100% { transform: translateX(-100%); } }
                    .ticker-container {
                        position: fixed; bottom: 80px; left: 0; width: 100%;
                        background: #b91c1c; color: white; height: 32px; z-index: 999; 
                        font-size: 10px; font-weight: 900; text-transform: uppercase;
                        overflow: hidden; display: flex; align-items: center;
                    }
                    .ticker-text { white-space: nowrap; display: inline-block; animation: scrollTicker 30s linear infinite; padding-right: 50px; }
                    .ticker-close { position: absolute; right: 8px; background: rgba(0,0,0,0.3); color: white; border: none; border-radius: 6px; width: 24px; height: 24px; cursor: pointer; }
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
    scrollBtn.className = 'fixed bottom-24 right-6 bg-white shadow-xl rounded-full w-12 h-12 flex items-center justify-center z-50 transition-all opacity-0 invisible';
    document.body.appendChild(scrollBtn);
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) { scrollBtn.classList.remove('opacity-0', 'invisible'); scrollBtn.classList.add('opacity-100', 'visible'); }
        else { scrollBtn.classList.add('opacity-0', 'invisible'); scrollBtn.classList.remove('opacity-100', 'visible'); }
    });
    scrollBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
}

function hapticFeedback() { if (window.navigator?.vibrate) window.navigator.vibrate(15); }

document.addEventListener('DOMContentLoaded', loadMenu);
