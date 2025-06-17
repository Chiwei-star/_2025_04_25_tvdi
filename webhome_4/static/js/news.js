// JavaScript (同第 5 節內容)
document.addEventListener('DOMContentLoaded', function () {
    const accordionItems = document.querySelectorAll('.accordion-item');
    function openAccordionItem(header, content) {
        header.classList.add('active');
        header.setAttribute('aria-expanded', 'true');
        content.classList.add('show');
        content.setAttribute('aria-hidden', 'false');
    }

    function closeAccordionItem(header, content) {
        header.classList.remove('active');
        header.setAttribute('aria-expanded', 'false');
        content.classList.remove('show');
        content.setAttribute('aria-hidden', 'true');
    }

    accordionItems.forEach((item, index) => {
        const header = item.querySelector('.accordion-header');
        const content = item.querySelector('.accordion-content');
        // ARIA IDs are assumed to be set by HTML (as in this example) or Jinja.
        // Initialize all items as closed (CSS handles max-height: 0 via .accordion-content)
        // No need to directly set content.style.maxHeight here.
        header.addEventListener('click', () => {
            const isActive = header.classList.contains('active');
            if (isActive) { closeAccordionItem(header, content); } else { openAccordionItem(header, content); }
        });
    });
});