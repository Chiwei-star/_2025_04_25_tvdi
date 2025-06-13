document.addEventListener('DOMContentLoaded', function() {
    // Set current year in the footer
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // You can add more footer-specific JavaScript here if needed in the future
    console.log("Footer JS loaded and current year set.");
});