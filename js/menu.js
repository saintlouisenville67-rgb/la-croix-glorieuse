/**
 * Configuration du menu et des fonctions UX globales
 */

function loadMenu() {
    const nav = document.querySelector('.bottom-nav');
    if (!nav) return;

    // 1. Liste des onglets
    const menuItems = [
        { href: 'index.html', icon: '🏠', label: 'Accueil' },
        { href: 'agenda.html', icon: '📅', label: 'Agenda' },
        { href: 'priere.html', icon: '🕯️', label: 'Prières' },
        { href: 'groupes.html', icon: '💬', label: 'Groupes' },
        { href: 'contact.html', icon: '✉️', label: 'Contact' }
    ];

    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    // 2. Génération du HTML du menu
    nav.innerHTML = menuItems.map(item => `
        <a href="${item.href}" class="nav-item ${currentPath === item.href ? 'active' : ''}" onclick="hapticFeedback()">
            <span class="block text-lg">${item.icon}</span>
            ${item.label}
        </a>
    `).join('');

    // 3. Injection du bouton "Retour en haut" s'il n'existe pas
    if (!document.getElementById('scrollTop')) {
        const scrollBtn = document.createElement('button');
        scrollBtn.id = 'scrollTop';
        scrollBtn.innerHTML = '⬆️';
        scrollBtn.className = 'fixed bottom-24 right-6 bg-white dark:bg-slate-800 shadow-xl rounded-full w-12 h-12 flex items-center justify-center z-50 transition-all duration-300 opacity-0 invisible translate-y-4';
        document.body.appendChild(scrollBtn);

        // Logique d'affichage au scroll
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
 * Utilisable partout : hapticFeedback()
 */
function hapticFeedback(intensity = 15) {
    if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(intensity);
    }
}

/**
 * Fonction globale pour le partage natif
 * Utilisable partout : shareApp('Titre', 'Texte')
 */
function shareApp(title, text) {
    hapticFeedback(30);
    if (navigator.share) {
        navigator.share({
            title: title,
            text: text,
            url: window.location.href
        }).catch(() => {});
    } else {
        // Fallback WhatsApp si le partage natif n'est pas dispo
        const url = `https://wa.me/?text=${encodeURIComponent(title + " : " + text + " " + window.location.href)}`;
        window.open(url, '_blank');
    }
}

// Lancement au chargement du document
document.addEventListener('DOMContentLoaded', loadMenu);
