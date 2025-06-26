// index.js - 用於特定頁面功能（如橫幅等）的 JavaScript。

document.addEventListener('DOMContentLoaded', function () {
    // ------------橫幅------------ //
    const sliderContainer = document.querySelector('.banner-slider');

    // 如果橫幅容器存在，則初始化橫幅邏輯
    if (sliderContainer) {
        const slidesWrapper = sliderContainer.querySelector('.slides-wrapper');
        const slides = sliderContainer.querySelectorAll('.slide');
        const prevBtn = sliderContainer.querySelector('.prev-btn');
        const nextBtn = sliderContainer.querySelector('.next-btn');
        const dotsContainer = sliderContainer.querySelector('.dots-container');

        // 確保所有必要的橫幅內部元素都存在
        if (slidesWrapper && slides.length > 0 && prevBtn && nextBtn && dotsContainer) {
            let currentIndex = 0;
            const totalSlides = slides.length;
            const AUTOPLAY_DELAY = 5000; // 定義自動播放延遲時間為常數

            // 創建指示點
            for (let i = 0; i < totalSlides; i++) {
                const dot = document.createElement('span');
                dot.classList.add('dot');
                dot.addEventListener('click', () => {
                    showSlide(i);
                });
                dotsContainer.appendChild(dot);
            }
            const dots = dotsContainer.querySelectorAll('.dot');
            if (dots.length > 0) { // 確保在存取之前指示點存在
                dots[0].classList.add('active');
            }

            function updateDots(index) {
                if (dots.length > 0 && dots[index]) { // 確保指示點和特定的指示點存在
                    dots.forEach(dot => dot.classList.remove('active'));
                    dots[index].classList.add('active');
                }
            }

            function showSlide(index) {
                if (slides.length === 0) return; // 如果沒有幻燈片則退出

                // 邊界檢查
                if (index >= totalSlides) {
                    currentIndex = 0;
                } else if (index < 0) {
                    currentIndex = totalSlides - 1;
                } else {
                    currentIndex = index;
                }

                slides.forEach(s => s.classList.remove('active'));
                if (slides[currentIndex]) { // 確保 currentIndex 處的幻燈片存在
                    slides[currentIndex].classList.add('active');
                }
                updateDots(currentIndex);
            }

            nextBtn.addEventListener('click', () => {
                showSlide(currentIndex + 1);
            });

            prevBtn.addEventListener('click', () => {
                showSlide(currentIndex - 1);
            });

            // 自動播放
            let autoPlayInterval;
            function startAutoPlay() { // 移除 delay 參數，使用常數 AUTOPLAY_DELAY
                stopAutoPlay(); // 清除現有的間隔
                autoPlayInterval = setInterval(() => {
                    showSlide(currentIndex + 1);
                }, AUTOPLAY_DELAY); // 使用定義好的常數延遲時間
            }

            function stopAutoPlay() {
                clearInterval(autoPlayInterval);
            }

            startAutoPlay();

            // 滑鼠懸停時暫停自動播放
            sliderContainer.addEventListener('mouseenter', stopAutoPlay);
            sliderContainer.addEventListener('mouseleave', startAutoPlay);

            // 初始化第一張幻燈片
            showSlide(0);
        } else {
            // console.warn("橫幅初始化失敗：一個或多個橫幅內部元素缺失。");
        }
    } else {
        // console.log("在此頁面上找不到橫幅滑塊容器。跳過 index.js 的橫幅初始化。");
    }
});