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