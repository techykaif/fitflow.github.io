function toggleMenu() {
    const menuBar = document.getElementById('tooltip');

    // Toggle menu visibility
    if (menuBar.style.display === 'flex') {
        menuBar.style.display = 'none';
    } else {
        menuBar.style.display = 'flex';

        // Debugging: Check if authentication flag is correctly set
        console.log("Menu opened. Checking authentication...");
        console.log("window.isUserLoggedIn:", window.isUserLoggedIn);

        let isUserLoggedIn = window.isUserLoggedIn || false; // Default to false if not set

        if (isUserLoggedIn) {
            setTimeout(() => { // Delay to ensure elements exist in the DOM
                console.log("User is logged in. Attempting to hide login/signup buttons...");

                let loginLinks = document.querySelectorAll("#tooltip ol li a[href='login.html']");
                let signupLinks = document.querySelectorAll("#tooltip ol li a[href='signup.html']");

                console.log("Login buttons found:", loginLinks.length);
                console.log("Signup buttons found:", signupLinks.length);

                loginLinks.forEach(el => {
                    if (el.parentElement) {
                        el.parentElement.style.display = "none";
                        console.log("Hiding login button:", el.parentElement);
                    }
                });

                signupLinks.forEach(el => {
                    if (el.parentElement) {
                        el.parentElement.style.display = "none";
                        console.log("Hiding signup button:", el.parentElement);
                    }
                });

            }, 200); // Small delay ensures dynamic elements exist
        }
    }
}

// Tooltips for navigation links
const navLinks = document.querySelectorAll('#nav-menu a');
navLinks.forEach(link => {
    link.addEventListener('mouseenter', (e) => {
        const tooltip = document.createElement('div');
        tooltip.className = 'custom-tooltip';
        tooltip.textContent = link.getAttribute('title');
        document.body.appendChild(tooltip);

        // Position the tooltip
        tooltip.style.left = `${e.pageX}px`;
        tooltip.style.top = `${e.pageY + 30}px`;
    });

    link.addEventListener('mouseleave', () => {
        document.querySelector('.custom-tooltip').remove();
    });
});

// Hide menu when clicking outside
document.addEventListener('click', function (event) {
    const menuBar = document.getElementById('tooltip');
    const menuToggle = document.querySelector('.menu-toggle');

    // Hide menu if clicked outside
    if (!menuBar.contains(event.target) && !menuToggle.contains(event.target)) {
        menuBar.style.display = 'none';
    }
});

// Prevent clicking the toggle button from closing the menu
document.querySelector('.menu-toggle').addEventListener('click', function (event) {
    event.stopPropagation();
});
