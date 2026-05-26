/* ==========================================================================
   INTERACTIVE JAVASCRIPT - VELAS COMESTÍVEIS GOURMET
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('js-enhanced');
    initCountdownTimer();
    scheduleNonCriticalWork(initFaqAccordion);
    scheduleNonCriticalWork(initScrollReveal);
    scheduleNonCriticalWork(initLazyBeforeAfterSlider);
});

function scheduleNonCriticalWork(task) {
    if ('requestIdleCallback' in window) {
        requestIdleCallback(task, { timeout: 2500 });
        return;
    }

    setTimeout(task, 1);
}

/**
 * 1. COUNTDOWN TIMER WITH LOCALSTORAGE PERSISTENCE
 */
function initCountdownTimer() {
    const minutesDisplay = document.getElementById('minutes');
    const secondsDisplay = document.getElementById('seconds');
    
    if (!minutesDisplay || !secondsDisplay) return;

    const TIMER_DURATION_MS = 15 * 60 * 1000; // 15 Minutes
    let targetTime = localStorage.getItem('velas_gourmet_target_time');
    const now = new Date().getTime();

    // If no timer exists, or the existing timer has expired, set a new target
    if (!targetTime || parseInt(targetTime) < now) {
        targetTime = now + TIMER_DURATION_MS;
        localStorage.setItem('velas_gourmet_target_time', targetTime.toString());
    } else {
        targetTime = parseInt(targetTime);
    }

    function updateTimer() {
        const currentTime = new Date().getTime();
        let difference = targetTime - currentTime;

        if (difference <= 0) {
            // Timer expired. For optimal user experience and marketing, reset it to another 15 minutes
            const newTarget = currentTime + TIMER_DURATION_MS;
            localStorage.setItem('velas_gourmet_target_time', newTarget.toString());
            targetTime = newTarget;
            difference = TIMER_DURATION_MS;
        }

        const totalSeconds = Math.floor(difference / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        // Display with leading zero
        minutesDisplay.textContent = minutes < 10 ? '0' + minutes : minutes;
        secondsDisplay.textContent = seconds < 10 ? '0' + seconds : seconds;
    }

    // Run once immediately and then every second
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
}

/**
 * 2. FAQ ACCORDION TOGGLING
 */
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const trigger = item.querySelector('.faq-trigger');
        const content = item.querySelector('.faq-content');

        if (!trigger || !content) return;

        trigger.addEventListener('click', () => {
            const isOpen = item.classList.contains('active');

            // Close all other FAQ items for a clean UX
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    const otherContent = otherItem.querySelector('.faq-content');
                    if (otherContent) otherContent.style.maxHeight = null;
                    const otherTrigger = otherItem.querySelector('.faq-trigger');
                    if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
                }
            });

            // Toggle current FAQ item
            if (isOpen) {
                item.classList.remove('active');
                content.style.maxHeight = null;
                trigger.setAttribute('aria-expanded', 'false');
            } else {
                item.classList.add('active');
                content.style.maxHeight = content.scrollHeight + 'px';
                trigger.setAttribute('aria-expanded', 'true');
            }
        });
    });
}

/**
 * 3. BEFORE & AFTER INTERACTIVE SLIDER (DRAG AND TOUCH SUPPORT)
 */
function initLazyBeforeAfterSlider() {
    const slider = document.getElementById('before-after-slider');
    if (!slider) return;

    if (!('IntersectionObserver' in window)) {
        initBeforeAfterSlider();
        return;
    }

    const sliderObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            initBeforeAfterSlider();
            observer.disconnect();
        });
    }, {
        rootMargin: '300px 0px',
        threshold: 0.01
    });

    sliderObserver.observe(slider);
}

function initBeforeAfterSlider() {
    const slider = document.getElementById('before-after-slider');
    const afterContainer = document.getElementById('after-img-container');
    const handle = document.getElementById('slider-handle');

    if (!slider || !afterContainer || !handle || slider.dataset.initialized === 'true') return;
    slider.dataset.initialized = 'true';

    const afterImage = afterContainer.querySelector('img');
    let isDragging = false;

    // Dynamically adjust the inner image size to match the slider container width
    // This prevents image scaling distortions when resizing the window
    function resizeImages() {
        const sliderWidth = slider.offsetWidth;
        if (afterImage) {
            afterImage.style.width = sliderWidth + 'px';
        }
    }

    resizeImages();
    window.addEventListener('resize', resizeImages);
    setSliderPosition(50);
    handle.addEventListener('mousedown', (e) => {
        isDragging = true;
        slider.classList.add('dragging');
        e.preventDefault();
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            slider.classList.remove('dragging');
        }
    });

    // Handle touch events for mobile compatibility
    handle.addEventListener('touchstart', (e) => {
        isDragging = true;
        slider.classList.add('dragging');
    }, { passive: true });

    window.addEventListener('touchend', () => {
        if (isDragging) {
            isDragging = false;
            slider.classList.remove('dragging');
        }
    });

    // Move handlers
    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        moveSlider(e.clientX);
    });

    window.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        if (e.touches && e.touches.length > 0) {
            moveSlider(e.touches[0].clientX);
        }
    }, { passive: true });

    function moveSlider(clientX) {
        const sliderRect = slider.getBoundingClientRect();
        const sliderWidth = sliderRect.width;
        
        // Calculate relative position within the container bounds
        let positionX = clientX - sliderRect.left;
        
        // Boundaries restriction
        if (positionX < 0) positionX = 0;
        if (positionX > sliderWidth) positionX = sliderWidth;

        // Convert to percentage
        const percentage = (positionX / sliderWidth) * 100;
        setSliderPosition(percentage);
    }

    function setSliderPosition(percentage) {
        handle.style.left = percentage + '%';
        afterContainer.style.width = percentage + '%';
    }
}

/**
 * 4. SCROLL REVEAL ANIMATIONS
 */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');

    if (!('IntersectionObserver' in window)) {
        // Fallback for older browsers: show all immediately
        revealElements.forEach(el => el.classList.add('active'));
        return;
    }

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Triggers when 15% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Trigger only once
            }
        });
    }, observerOptions);

    revealElements.forEach(element => {
        observer.observe(element);
    });
}
