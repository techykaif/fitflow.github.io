function toggleMenu() {
    const menuBar = document.getElementById('tooltip');

    // Toggle between 'flex' and 'none' display for the menu
    if (menuBar.style.display === 'flex') {
        menuBar.style.display = 'none';
    } else {
        menuBar.style.display = 'flex';
    }
}
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
// Function to hide the menu when clicking outside
document.addEventListener('click', function (event) {
    const menuBar = document.getElementById('tooltip');
    const menuToggle = document.querySelector('.menu-toggle');

    // Check if the click is outside the menu and toggle button
    if (!menuBar.contains(event.target) && !menuToggle.contains(event.target)) {
        menuBar.style.display = 'none'; // Hide the menu
    }
});

// Optional: Ensure clicking the toggle button doesn't close the menu
document.querySelector('.menu-toggle').addEventListener('click', function (event) {
    event.stopPropagation(); // Prevent the click from propagating to the document
});