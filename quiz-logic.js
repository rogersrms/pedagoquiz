document.addEventListener('DOMContentLoaded', () => {

    // ===============================================================
    // 1. CONFIGURAÇÃO DO FIREBASE
    // ===============================================================
    const firebaseConfig = {
      apiKey: "SUA_API_KEY",
      authDomain: "SEU_AUTH_DOMAIN",
      projectId: "SEU_PROJECT_ID",
      storageBucket: "SEU_STORAGE_BUCKET",
      messagingSenderId: "SEU_SENDER_ID",
      appId: "SEU_APP_ID"
    };
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();

    // ===============================================================
    // 2. DEFINIÇÃO DOS QUIZZES
    // ===============================================================
    const allQuizzes = {
        pedagogico: [
            { name: "FERREIRO - Reflexões sobre a Alfabetização", url: "quiz_ferreiro_alfabetizacao.json" },
            { name: "BACICH - Metodologias ativas para uma educação inovadora", url: "quiz_bacich_metodologias.json" },
            { name: "WEISZ - O diálogo entre o ensino e a aprendizagem", url: "quiz_weisz_dialogo.json" },
            // ...e os outros quizzes...
        ],
        legislacao: [
            { name: "LDB", url: "quiz_ldb_completo.json" },
            { name: "ECA - Artigos 1 a 6", url: "quiz_eca_art1a6.json" },
            // ...e os outros quizzes...
        ]
    };

    // ===============================================================
    // 3. MAPEAMENTO DE TODOS OS ELEMENTOS DA UI
    // ===============================================================
    const userInfoArea = document.getElementById('user-info-area');
    const loginScreen = document.getElementById('login-screen');
    const signupScreen = document.getElementById('signup-screen');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const goToSignupLink = document.getElementById('go-to-signup');
    const goToLoginLink = document.getElementById('go-to-login');
    const initialScreen = document.getElementById('initial-screen');
    const quizScreen = document.getElementById('quiz-screen');
    const resultsScreen = document.getElementById('results-screen');
    const selectionContainer = document.getElementById('selection-container');
    const randomQuizButton = document.getElementById('random-quiz-button');
    const downloadQuizButton = document.getElementById('download-quiz-button');
    const backToMenuButton = document.getElementById('back-to-menu-button');
    const playAgainButton = document.getElementById('play-again-button');
    const loadAnotherButton = document.getElementById('load-another-button');
    // (outros mapeamentos se necessário)

    // ===============================================================
    // 4. VARIÁVEIS DE ESTADO DO JOGO
    // ===============================================================
    let currentQuizData = [], currentPlayQuestions = [], currentQuestionIndex = 0, score = 0;
    let currentQuizTitle = "";

    // ===============================================================
    // 5. DEFINIÇÃO DE TODAS AS FUNÇÕES (A-Z)
    // ===============================================================

    function confirmAnswer() {
        const selectedRadio = document.querySelector('input[name="answer"]:checked');
        if (!selectedRadio) return;
        const isCorrect = selectedRadio.value === currentCorrectAnswerText; // currentCorrectAnswerText precisa ser definido
        if (isCorrect) {
            score++;
            document.getElementById('feedback-text').textContent = 'Correto!';
            document.getElementById('feedback-text').className = 'feedback correct';
            selectedRadio.parentElement.style.borderColor = 'var(--success-color)';
        } else {
            document.getElementById('feedback-text').textContent = `Incorreto. A resposta correta era: "${currentCorrectAnswerText}"`;
            document.getElementById('feedback-text').className = 'feedback incorrect';
            selectedRadio.parentElement.style.borderColor = 'var(--danger-color)';
            const correctRadioInput = document.querySelector(`input[value="${CSS.escape(currentCorrectAnswerText)}"]`);
            if (correctRadioInput) {
                correctRadioInput.parentElement.style.backgroundColor = '#d4edda';
            }
        }
        document.querySelectorAll('input[name="answer"]').forEach(radio => radio.disabled = true);
        document.getElementById('confirm-button').classList.add('hidden');
        document.getElementById('next-button').classList.remove('hidden');
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
    
    function displayCurrentQuestion() {
        resetFeedbackAndButtons();
        const questionData = currentPlayQuestions[currentQuestionIndex];
        const questionText = document.getElementById('question-text');
        const optionsContainer = document.getElementById('options-container');

        questionText.innerHTML = `Pergunta ${currentQuestionIndex + 1}/${currentPlayQuestions.length}:<br><br>${questionData.pergunta}`;
        currentCorrectAnswerText = questionData.alternativas[questionData.correta_idx];
        let currentDisplayedAlternatives = [...questionData.alternativas];
        shuffle(currentDisplayedAlternatives);
        
        optionsContainer.innerHTML = '';
        currentDisplayedAlternatives.forEach((alt, index) => {
            const optionId = `option${index}`;
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option';
            optionDiv.innerHTML = `<input type="radio" name="answer" id="${optionId}" value="${alt}"><label for="${optionId}">${alt}</label>`;
            optionDiv.addEventListener('click', () => {
                optionDiv.querySelector('input[type="radio"]').checked = true;
                document.getElementById('confirm-button').disabled = false;
            });
            optionsContainer.appendChild(optionDiv);
        });
    }

    function displayQuizListForCategory(categoryKey) {
        const quizzes = allQuizzes[categoryKey];
        quizzes.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { numeric: true }));
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
            quizButton.addEventListener('click', () => {
                currentQuizTitle = quiz.name;
                loadQuizFromURL(quiz.url);
            });
            quizListContainer.appendChild(quizButton);
        });
        selectionContainer.appendChild(quizListContainer);
    }
    
    function generateQuizPDF() { /* ... (código da função de gerar PDF aqui) ... */ }
    function getBase64Image(imgElement) { /* ... (código da função de imagem aqui) ... */ }

    function loadQuizFromURL(url) {
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`Arquivo não encontrado (Status: ${response.status})`);
                return response.json();
            })
            .then(data => {
                if (!Array.isArray(data) || data.length === 0) throw new Error("JSON vazio ou inválido.");
                currentQuizData = data;
                startQuiz();
            })
            .catch(error => alert(`Erro ao carregar quiz: ${error.message}`));
    }

    function nextQuestion() {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentPlayQuestions.length) {
            displayCurrentQuestion();
        } else {
            showResults();
        }
    }
    
    function resetFeedbackAndButtons() {
        document.getElementById('feedback-text').textContent = '';
        document.getElementById('feedback-text').className = 'feedback';
        document.getElementById('confirm-button').disabled = true;
        document.getElementById('confirm-button').classList.remove('hidden');
        document.getElementById('next-button').classList.add('hidden');
    }

    function resetToInitialScreen() {
        showScreen('initial-screen');
        displayCategoryButtons();
        updateVisitorCount();
    }
    
    function showResults() {
        showScreen('results-screen');
        const scoreText = document.getElementById('score-text');
        const percentage = (score / currentPlayQuestions.length) * 100 || 0;
        scoreText.textContent = `Sua pontuação: ${score} de ${currentPlayQuestions.length} (${percentage.toFixed(2)}%)`;
    }

    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    async function startRandomSuperQuiz() {
        randomQuizButton.disabled = true;
        randomQuizButton.textContent = "Gerando quiz...";
        currentQuizTitle = "Quiz Aleatório (20 Questões)";
        const allQuizUrls = Object.values(allQuizzes).flat().map(quiz => quiz.url);
        try {
            const allFetches = allQuizUrls.map(url => fetch(url).then(res => {
                if (!res.ok) { console.warn(`Aviso: Quiz ${url} ignorado.`); return []; }
                return res.json();
            }).catch(error => { console.warn(`Erro ao buscar ${url}:`, error); return []; }));
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

    function updateVisitorCount() {
        const namespace = 'pedagoquiz.rodrigosousa';
        const countElement = document.getElementById('visitor-count-badge');
        if (countElement) {
            const badgeUrl = `https://api.visitorbadge.io/api/visitors?path=https%3A%2F%2Fpedagoquiz.com%2F${namespace}&countColor=%237d8da1&label=Visitantes`;
            const badgeImage = document.createElement('img');
            badgeImage.src = badgeUrl;
            badgeImage.alt = 'Contador de Visitantes';
            countElement.innerHTML = '';
            countElement.appendChild(badgeImage);
        }
    }

    // ===============================================================
    // 6. LÓGICA DE AUTENTICAÇÃO E INICIALIZAÇÃO
    // ===============================================================
    
    // Observa mudanças no estado de autenticação (login/logout)
    auth.onAuthStateChanged(user => {
        if (user) {
            // Usuário está logado
            userInfoArea.innerHTML = `
                <span class="username">Olá, ${user.displayName || user.email}!</span>
                <button id="logout-button" class="btn-tertiary">Sair</button>
            `;
            document.getElementById('logout-button').addEventListener('click', () => auth.signOut());
            resetToInitialScreen(); // Leva o usuário para a tela inicial
        } else {
            // Usuário está deslogado
            userInfoArea.innerHTML = `
                <a href="#" id="login-link">Login</a>
                <a href="#" id="signup-link">Cadastre-se</a>
            `;
            document.getElementById('login-link').addEventListener('click', () => showScreen('login-screen'));
            document.getElementById('signup-link').addEventListener('click', () => showScreen('signup-screen'));
            showScreen('login-screen'); // Tela padrão para quem não está logado
        }
    });

    // Gatilhos para os formulários
    loginForm.addEventListener('submit', event => {
        event.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        auth.signInWithEmailAndPassword(email, password)
            .catch(error => alert("Erro ao fazer login: " + error.message));
    });

    signupForm.addEventListener('submit', event => {
        event.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        auth.createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
                return userCredential.user.updateProfile({ displayName: name });
            })
            .catch(error => alert("Erro ao cadastrar: " + error.message));
    });

    // Gatilhos para os links de navegação dos formulários
    goToSignupLink.addEventListener('click', (e) => { e.preventDefault(); showScreen('signup-screen'); });
    goToLoginLink.addEventListener('click', (e) => { e.preventDefault(); showScreen('login-screen'); });
    
    // Gatilhos de eventos dos botões do Quiz
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
    downloadQuizButton.addEventListener('click', generateQuizPDF);

    // A inicialização agora é controlada pelo onAuthStateChanged
    // A única função que podemos chamar no início é a do contador, se quisermos que ele apareça em todas as telas
    // Mas a lógica atual, de chamá-lo apenas na tela inicial, é melhor.
});
