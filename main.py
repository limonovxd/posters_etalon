from flask import Flask, render_template, request, session, redirect, url_for
import random
from test_loader import get_test_questions, get_all_subjects, load_test

app = Flask(__name__)
app.secret_key = 'your-secret-key-change-in-production'  # В продакшене используйте безопасный ключ

@app.route("/")
def index():
    return render_template('index.html')

@app.route("/general-test")
def general_test():
    return render_template('general_test.html')

@app.route("/general-test/start", methods=['POST'])
def start_test():
    """Начало теста - инициализация сессии"""
    # Загружаем общий тест из JSON
    questions = get_test_questions('general')
    # Перемешиваем вопросы
    random.shuffle(questions)
    # Сохраняем все вопросы в сессию
    session['test_questions'] = questions
    session['current_question'] = 0
    session['answers'] = []
    session['test_started'] = True
    session['test_subject'] = 'general'
    return redirect(url_for('test_question'))

@app.route("/test/question")
def test_question():
    """Отображение текущего вопроса (универсальный маршрут для всех тестов)"""
    if not session.get('test_started'):
        # Определяем, откуда пришли
        test_subject = session.get('test_subject', 'general')
        if test_subject == 'general':
            return redirect(url_for('general_test'))
        else:
            return redirect(url_for('subject_test'))
    
    questions = session.get('test_questions', [])
    current = session.get('current_question', 0)
    
    if current >= len(questions):
        return redirect(url_for('test_results'))
    
    question = questions[current]
    # Используем subject_name из вопроса, если есть
    subject_name = question.get('subject_name', question.get('subject', 'Тест'))
    
    return render_template('test_question.html', 
                         question=question,
                         question_num=current + 1,
                         total_questions=len(questions),
                         subject_name=subject_name)

@app.route("/test/answer", methods=['POST'])
def submit_answer():
    """Обработка ответа пользователя (универсальный маршрут для всех тестов)"""
    if not session.get('test_started'):
        # Определяем, откуда пришли
        test_subject = session.get('test_subject', 'general')
        if test_subject == 'general':
            return redirect(url_for('general_test'))
        else:
            return redirect(url_for('subject_test'))
    
    questions = session.get('test_questions', [])
    current = session.get('current_question', 0)
    
    if current >= len(questions):
        return redirect(url_for('test_results'))
    
    question = questions[current]
    user_answer = int(request.form.get('answer', -1))
    
    # Сохраняем ответ
    answers = session.get('answers', [])
    answers.append({
        'question_id': question['id'],
        'user_answer': user_answer,
        'correct_answer': question['correct'],
        'is_correct': user_answer == question['correct']
    })
    session['answers'] = answers
    
    # Переходим к следующему вопросу
    session['current_question'] = current + 1
    
    return redirect(url_for('test_question'))

@app.route("/test/results")
def test_results():
    """Отображение результатов теста (универсальный маршрут для всех тестов)"""
    if not session.get('test_started'):
        # Определяем, откуда пришли
        test_subject = session.get('test_subject', 'general')
        if test_subject == 'general':
            return redirect(url_for('general_test'))
        else:
            return redirect(url_for('subject_test'))
    
    answers = session.get('answers', [])
    questions = session.get('test_questions', [])
    
    # Подсчет результатов
    total = len(answers)
    correct = sum(1 for a in answers if a['is_correct'])
    percentage = round((correct / total * 100) if total > 0 else 0, 1)
    
    # Результаты по предметам
    subject_stats = {}
    
    for ans in answers:
        # Находим вопрос по ID
        question = None
        for q in questions:
            if q['id'] == ans['question_id']:
                question = q
                break
        
        if question:
            subject = question.get('subject', 'unknown')
            subject_name = question.get('subject_name', subject)
            if subject not in subject_stats:
                subject_stats[subject] = {
                    'total': 0, 
                    'correct': 0,
                    'name': subject_name
                }
            subject_stats[subject]['total'] += 1
            if ans['is_correct']:
                subject_stats[subject]['correct'] += 1
    
    # Форматируем статистику по предметам
    formatted_stats = []
    for subject, stats in subject_stats.items():
        formatted_stats.append({
            'name': stats.get('name', subject),
            'correct': stats['correct'],
            'total': stats['total'],
            'percentage': round((stats['correct'] / stats['total'] * 100) if stats['total'] > 0 else 0, 1)
        })
    
    # Очищаем сессию
    session.pop('test_started', None)
    session.pop('test_questions', None)
    session.pop('current_question', None)
    
    return render_template('test_results.html',
                         total=total,
                         correct=correct,
                         percentage=percentage,
                         subject_stats=formatted_stats,
                         answers=answers,
                         questions=questions)

@app.route("/subject-test")
def subject_test():
    """Страница выбора предмета для теста"""
    # Получаем список доступных предметов
    subjects = get_all_subjects()
    subjects_data = []
    
    for subject in subjects:
        test_data = load_test(subject)
        if test_data:
            subjects_data.append({
                'id': subject,
                'name': test_data.get('subject_name', subject),
                'questions_count': len(test_data.get('questions', []))
            })
    
    return render_template('subject_test.html', subjects=subjects_data)

@app.route("/subject-test/<subject>/start", methods=['POST'])
def start_subject_test(subject):
    """Начало теста по конкретному предмету"""
    # Загружаем тест по предмету из JSON
    questions = get_test_questions(subject)
    
    if not questions:
        # Если тест не найден, возвращаемся на страницу выбора
        return redirect(url_for('subject_test'))
    
    # Перемешиваем вопросы
    random.shuffle(questions)
    # Сохраняем все вопросы в сессию
    session['test_questions'] = questions
    session['current_question'] = 0
    session['answers'] = []
    session['test_started'] = True
    session['test_subject'] = subject
    return redirect(url_for('test_question'))

@app.route("/lifehacks")
def lifehacks():
    return render_template('lifehacks.html')

if __name__ == "__main__":
    app.run(debug=True)