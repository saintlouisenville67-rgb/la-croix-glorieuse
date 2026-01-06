/**
 * Configuration du menu et des fonctions UX globales
 */

function loadMenu() {
    const nav = document.querySelector('.bottom-nav');
    if (!nav) return;

    // 1. Liste des onglets (Mise à jour avec Entraide et Annonces)
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

    // Configuration du conteneur pour l'effet de roue
    nav.style.display = 'flex';
    nav.style.overflowX = 'auto';
    nav.style.perspective = '1000px';
    nav.style.alignItems = 'center';
    nav.style.paddingTop = '10px';
    nav.style.paddingBottom = '10px';
    // Masquer la barre de défilement pour une meilleure immersion
    nav.style.scrollbarWidth = 'none'; // Firefox
    nav.classList.add('scrollbar-hide');

    // 2. Génération du HTML du menu avec support des badges textuels et structure 3D
    nav.innerHTML = menuItems.map(item => `
        <a href="${item.href}" 
           class="nav-item-wheel flex-shrink-0 relative flex flex-col items-center justify-center transition-all duration-200 ease-out ${currentPath === item.href ? 'active' : ''}" 
           style="min-width: 90px; transform-style: preserve-3d;"
           onclick="hapticFeedback()">
            <span class="block text-2xl mb-1 transition-transform duration-300 ${currentPath === item.href ? 'scale-125' : ''}">
                ${item.icon}
            </span>
            <span class="text-[10px] font-bold uppercase tracking-tight ${currentPath === item.href ? 'text-blue-500' : 'opacity-70'}">
                ${item.label}
            </span>
            <span id="badge-${item.label.toLowerCase()}" class="hidden absolute -top-1 -right-2 bg-red-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full animate-bounce uppercase">
                Nouveau
            </span>
            ${currentPath === item.href ? '<div class="absolute -bottom-2 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>' : ''}
        </a>
    `).join('');

    // Fonction interne pour calculer et appliquer l'effet de rotation/profondeur
    const applyWheelEffect = () => {
        const items = nav.querySelectorAll('.nav-item-wheel');
        const navRect = nav.getBoundingClientRect();
        const centerX = navRect.left + navRect.width / 2;

        items.forEach(item => {
            const itemRect = item.getBoundingClientRect();
            const itemCenter = itemRect.left + itemRect.width / 2;
            
            // Distance relative au centre de l'écran (-1 à gauche, 0 au milieu, 1 à droite)
            const distance = (itemCenter - centerX) / (navRect.width / 2);
            const absDistance = Math.abs(distance);

            // Calcul des transformations dynamiques
            const rotateY = distance * -35; // Inclinaison
            const translateZ = absDistance * -120; // Profondeur (s'éloigne sur les bords)
            const scale = 1 - (absDistance * 0.25); // Taille
            const opacity = 1 - (absDistance * 0.5); // Transparence

            item.style.transform = `rotateY(${rotateY}deg) translateZ(${translateZ}px) scale(${scale})`;
            item.style.opacity = opacity;
        });
    };

    // Écouteur de scroll pour l'effet dynamique
    nav.addEventListener('scroll', applyWheelEffect);
    // Initialisation immédiate au chargement
    setTimeout(applyWheelEffect, 50);

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
