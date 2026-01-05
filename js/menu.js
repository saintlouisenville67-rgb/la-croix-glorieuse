/**
 * Configuration du menu et des fonctions UX globales
 */

function loadMenu() {
    const nav = document.querySelector('.bottom-nav');
    if (!nav) return;

    // 1. Liste des onglets (Mise à jour avec Annonces)
    const menuItems = [
        { href: 'index.html', icon: '🏠', label: 'Accueil' },
        { href: 'annonces.html', icon: '📢', label: 'Annonces' },
        { href: 'agenda.html', icon: '📅', label: 'Agenda' },
        { href: 'priere.html', icon: '🕯️', label: 'Prières' },
        { href: 'contact.html', icon: '✉️', label: 'Contact' }
    ];

    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    // 2. Génération du HTML du menu avec support des badges textuels
    nav.innerHTML = menuItems.map(item => `
        <a href="${item.href}" class="nav-item ${currentPath === item.href ? 'active' : ''} relative" onclick="hapticFeedback()">
            <span class="block text-lg">${item.icon}</span>
            ${item.label}
            <span id="badge-${item.label.toLowerCase()}" class="hidden absolute -top-1 -right-4 bg-red-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full animate-bounce uppercase">
                Nouveau
            </span>
        </a>
    `).join('');

    // 3. Injection du bouton "Retour en haut" s'il n'existe pas
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
 * Fonction globale pour le retour vibratoire (Haptic Feedback)
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
