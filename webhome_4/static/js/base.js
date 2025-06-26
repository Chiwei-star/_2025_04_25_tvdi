// base.js - JavaScript for base template elements (header, footer, etc.)

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
    } else {
        // Optional: You can add console warnings if elements are not found,
        // which might indicate an issue with the base.html structure.
        // if (!navToggle) console.warn("Header: .nav-toggle element not found in base.html.");
        // if (!mainNavigation) console.warn("Header: .main-navigation element not found in base.html.");
    }
});

// ------------footer------------ //
document.addEventListener('DOMContentLoaded', function () {
    // Set current year in the footer
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    } else {
        // Optional: Console warning if the year span is not found.
        // console.warn("Footer: #current-year element not found in base.html.");
    }
});