document.addEventListener('DOMContentLoaded', function () {
    const slidesWrapper = document.querySelector('.slides-wrapper');
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const dotsContainer = document.querySelector('.dots-container');

    let currentIndex = 0;
    const totalSlides = slides.length;

    // 設定 wrapper 寬度
    // slidesWrapper.style.width = `${totalSlides * 100}%`;
    // 每個 slide 的寬度已在 CSS 中用 calc(100% / 3) 設定，這裡不需要再動態設定

    // 創建小圓點
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        dot.addEventListener('click', () => {
            showSlide(i);
        });
        dotsContainer.appendChild(dot);
    }
    const dots = document.querySelectorAll('.dot');
    dots[0].classList.add('active'); // 初始化第一個點為 active

    function updateDots(index) {
        dots.forEach(dot => dot.classList.remove('active'));
        dots[index].classList.add('active');
    }

    function showSlide(index) {
        // 邊界處理
        if (index >= totalSlides) {
            currentIndex = 0;
        } else if (index < 0) {
            currentIndex = totalSlides - 1;
        } else {
            currentIndex = index;
        }

        const offset = -currentIndex * (100 / totalSlides); // 計算位移百分比
        slidesWrapper.style.transform = `translateX(${offset}%)`;
        updateDots(currentIndex);
    }

    nextBtn.addEventListener('click', () => {
        showSlide(currentIndex + 1);
    });

    prevBtn.addEventListener('click', () => {
        showSlide(currentIndex - 1);
    });

    // 可選：自動播放
    let autoPlayInterval;
    function startAutoPlay(delay = 5000) { // 預設5秒切換一次
        stopAutoPlay(); // 先停止，避免重複啟動
        autoPlayInterval = setInterval(() => {
            showSlide(currentIndex + 1);
        }, delay);
    }

    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }

    // 啟動自動播放
    startAutoPlay();

    // 可選：滑鼠移入時停止自動播放，移出時恢復
    const sliderContainer = document.querySelector('.banner-slider');
    sliderContainer.addEventListener('mouseenter', stopAutoPlay);
    sliderContainer.addEventListener('mouseleave', startAutoPlay);


    // 初始化第一張幻燈片
    showSlide(0);
});