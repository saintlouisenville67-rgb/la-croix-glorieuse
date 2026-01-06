/**
 * Configuration du menu et des fonctions UX globales
 * Version : Roue 3D Infinie et Fluide
 */

function loadMenu() {
    const nav = document.querySelector('.bottom-nav');
    if (!nav) return;

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

    // Configuration du conteneur pour la fluidité et le snap
    nav.style.display = 'flex';
    nav.style.overflowX = 'auto';
    nav.style.perspective = '1000px';
    nav.style.alignItems = 'center';
    nav.style.scrollSnapType = 'x mandatory'; 
    nav.style.scrollbarWidth = 'none';
    nav.classList.add('scrollbar-hide');

    // 1. Fonction de génération d'item (pour faciliter le clonage)
    const createItemHTML = (item) => {
        const isActive = currentPath === item.href;
        return `
            <a href="${item.href}" 
               class="nav-item-wheel flex-shrink-0 relative flex flex-col items-center justify-center py-2" 
               style="min-width: 70px; transform-style: preserve-3d; scroll-snap-align: center;"
               onclick="hapticFeedback()">
                <span class="block text-2xl mb-1 transition-transform duration-300 ${isActive ? 'scale-125' : ''}">
                    ${item.icon}
                </span>
                <span class="text-[9px] font-bold uppercase tracking-tighter ${isActive ? 'text-blue-500' : 'opacity-60'}">
                    ${item.label}
                </span>
                ${isActive ? '<div class="absolute -bottom-1 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>' : ''}
            </a>
        `;
    };

    // 2. Création de la boucle infinie (Clonage début et fin)
    const menuHTML = menuItems.map(item => createItemHTML(item)).join('');
    nav.innerHTML = menuHTML + menuHTML + menuHTML; // On triple le contenu pour l'illusion d'infini

    // Positionner au centre au démarrage
    const centerInitial = () => {
        const itemWidth = 70;
        nav.scrollLeft = itemWidth * menuItems.length;
    };

    // 3. Logique de l'effet "Roue" et gestion de la boucle
    const handleScroll = () => {
        const items = nav.querySelectorAll('.nav-item-wheel');
        const navRect = nav.getBoundingClientRect();
        const centerX = navRect.left + navRect.width / 2;
        const itemWidth = 70;
        const totalWidth = itemWidth * menuItems.length;

        // Effet visuel de roue
        items.forEach(item => {
            const itemRect = item.getBoundingClientRect();
            const itemCenter = itemRect.left + itemRect.width / 2;
            const distance = (itemCenter - centerX) / (navRect.width / 2);
            const absDistance = Math.abs(distance);

            const rotateY = distance * -40; 
            const translateZ = absDistance * -150; 
            const scale = 1 - (absDistance * 0.3);
            const opacity = 1 - (absDistance * 0.7);

            item.style.transform = `rotateY(${rotateY}deg) translateZ(${translateZ}px) scale(${scale})`;
            item.style.opacity = opacity;
        });

        // Gestion de la boucle infinie sans saut visuel
        if (nav.scrollLeft <= 0) {
            nav.scrollLeft = totalWidth;
        } else if (nav.scrollLeft >= nav.scrollWidth - navRect.width) {
            nav.scrollLeft = totalWidth;
        }
    };

    nav.addEventListener('scroll', handleScroll);
    setTimeout(() => {
        centerInitial();
        handleScroll();
    }, 10);

    // 4. Bouton Retour en haut (Inchangé mais présent)
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
