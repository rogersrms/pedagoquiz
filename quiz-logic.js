document.addEventListener('DOMContentLoaded', () => {

    // 1. DEFINIR OS QUIZZES DISPONÍVEIS
    const allQuizzes = {
        pedagogico: [
            { name: "VEIGA - Projeto Político-Pedagógico e Gestão Democrática", url: "Veiga_ppp.json" },
            { name: "FREIRE - Professora Sim, Tia Não", url: "Professora Sim Tia Não.json" },
            { name: "SOARES - Letramento e Alfabetização: as muitas facetas", url: "SOARES - Letramento e alfabetização.json" },
            { name: "LEMOV - Aula nota 10 3.0", url: "lemov_aula_nota_10.json" },
            { name: "BARBOSA - Culturas escolares, culturas de infância e culturas familiares", url: "barbosa_culturas.json" },
            { name: "BENEVIDES - Educação para a democracia", url: "benevides_epd.json" },
            { name: "AINSCOW - Tornar a educação inclusiva", url: "ainscow_eduinclus.json" },
            { name: "SASSERON - Alfabetização científica", url: "sasseron_alfabcien.json" },
            { name: "BERBEL - As metodologias ativas e a promoção da autonomia de estudantes", url: "berbel_metodologias.json" },
        ],
        legislacao: [
            { name: "Em construção", url: "quiz_ldb.json" },
        ]
    };

    // 2. MAPEAMENTO DE TODOS OS ELEMENTOS DA UI
    const initialScreen = document.getElementById('initial-screen');
    const quizScreen = document.getElementById('quiz-screen');
    const resultsScreen = document.getElementById('results-screen');
    const selectionContainer = document.getElementById('selection-container');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const feedbackText = document.getElementById('feedback-text');
    const confirmButton = document.getElementById('confirm-button');
    const nextButton = document.getElementById('next-button');
    const scoreText = document.getElementById('score-text');
    const playAgainButton = document.getElementById('play-again-button');
    const loadAnotherButton = document.getElementById('load-another-button');
    const backToMenuButton = document.getElementById('back-to-menu-button');
    const countElement = document.getElementById('visitor-count-badge');
    const randomQuizButton = document.getElementById('random-quiz-button');

    // 3. VARIÁVEIS DE ESTADO DO JOGO
    let currentQuizData = [];
    let currentPlayQuestions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let currentCorrectAnswerText = '';
    let currentDisplayedAlternatives = [];

    // 4. DEFINIÇÃO DE TODAS AS FUNÇÕES
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
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
            .catch(error => alert(`Não foi possível carregar o quiz: ${error.message}\nVerifique se o nome do arquivo .json está correto e se ele está na mesma pasta do index.html.`));
    }

    function displayQuizListForCategory(categoryKey) {
        const quizzes = allQuizzes[categoryKey];
        quizzes.sort((a, b) => a.name.localeCompare(b.name));
        selectionContainer.innerHTML = '';
        const backButtonContainer = document.createElement('div');
        backButtonContainer.className = 'back-button-container';
        const backButton = document.createElement('button');
        backButton.innerHTML = '‹ Voltar para Assuntos';
        backButton.className = 'btn btn-tertiary';
        backButton.addEventListener('click', displayCategoryButtons);
        backButtonContainer.appendChild(backButton);
        selectionContainer.appendChild(backButtonContainer);
        const quizListContainer = document.createElement('div');
        quizListContainer.className = 'quiz-list-container';
        quizzes.forEach(quiz => {
            const quizButton = document.createElement('button');
            quizButton.textContent = quiz.name;
            quizButton.className = 'btn btn-secondary';
            quizButton.addEventListener('click', () => loadQuizFromURL(quiz.url));
            quizListContainer.appendChild(quizButton);
        });
        selectionContainer.appendChild(quizListContainer);
    }

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

    function resetToInitialScreen() {
        showScreen('initial-screen');
        displayCategoryButtons();
    }

    async function startRandomSuperQuiz() {
        randomQuizButton.disabled = true;
        randomQuizButton.textContent = "Gerando quiz...";
        const allQuizUrls = Object.values(allQuizzes).flat().map(quiz => quiz.url);

        try {
            const allFetches = allQuizUrls.map(url => fetch(url).then(res => {
                if (!res.ok) {
                    console.warn(`Aviso: Não foi possível carregar o quiz ${url}. Ele será ignorado.`);
                    return [];
                }
                return res.json();
            }).catch(error => {
                console.warn(`Erro ao buscar ${url}:`, error);
                return []; // Ignora arquivos que falham no fetch
            }));
            
            const results = await Promise.all(allFetches);
            const megaPoolOfQuestions = results.flat();
            
            if (megaPoolOfQuestions.length === 0) {
                alert("Não foi possível carregar nenhuma pergunta para o quiz aleatório.");
                return;
            }

            shuffle(megaPoolOfQuestions);
            const randomQuizSelection = megaPoolOfQuestions.slice(0, 20);
            currentQuizData = randomQuizSelection;
            startQuiz();

        } catch (error) {
            alert("Ocorreu um erro ao gerar o quiz aleatório: " + error.message);
        } finally {
            randomQuizButton.disabled = false;
            randomQuizButton.textContent = "Surpreenda-me! (Quiz Aleatório)";
        }
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
        resetFeedbackAndButtons();
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
            if (correctRadioInput) {
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

    function resetFeedbackAndButtons() {
        feedbackText.textContent = '';
        feedbackText.className = 'feedback';
        confirmButton.disabled = true;
        confirmButton.classList.remove('hidden');
        nextButton.classList.add('hidden');
    }

    function updateVisitorCount() {
        const namespace = 'pedagoquiz.rodrigosousa';
        if (countElement) {
            const badgeUrl = `https://api.visitorbadge.io/api/visitors?path=https%3A%2F%2Fpedagoquiz.com%2F${namespace}&countColor=%237d8da1&label=Visitantes`;
            const badgeImage = document.createElement('img');
            badgeImage.src = badgeUrl;
            badgeImage.alt = 'Contador de Visitantes';
            countElement.innerHTML = '';
            countElement.appendChild(badgeImage);
        }
    }

    // 5. INICIALIZAÇÃO DO PROGRAMA
    confirmButton.addEventListener('click', confirmAnswer);
    nextButton.addEventListener('click', nextQuestion);
    playAgainButton.addEventListener('click', startQuiz);
    loadAnotherButton.addEventListener('click', resetToInitialScreen);
    backToMenuButton.addEventListener('click', () => {
        if (confirm("Tem certeza que deseja sair do quiz? Seu progresso atual será perdido.")) {
            resetToInitialScreen();
        }
    });
    randomQuizButton.addEventListener('click', startRandomSuperQuiz);

    updateVisitorCount();
    displayCategoryButtons();
});
