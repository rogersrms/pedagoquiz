document.addEventListener('DOMContentLoaded', () => {

    // ===============================================================
    // EDITAR ESTA LISTA PARA ADICIONAR SEUS QUIZZES
    // ===============================================================
    const preloadedQuizzes = [
        // { name: "NOME QUE APARECE NO BOTÃO", url: "nome_do_arquivo.json" },
        { name: "VEIGA-Projeto Político-Pedagógico e Gestão Democrática", url: "Veiga_ppp.json" },
        { name: "Quiz de Ciências", url: "quiz_ciencias.json" },
        // Adicione mais quizzes aqui
    ];
    // ===============================================================

    // Mapeamento dos elementos da UI
    const fileInput = document.getElementById('file-input');
    const loadFileButton = document.getElementById('load-file-button');
    const initialScreen = document.getElementById('initial-screen');
    const quizScreen = document.getElementById('quiz-screen');
    const resultsScreen = document.getElementById('results-screen');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const feedbackText = document.getElementById('feedback-text');
    const confirmButton = document.getElementById('confirm-button');
    const nextButton = document.getElementById('next-button');
    const scoreText = document.getElementById('score-text');
    const playAgainButton = document.getElementById('play-again-button');
    const loadAnotherButton = document.getElementById('load-another-button');
    const preloadedQuizzesList = document.getElementById('preloaded-quizzes-list');

    // Variáveis de estado do jogo
    let allQuizQuestions = [];
    let currentPlayQuestions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let currentCorrectAnswerText = '';
    let currentDisplayedAlternatives = [];

    // Função para embaralhar arrays
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // --- NOVAS FUNÇÕES PARA CARREGAR QUIZZES PRÉ-DEFINIDOS ---
    function populatePreloadedQuizzes() {
        preloadedQuizzesList.innerHTML = ''; // Limpa a lista
        preloadedQuizzes.forEach(quiz => {
            const quizButton = document.createElement('button');
            quizButton.textContent = quiz.name;
            quizButton.className = 'btn btn-primary';
            quizButton.addEventListener('click', () => loadQuizFromURL(quiz.url));
            preloadedQuizzesList.appendChild(quizButton);
        });
    }

    function loadQuizFromURL(url) {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Arquivo não encontrado ou erro de rede (Status: ${response.status})`);
                }
                return response.json();
            })
            .then(data => {
                if (!Array.isArray(data) || data.length === 0) {
                   throw new Error("O arquivo JSON está vazio ou em formato inválido.");
                }
                allQuizQuestions = data;
                startQuiz();
            })
            .catch(error => {
                alert(`Não foi possível carregar o quiz: ${error.message}`);
            });
    }

    // Gatilhos de eventos
    loadFileButton.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileLoadFromComputer);
    confirmButton.addEventListener('click', confirmAnswer);
    nextButton.addEventListener('click', nextQuestion);
    playAgainButton.addEventListener('click', startQuiz);
    loadAnotherButton.addEventListener('click', resetToInitialScreen);

    // Função para carregar arquivo do computador do usuário
    function handleFileLoadFromComputer(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                const parsedData = JSON.parse(content);
                if (!Array.isArray(parsedData) || parsedData.length === 0) {
                   throw new Error("O arquivo JSON está vazio ou não é um array.");
                }
                allQuizQuestions = parsedData;
                startQuiz();
            } catch (error) {
                alert('Erro ao ler ou interpretar o arquivo JSON: ' + error.message);
            }
        };
        reader.readAsText(file);
    }
    
    function startQuiz() {
        showScreen('quiz-screen');
        currentPlayQuestions = [...allQuizQuestions]; 
        shuffle(currentPlayQuestions);
        currentQuestionIndex = -1;
        score = 0;
        nextQuestion();
    }

    function displayCurrentQuestion() {
        const questionData = currentPlayQuestions[currentQuestionIndex];
        questionText.innerHTML = `Pergunta ${currentQuestionIndex + 1}/${currentPlayQuestions.length}:<br><br>${questionData.pergunta}`;
        currentCorrectAnswerText = questionData.alternativas[questionData.correta_idx];
        currentDisplayedAlternatives = [...questionData.alternativas];
        shuffle(currentDisplayedAlternatives);
        
        optionsContainer.innerHTML = '';
        currentDisplayedAlternatives.forEach((alt, index) => {
            const optionId = `option${index}`;
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option';
            optionDiv.innerHTML = `<input type="radio" name="answer" id="${optionId}" value="${alt}"><label for="${optionId}">${alt}</label>`;
            optionDiv.addEventListener('click', () => {
                optionDiv.querySelector('input[type="radio"]').checked = true;
                confirmButton.disabled = false;
            });
            optionsContainer.appendChild(optionDiv);
        });
        resetFeedbackAndButtons();
    }
    
    function confirmAnswer() {
        const selectedRadio = document.querySelector('input[name="answer"]:checked');
        if (!selectedRadio) return;
        const isCorrect = selectedRadio.value === currentCorrectAnswerText;
        if (isCorrect) {
            score++;
            feedbackText.textContent = 'Correto!';
            feedbackText.className = 'feedback correct';
            selectedRadio.parentElement.style.borderColor = 'var(--success-color)';
        } else {
            feedbackText.textContent = `Incorreto. A resposta correta era: "${currentCorrectAnswerText}"`;
            feedbackText.className = 'feedback incorrect';
            selectedRadio.parentElement.style.borderColor = 'var(--danger-color)';
            const correctRadioInput = document.querySelector(`input[value="${CSS.escape(currentCorrectAnswerText)}"]`);
            if(correctRadioInput) {
                correctRadioInput.parentElement.style.backgroundColor = '#d4edda';
            }
        }
        document.querySelectorAll('input[name="answer"]').forEach(radio => radio.disabled = true);
        confirmButton.classList.add('hidden');
        nextButton.classList.remove('hidden');
    }

    function nextQuestion() {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentPlayQuestions.length) {
            displayCurrentQuestion();
        } else {
            showResults();
        }
    }

    function showResults() {
        showScreen('results-screen');
        const percentage = (score / currentPlayQuestions.length) * 100 || 0;
        scoreText.textContent = `Sua pontuação: ${score} de ${currentPlayQuestions.length} (${percentage.toFixed(2)}%)`;
    }

    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }

    function resetToInitialScreen() {
        showScreen('initial-screen');
        fileInput.value = '';
    }

    function resetFeedbackAndButtons() {
        feedbackText.textContent = '';
        feedbackText.className = 'feedback';
        confirmButton.disabled = true;
        confirmButton.classList.remove('hidden');
        nextButton.classList.add('hidden');
    }

    // Inicializa a lista de quizzes pré-carregados na tela inicial
    populatePreloadedQuizzes();
});
