// ===========================================
// Modal for early test completion
// ===========================================
function showFinishModal() {
    const modal = document.getElementById('finish-modal');
    const messageEl = document.getElementById('modal-message');
    
    if (!modal || !messageEl) return;
    
    // Получаем данные из data-атрибутов
    const questionNum = parseInt(modal.getAttribute('data-question-num')) || 0;
    const total = parseInt(modal.getAttribute('data-total-questions')) || 0;
    const answered = questionNum - 1;
    
    let message = 'Вы уверены, что хотите завершить тест досрочно?';
    if (answered > 0) {
        message += '<br><br><strong>Отвечено на вопросов: ' + answered + ' из ' + total + '</strong>';
    }
    
    messageEl.innerHTML = message;
    modal.classList.add('modal-visible');
    document.body.classList.add('modal-open');
}

function hideFinishModal() {
    const modal = document.getElementById('finish-modal');
    if (modal) {
        modal.classList.remove('modal-visible');
    }
    document.body.classList.remove('modal-open');
}

// ===========================================
// Validation modal for answer selection
// ===========================================
function showValidationMessage() {
    const modal = document.getElementById('validation-modal');
    if (modal) {
        modal.classList.add('modal-visible');
        document.body.classList.add('modal-open');
    }
}

function hideValidationMessage() {
    const modal = document.getElementById('validation-modal');
    if (modal) {
        modal.classList.remove('modal-visible');
        document.body.classList.remove('modal-open');
    }
}

function validateAnswerSelection(event) {
    const isMultiple = document.querySelector('input[name="answer"][type="checkbox"]') !== null;
    
    if (isMultiple) {
        const selectedAnswers = document.querySelectorAll('input[name="answer"]:checked');
        if (selectedAnswers.length === 0) {
            event.preventDefault();
            showValidationMessage();
            return false;
        }
    } else {
        const selectedAnswer = document.querySelector('input[name="answer"]:checked');
        if (!selectedAnswer) {
            event.preventDefault();
            showValidationMessage();
            return false;
        }
    }
    return true;
}

// ===========================================
// Initialize modal event listeners
// ===========================================
document.addEventListener('DOMContentLoaded', function() {
    // Close finish modal on click outside
    const finishModal = document.getElementById('finish-modal');
    if (finishModal) {
        finishModal.addEventListener('click', function(e) {
            if (e.target === finishModal) {
                hideFinishModal();
            }
        });
    }
    
    // Close validation modal on click outside
    const validationModal = document.getElementById('validation-modal');
    if (validationModal) {
        validationModal.addEventListener('click', function(e) {
            if (e.target === validationModal) {
                hideValidationMessage();
            }
        });
    }
    
    // Close modals on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideFinishModal();
            hideValidationMessage();
        }
    });
});