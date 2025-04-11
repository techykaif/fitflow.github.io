function toggleMenu() {
    const menuBar = document.getElementById('tooltip');

    if (menuBar.style.display === 'flex') {
        menuBar.style.display = 'none';
    } else {
        menuBar.style.display = 'flex';

        // Wait for Firebase auth to resolve
        window.authReady?.then(() => {
            const isUserLoggedIn = window.isUserLoggedIn || false;

            if (isUserLoggedIn) {
                let retryCount = 0;

                function tryHideAuthLinks() {
                    const loginLinks = document.querySelectorAll("#tooltip ol li a[href='login.html']");
                    const signupLinks = document.querySelectorAll("#tooltip ol li a[href='signup.html']");

                    if (loginLinks.length > 0 || signupLinks.length > 0) {
                        loginLinks.forEach(el => el.parentElement && (el.parentElement.style.display = "none"));
                        signupLinks.forEach(el => el.parentElement && (el.parentElement.style.display = "none"));
                    } else if (retryCount < 10) {
                        retryCount++;
                        setTimeout(tryHideAuthLinks, 50);
                    }
                }

                tryHideAuthLinks();
            }
        });
    }
}

// Tooltip logic
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

// Hide menu when clicking outside
document.addEventListener('click', function (event) {
    const menuBar = document.getElementById('tooltip');
    const menuToggle = document.querySelector('.menu-toggle');

    if (!menuBar.contains(event.target) && !menuToggle.contains(event.target)) {
        menuBar.style.display = 'none';
    }
});

// Prevent clicking the toggle button from closing the menu
document.querySelector('.menu-toggle').addEventListener('click', function (event) {
    event.stopPropagation();
});
