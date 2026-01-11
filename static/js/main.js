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