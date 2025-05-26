document.addEventListener('DOMContentLoaded', function () {
    const track = document.querySelector('.homes-for-you-section__carousel-track');
    const cards = Array.from(track.children);
    const nextButton = document.querySelector('.carousel-arrow--next');
    const prevButton = document.querySelector('.carousel-arrow--prev');
    const paginationContainer = document.querySelector('.carousel-pagination');

    let itemsPerView = getItemsPerView();
    let cardWidth = cards.length > 0 ? cards[0].getBoundingClientRect().width : 0;
    const cardGap = parseFloat(getComputedStyle(track).gap) || 30; // 從 CSS 獲取 gap 值

    let currentIndex = 0;
    let totalPages = Math.ceil(cards.length / itemsPerView);

    function getItemsPerView() {
        if (window.innerWidth < 576) {
            return 1;
        } else if (window.innerWidth < 992) {
            return 2;
        } else {
            return 3;
        }
    }

    function updateCarouselDimensions() {
        itemsPerView = getItemsPerView();
        totalPages = Math.ceil(cards.length / itemsPerView);

        // 更新卡片寬度，考慮到可能的 gap
        // 輪播軌道的容器寬度
        const trackContainerWidth = track.parentElement.getBoundingClientRect().width;

        if (itemsPerView === 1) {
            // 在小屏幕上，卡片宽度可能接近100%，减去一些边距
            // cardWidth = trackContainerWidth - 20; // 假设左右各有10px边距
            // 使用第一張卡片的實際寬度，因為CSS中可能已設定
            if (cards.length > 0) {
                // For mobile, flex-basis might be calc(100% - 20px), so we use that directly.
                // Or, we calculate based on track container and assume minimal padding for the card itself.
                // This needs to align with CSS for mobile.
                // Let's assume CSS handles the card width correctly via flex-basis.
                // The cardWidth from getBoundingClientRect() should be used.
                cardWidth = cards[0].getBoundingClientRect().width;
            }

        } else {
            // 对于多张卡片，宽度是 (容器宽度 - (n-1)*gap) / n
            cardWidth = (trackContainerWidth - (itemsPerView - 1) * cardGap) / itemsPerView;
        }


        cards.forEach(card => {
            // CSS already handles this with flex-basis, but ensure JS logic aligns if fixed widths are needed
            // card.style.flexBasis = `${cardWidth}px`; // This might conflict with complex flex-basis in CSS
        });


        // Update cardWidth to actual rendered width of a card for translation calculation
        if (cards.length > 0) {
            cardWidth = cards[0].getBoundingClientRect().width;
        }


        createPaginationDots();
        updateCarousel();
        updateArrowVisibility();
    }


    function createPaginationDots() {
        paginationContainer.innerHTML = ''; // 清空舊的指示點
        if (totalPages <= 1) return; // 如果只有一頁或沒有內容，則不顯示分頁

        for (let i = 0; i < totalPages; i++) {
            const dot = document.createElement('button');
            dot.classList.add('carousel-pagination__dot');
            dot.setAttribute('aria-label', `Go to page ${i + 1}`);
            if (i === currentIndex) {
                dot.classList.add('carousel-pagination__dot--active');
            }
            dot.addEventListener('click', () => {
                currentIndex = i;
                updateCarousel();
            });
            paginationContainer.appendChild(dot);
        }
    }

    function updateCarousel() {
        // 計算位移量時，要考慮卡片寬度和間距
        // 每移動一組卡片，位移的距離是 (卡片寬度 + 卡片間距) * 每頁顯示的卡片數量
        // 但是因為 track 是 flex 容器，translateX 的計算應該是基於 (單個卡片寬度 + gap) * itemsPerView * currentIndex
        // 更準確地說，是滑動到第 `currentIndex` 頁時，該頁第一張卡片應該在的位置

        // 每次滑動的總寬度 (包含卡片本身和它右邊的 gap)
        const slideWidth = (cardWidth + cardGap) * itemsPerView;
        // 當 itemsPerView 為 1 時，手機屏幕上 track 內只有一個 card，gap 不在卡片之間，而在卡片和 track 邊緣
        // 因此，位移應該是卡片寬度 + CSS中定義的間距（如果有的話）
        let offset = 0;
        if (itemsPerView === 1 && cards.length > 0) {
            // 假設在手機上，卡片是幾乎佔滿 track (減去左右padding)
            // 位移是 (卡片寬度 + 固定的 track padding 或 card margin) * index
            // 此處的 cardGap 是指卡片之間的間距，在單卡片顯示時，這個間距邏輯不同
            // 我們需要的是移動一張卡片的距離
            // 如果 CSS 中卡片有 margin-left/right 來使其居中，那麼 translateX 需要考慮這個
            const cardContainerWidth = cards[0].offsetWidth; // 包括 padding, border
            const trackPaddingLeft = parseFloat(getComputedStyle(track).paddingLeft) || 0;
            const cardMarginLeft = parseFloat(getComputedStyle(cards[0]).marginLeft) || 0;

            // offset = currentIndex * (cardContainerWidth + cardGap); // cardGap is not applicable here like this
            // The translation should be by multiples of (card width + the gap that separates it from the next card in the track)
            // For itemsPerView = 1, each card effectively forms a "page".
            // The distance to move is the width of one card PLUS the gap to its right.
            // However, if the cards are `flex-basis: calc(100% - 20px)` and `margin: 0 10px`,
            // then the track effectively has cards laid out with 20px gaps.
            // The translateX should move by the width of one "slot" which is cardWidth + effectiveGap.
            // The `cardGap` from `getComputedStyle(track).gap` is the gap *between* flex items.
            offset = currentIndex * (cardWidth + cardGap);
            if (currentIndex > 0 && itemsPerView === 1) {
                // For mobile, if using margin on cards for spacing, the first card might not need initial offset by gap
                // This part becomes tricky if CSS `gap` is 0 for mobile and spacing is done by card margins.
                // Let's assume `cardGap` is correctly set or 0 for mobile, and `cardWidth` is the full width of one item's visual space.
            }


        } else {
            offset = currentIndex * (itemsPerView * cardWidth + (itemsPerView - 1) * cardGap + cardGap);
            // Simpler: each "page" is `itemsPerView` cards wide, plus `itemsPerView` gaps
            // (or itemsPerView cardWidths + (itemsPerView-1) inter-card gaps, then this whole block shifts)
            // The total width of one page view: (itemsPerView * cardWidth) + ((itemsPerView - 1) * cardGap)
            // The amount to translate is currentIndex * (width of one "page" view + one cardGap to move to the next "page")
            // No, it's simpler: just move by the start of the current page.
            // The start of page `currentIndex` is at `currentIndex * itemsPerView` card index.
            // So, `currentIndex * itemsPerView * (cardWidth + cardGap)` should be correct, minus one `cardGap` at the end of track.
            offset = currentIndex * itemsPerView * (cardWidth + cardGap);

        }


        track.style.transform = `translateX(-${offset}px)`;

        const dots = paginationContainer.querySelectorAll('.carousel-pagination__dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('carousel-pagination__dot--active', index === currentIndex);
        });
        updateArrowVisibility();
    }

    function updateArrowVisibility() {
        if (!prevButton || !nextButton) return;
        prevButton.classList.toggle('disabled', currentIndex === 0);
        nextButton.classList.toggle('disabled', currentIndex >= totalPages - 1 || totalPages === 0);
    }


    nextButton.addEventListener('click', () => {
        if (currentIndex < totalPages - 1) {
            currentIndex++;
            updateCarousel();
        }
    });

    prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    window.addEventListener('resize', () => {
        // Throttling resize event listener for performance
        clearTimeout(window.resizeTimer);
        window.resizeTimer = setTimeout(() => {
            const oldItemsPerView = itemsPerView;
            const newItemsPerView = getItemsPerView();

            if (oldItemsPerView !== newItemsPerView) {
                // If items per view changes, recalculate current index to keep current items in view if possible
                // For simplicity, reset to a logical page or first page if structure changes significantly
                // Find the first card index of the current view
                const firstCardInViewIndex = currentIndex * oldItemsPerView;
                // Recalculate currentIndex based on new itemsPerView
                currentIndex = Math.floor(firstCardInViewIndex / newItemsPerView);
                currentIndex = Math.min(currentIndex, Math.ceil(cards.length / newItemsPerView) - 1); // ensure it's not out of bounds
                currentIndex = Math.max(0, currentIndex); // ensure it's not negative
            }
            updateCarouselDimensions();
        }, 250);
    });

    // Initial setup
    if (cards.length > 0) {
        updateCarouselDimensions(); // Call this to set initial dimensions and pagination
    } else {
        // Handle case with no cards
        paginationContainer.innerHTML = '';
        updateArrowVisibility(); // Arrows should be disabled
    }
});