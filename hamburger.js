function toggleMenu() {
    const menuBar = document.getElementById('tooltip');

    if (menuBar.style.display === 'flex') {
        menuBar.style.display = 'none';
    } else {
        menuBar.style.display = 'flex';

        // Wait for Firebase auth to resolve
        window.authReady?.then(() => {
            if (window.isUserLoggedIn) {
                hideAuthLinksInMenu('#tooltip ol li a');
            }
        });
    }
}

// 🔄 Hide login/signup links inside given selector (nav menu or tooltip)
function hideAuthLinksInMenu(selectorPrefix) {
    const loginLinks = document.querySelectorAll(`${selectorPrefix}[href='login.html']`);
    const signupLinks = document.querySelectorAll(`${selectorPrefix}[href='signup.html']`);

    if (loginLinks.length > 0 || signupLinks.length > 0) {
        loginLinks.forEach(el => el.parentElement && (el.parentElement.style.display = "none"));
        signupLinks.forEach(el => el.parentElement && (el.parentElement.style.display = "none"));
    } else {
        console.warn("Auth links not found in", selectorPrefix);
    }
}

// 🧠 Tooltip hover logic
const navLinks = document.querySelectorAll('#nav-menu a');
navLinks.forEach(link => {
    link.addEventListener('mouseenter', (e) => {
        const tooltip = document.createElement('div');
        tooltip.className = 'custom-tooltip';
        tooltip.textContent = link.getAttribute('title');
        document.body.appendChild(tooltip);

        tooltip.style.left = `${e.pageX}px`;
        tooltip.style.top = `${e.pageY + 30}px`;
    });

    link.addEventListener('mouseleave', () => {
        document.querySelector('.custom-tooltip')?.remove();
    });
});

// 📦 Close menu when clicking outside
document.addEventListener('click', function (event) {
    const menuBar = document.getElementById('tooltip');
    const menuToggle = document.querySelector('.menu-toggle');

    if (!menuBar.contains(event.target) && !menuToggle.contains(event.target)) {
        menuBar.style.display = 'none';
    }
});

// ✋ Prevent closing when clicking toggle
document.querySelector('.menu-toggle').addEventListener('click', function (event) {
    event.stopPropagation();
});
