// ------------header------------ //
document.addEventListener('DOMContentLoaded', function () {
    const navToggle = document.querySelector('.nav-toggle');
    const mainNavigation = document.querySelector('.main-navigation');

    if (navToggle && mainNavigation) {
        navToggle.addEventListener('click', function () {
            // Toggle 'active' class on the navigation menu
            mainNavigation.classList.toggle('active');

            // Toggle 'active' class on the hamburger button itself (for icon animation)
            navToggle.classList.toggle('active');

            // Update ARIA attribute for accessibility
            const isExpanded = mainNavigation.classList.contains('active');
            navToggle.setAttribute('aria-expanded', isExpanded);
        });
    }
});

// ------------footer------------ //
document.addEventListener('DOMContentLoaded', function () {
    // Set current year in the footer
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // You can add more footer-specific JavaScript here if needed in the future
    console.log("Footer JS loaded and current year set.");
});