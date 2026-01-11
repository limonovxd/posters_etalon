import json
import os
import random

# Путь к папке с тестами
TESTS_DIR = os.path.join(os.path.dirname(__file__), 'tests')

def load_test(subject):
    """
    Загружает тест по указанному предмету из JSON файла
    
    Args:
        subject: название предмета (russian, math, informatics, general)
    
    Returns:
        dict: словарь с данными теста или None если файл не найден
    """
    test_file = os.path.join(TESTS_DIR, f'{subject}.json')
    
    if not os.path.exists(test_file):
        return None
    
    try:
        with open(test_file, 'r', encoding='utf-8') as f:
            test_data = json.load(f)
        return test_data
    except (json.JSONDecodeError, IOError) as e:
        print(f"Ошибка при загрузке теста {subject}: {e}")
        return None

def get_all_subjects():
    """
    Получает список всех доступных предметов из JSON файлов
    
    Returns:
        list: список доступных предметов
    """
    subjects = []
    if os.path.exists(TESTS_DIR):
        for filename in os.listdir(TESTS_DIR):
            if filename.endswith('.json'):
                subject = filename[:-5]  # убираем .json
                if subject != 'general':  # общий тест обрабатываем отдельно
                    subjects.append(subject)
    return subjects

def get_general_test():
    """
    Загружает общий тест (комбинация всех предметов)
    
    Returns:
        list: список всех вопросов из всех предметов
    """
    general_config = load_test('general')
    if not general_config:
        return []
    
    subjects = general_config.get('subjects', ['russian', 'math', 'informatics'])
    questions_per_subject = general_config.get('questions_per_subject', 10)
    
    all_questions = []
    
    for subject in subjects:
        test_data = load_test(subject)
        if test_data and 'questions' in test_data:
            questions = test_data['questions'][:questions_per_subject]
            # Добавляем информацию о предмете к каждому вопросу
            for q in questions:
                q['subject'] = subject
                q['subject_name'] = test_data.get('subject_name', subject)
            all_questions.extend(questions)
    
    # Перемешиваем вопросы
    random.shuffle(all_questions)
    
    return all_questions

def get_test_questions(subject):
    """
    Получает вопросы для указанного предмета
    
    Args:
        subject: название предмета
    
    Returns:
        list: список вопросов
    """
    if subject == 'general':
        return get_general_test()
    
    # Для общего теста по математике комбинируем вопросы из базовой и профильной
    if subject == 'math':
        all_questions = []
        
        # Загружаем вопросы из базовой математики
        basic_data = load_test('math_basic')
        if basic_data and 'questions' in basic_data:
            basic_questions = basic_data['questions']
            for q in basic_questions:
                q['subject'] = 'math_basic'
                q['subject_name'] = basic_data.get('subject_name', 'Математика (базовая)')
            all_questions.extend(basic_questions)
        
        # Загружаем вопросы из профильной математики
        profile_data = load_test('math_profile')
        if profile_data and 'questions' in profile_data:
            profile_questions = profile_data['questions']
            for q in profile_questions:
                q['subject'] = 'math_profile'
                q['subject_name'] = profile_data.get('subject_name', 'Математика (профильная)')
            all_questions.extend(profile_questions)
        
        # Перемешиваем вопросы
        if all_questions:
            random.shuffle(all_questions)
        
        return all_questions
    
    # Для остальных предметов загружаем напрямую
    test_data = load_test(subject)
    if test_data and 'questions' in test_data:
        questions = test_data['questions']
        # Добавляем информацию о предмете к каждому вопросу
        for q in questions:
            q['subject'] = subject
            q['subject_name'] = test_data.get('subject_name', subject)
        return questions
    
    return []
