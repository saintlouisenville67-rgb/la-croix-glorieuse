function loadMenu() {
    const nav = document.querySelector('.bottom-nav');
    if (!nav) return;

    // Définissez vos liens ici une seule fois
    const menuItems = [
        { href: 'index.html', icon: '🏠', label: 'Accueil' },
        { href: 'agenda.html', icon: '📅', label: 'Agenda' },
        { href: 'groupes.html', icon: '💬', label: 'Groupes' },
        { href: 'contact.html', icon: '✉️', label: 'Contact' }
    ];

    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    nav.innerHTML = menuItems.map(item => `
        <a href="${item.href}" class="nav-item ${currentPath === item.href ? 'active' : ''}">
            <span class="block text-lg">${item.icon}</span>
            ${item.label}
        </a>
    `).join('');
}

// Exécuter au chargement
document.addEventListener('DOMContentLoaded', loadMenu);
