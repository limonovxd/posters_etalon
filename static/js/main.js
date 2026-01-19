// Обработчики для кнопок меню

function handleGeneralTest() {
    window.location.href = '/general-test';
}

function handleSubjectTest() {
    window.location.href = '/subject-test';
}

function handleLifehacks() {
    window.location.href = '/lifehacks';
}

// Анимация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.container');
    if (container) {
        container.style.opacity = '0';
        container.style.transform = 'translateY(20px)';
        container.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        setTimeout(() => {
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        }, 100);
    }
});

// Swipe handling for lifehacks page
function initSwipeHandling() {
    const card = document.getElementById('lifehackCard');
    if (!card) return;
    
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let isDragging = false;
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID;
    let currentIndex = 0;
    
    const minSwipeDistance = 50;
    const maxDragDistance = 150;
    
    // Get current position from UI
    function getCurrentIndex() {
        const indexEl = document.getElementById('currentIndex');
        const totalEl = document.getElementById('totalCount');
        if (indexEl && totalEl) {
            return {
                current: parseInt(indexEl.textContent) - 1,
                total: parseInt(totalEl.textContent)
            };
        }
        return { current: 0, total: 30 };
    }
    
    function getPositionByIndex(index) {
        return -index * card.offsetWidth;
    }
    
    // Touch events
    card.addEventListener('touchstart', touchStart, { passive: true });
    card.addEventListener('touchmove', touchMove, { passive: false });
    card.addEventListener('touchend', touchEnd, { passive: true });
    
    // Mouse events for desktop testing
    card.addEventListener('mousedown', mouseDown);
    card.addEventListener('mousemove', mouseMove);
    card.addEventListener('mouseup', mouseUp);
    card.addEventListener('mouseleave', mouseUp);
    
    function touchStart(event) {
        touchStartX = event.changedTouches[0].screenX;
        touchStartY = event.changedTouches[0].screenY;
        isDragging = true;
        startX = touchStartX;
        prevTranslate = currentTranslate;
        cancelAnimationFrame(animationID);
    }
    
    function touchMove(event) {
        if (!isDragging) return;
        
        const touch = event.changedTouches[0];
        touchEndX = touch.screenX;
        touchEndY = touch.screenY;
        
        // Calculate distance
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        
        // Only handle horizontal swipes (ignore if mostly vertical)
        if (Math.abs(deltaY) > Math.abs(deltaX)) return;
        
        event.preventDefault();
        
        // Apply drag
        currentTranslate = prevTranslate + deltaX;
        
        // Limit drag distance
        if (Math.abs(currentTranslate) > maxDragDistance) {
            currentTranslate = currentTranslate > 0 ? maxDragDistance : -maxDragDistance;
        }
        
        setTransform(currentTranslate);
    }
    
    function touchEnd(event) {
        if (!isDragging) return;
        isDragging = false;
        
        const touch = event.changedTouches[0];
        touchEndX = touch.screenX;
        touchEndY = touch.screenY;
        
        handleSwipeEnd();
    }
    
    function mouseDown(event) {
        isDragging = true;
        startX = event.clientX;
        prevTranslate = currentTranslate;
        cancelAnimationFrame(animationID);
        card.style.cursor = 'grabbing';
    }
    
    function mouseMove(event) {
        if (!isDragging) return;
        
        const deltaX = event.clientX - startX;
        
        // Apply drag
        currentTranslate = prevTranslate + deltaX;
        
        // Limit drag distance
        if (Math.abs(currentTranslate) > maxDragDistance) {
            currentTranslate = currentTranslate > 0 ? maxDragDistance : -maxDragDistance;
        }
        
        setTransform(currentTranslate);
    }
    
    function mouseUp(event) {
        if (!isDragging) return;
        isDragging = false;
        card.style.cursor = 'grab';
        
        handleSwipeEnd();
    }
    
    function handleSwipeEnd() {
        const { current, total } = getCurrentIndex();
        const deltaX = touchEndX - startX;
        
        // Reset position with animation
        if (deltaX < -minSwipeDistance && current < total - 1) {
            // Swipe left - next card
            animateToPosition(getPositionByIndex(current + 1), current + 1);
        } else if (deltaX > minSwipeDistance && current > 0) {
            // Swipe right - previous card
            animateToPosition(getPositionByIndex(current - 1), current - 1);
        } else {
            // Snap back
            animateToPosition(getPositionByIndex(current), current);
        }
    }
    
    function setTransform(translate) {
        card.style.transform = `translateX(${translate}px)`;
        
        // Add visual feedback based on swipe direction
        const { current, total } = getCurrentIndex();
        if (translate < -10 && current < total - 1) {
            card.style.opacity = 1 - Math.abs(translate) / 300;
        } else if (translate > 10 && current > 0) {
            card.style.opacity = 1 - Math.abs(translate) / 300;
        } else {
            card.style.opacity = 1;
        }
    }
    
    function animateToPosition(translate, index) {
        const { current } = getCurrentIndex();
        
        if (index !== current) {
            // Trigger card change via button click
            const nextBtn = document.getElementById('nextBtn');
            const prevBtn = document.getElementById('prevBtn');
            
            if (index > current && nextBtn) {
                nextBtn.click();
            } else if (index < current && prevBtn) {
                prevBtn.click();
            }
        }
        
        // Animate back to center
        card.style.transition = 'transform 0.3s ease-out';
        card.style.transform = 'translateX(0)';
        card.style.opacity = '1';
        
        setTimeout(() => {
            card.style.transition = '';
        }, 300);
    }
    
    // Add styles for drag
    card.style.transition = '';
    card.style.userSelect = 'none';
    card.style.webkitUserSelect = 'none';
}

// Initialize swipe handling when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSwipeHandling);
} else {
    initSwipeHandling();
}

