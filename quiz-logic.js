    document.addEventListener('DOMContentLoaded', () => {

    // ===============================================================
    // ATUALIZE AQUI COM SEUS QUIZZES, SEPARADOS POR CATEGORIA
    // ===============================================================
    const allQuizzes = {
        pedagogico: [
            // Adicione aqui seus quizzes pedagógicos
            { name: "VEIGA - Projeto Político-Pedagógico e Gestão Democrática", url: "Veiga_ppp.json" },
            { name: "FREIRE - Professora Sim, Tia Não", url: "Professora Sim Tia Não.json" },
            { name: "SOARES - Letramento e Alfabetização: as muitas facetas", url: "SOARES - Letramento e alfabetização.json" },
            { name: "LEMOV - Aula nota 10 3.0", url: "lemov_aula_nota_10.json" },
        ],
        legislacao: [
            // Adicione aqui seus quizzes de legislação
            { name: "Em construção", url: "quiz_ldb.json" },
            
        ]
        // Você pode adicionar mais categorias aqui, se quiser.
    };
    // ===============================================================

   // Mapeamento dos elementos da UI
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
    const backToMenuButton = document.getElementById('back-to-menu-button');
    const selectionContainer = document.getElementById('selection-container');

    // (O resto das variáveis de estado do jogo continua igual)
    let currentQuizData = [];
    let currentPlayQuestions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let currentCorrectAnswerText = '';
    let currentDisplayedAlternatives = [];

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // --- LÓGICA DE NAVEGAÇÃO E CARREGAMENTO ---

    // ----- FUNÇÃO MODIFICADA -----
    // Função para mostrar os "cartões" de categoria iniciais
    function displayCategoryButtons() {
        selectionContainer.innerHTML = `
            <h3 class="app-subtitle">Escolha um assunto:</h3>
            <div class="category-container">
                <div class="category-card" id="card-pedagogico">
                    <h4>Pedagógico</h4>
                    <p>Teste seus conhecimentos em teorias da educação, didática e práticas pedagógicas.</p>
                </div>
                <div class="category-card" id="card-legislacao">
                    <h4>Legislação</h4>
                    <p>Questões sobre LDB, ECA, BNCC e outras normas importantes da educação.</p>
                </div>
            </div>
        `;
        document.getElementById('card-pedagogico').addEventListener('click', () => displayQuizListForCategory('pedagogico'));
        document.getElementById('card-legislacao').addEventListener('click', () => displayQuizListForCategory('legislacao'));
    }

    // (O resto do arquivo JavaScript continua exatamente o mesmo)
    
   function displayQuizListForCategory(categoryKey) {
        const quizzes = allQuizzes[categoryKey];
        selectionContainer.innerHTML = ''; // Limpa o contêiner

        // Cria um contêiner para o botão de voltar, para alinhá-lo à esquerda
        const backButtonContainer = document.createElement('div');
        backButtonContainer.className = 'back-button-container';
        
        const backButton = document.createElement('button');
        backButton.innerHTML = '‹ Voltar para Assuntos';
        backButton.className = 'btn btn-tertiary';
        backButton.addEventListener('click', displayCategoryButtons);
        
        backButtonContainer.appendChild(backButton);
        selectionContainer.appendChild(backButtonContainer);

        // Cria um contêiner para a lista de quizzes
        const quizListContainer = document.createElement('div');
        quizListContainer.className = 'quiz-list-container';

        quizzes.forEach(quiz => {
            const quizButton = document.createElement('button');
            quizButton.textContent = quiz.name;
            quizButton.className = 'btn btn-secondary'; // Este botão ocupará a largura toda do seu contêiner
            quizButton.addEventListener('click', () => loadQuizFromURL(quiz.url));
            quizListContainer.appendChild(quizButton);
        });
        selectionContainer.appendChild(quizListContainer);
    }

    function loadQuizFromURL(url) {
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`Arquivo não encontrado ou erro de rede (Status: ${response.status})`);
                return response.json();
            })
            .then(data => {
                if (!Array.isArray(data) || data.length === 0) throw new Error("O arquivo JSON está vazio ou em formato inválido.");
                currentQuizData = data;
                startQuiz();
            })
            .catch(error => alert(`Não foi possível carregar o quiz: ${error.message}`));
    }
    
    function startQuiz() {
        showScreen('quiz-screen');
        currentPlayQuestions = [...currentQuizData]; 
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
        displayCategoryButtons();
    }

    function resetFeedbackAndButtons() {
        feedbackText.textContent = '';
        feedbackText.className = 'feedback';
        confirmButton.disabled = true;
        confirmButton.classList.remove('hidden');
        nextButton.classList.add('hidden');
    }

    confirmButton.addEventListener('click', confirmAnswer);
    nextButton.addEventListener('click', nextQuestion);
    playAgainButton.addEventListener('click', startQuiz);
    loadAnotherButton.addEventListener('click', resetToInitialScreen);
    backToMenuButton.addEventListener('click', () => {
        if (confirm("Tem certeza que deseja sair do quiz? Seu progresso atual será perdido.")) {
            resetToInitialScreen();
        }
    });

    displayCategoryButtons();
});
