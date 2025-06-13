// Aguarda o documento HTML ser completamente carregado
document.addEventListener('DOMContentLoaded', () => {

    // Mapeamento dos elementos da UI (visuais)
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

    // Variáveis para controlar o estado do jogo
    let allQuizQuestions = [];
    let currentPlayQuestions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let currentCorrectAnswerText = '';
    let currentDisplayedAlternatives = [];

    // Função para embaralhar arrays (algoritmo Fisher-Yates)
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Gatilhos de eventos para botões e inputs
    loadFileButton.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileLoad);
    confirmButton.addEventListener('click', confirmAnswer);
    nextButton.addEventListener('click', nextQuestion);
    playAgainButton.addEventListener('click', startQuiz);
    loadAnotherButton.addEventListener('click', resetToInitialScreen);

    // Função para carregar e ler o arquivo JSON
    function handleFileLoad(event) {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                const parsedData = JSON.parse(content);
                // Validação básica do conteúdo do JSON
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
    
    // Função para iniciar ou reiniciar o quiz
    function startQuiz() {
        showScreen('quiz-screen');
        currentPlayQuestions = [...allQuizQuestions]; // Cria uma cópia das perguntas
        shuffle(currentPlayQuestions); // Embaralha as perguntas
        currentQuestionIndex = -1;
        score = 0;
        nextQuestion();
    }

    // Função para exibir a pergunta atual
    function displayCurrentQuestion() {
        const questionData = currentPlayQuestions[currentQuestionIndex];
        
        // Define o texto da pergunta
        questionText.innerHTML = `Pergunta ${currentQuestionIndex + 1}/${currentPlayQuestions.length}:<br><br>${questionData.pergunta}`;
        
        // Guarda o texto da resposta correta e embaralha as alternativas
        currentCorrectAnswerText = questionData.alternativas[questionData.correta_idx];
        currentDisplayedAlternatives = [...questionData.alternativas]; // Copia
        shuffle(currentDisplayedAlternatives); // Embaralha

        // Cria os botões de rádio para as alternativas
        optionsContainer.innerHTML = ''; // Limpa as opções anteriores
        currentDisplayedAlternatives.forEach((alt, index) => {
            const optionId = `option${index}`;
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option';
            optionDiv.innerHTML = `
                <input type="radio" name="answer" id="${optionId}" value="${alt}">
                <label for="${optionId}">${alt}</label>
            `;
            // Clicar no div inteiro seleciona o rádio
            optionDiv.addEventListener('click', () => {
                optionDiv.querySelector('input[type="radio"]').checked = true;
                confirmButton.disabled = false;
            });
            optionsContainer.appendChild(optionDiv);
        });

        // Reseta o estado dos botões e do feedback
        resetFeedbackAndButtons();
    }
    
    // Função para confirmar a resposta selecionada
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
            
            // Destaca a resposta correta
            const correctRadio = document.querySelector(`input[value="${CSS.escape(currentCorrectAnswerText)}"]`);
            if(correctRadio) {
                correctRadio.parentElement.style.backgroundColor = '#d4edda'; // Verde claro
            }
        }
        
        // Bloqueia as opções e mostra o botão "Próxima"
        document.querySelectorAll('input[name="answer"]').forEach(radio => radio.disabled = true);
        confirmButton.classList.add('hidden');
        nextButton.classList.remove('hidden');
    }

    // Função para avançar para a próxima pergunta ou resultados
    function nextQuestion() {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentPlayQuestions.length) {
            displayCurrentQuestion();
        } else {
            showResults();
        }
    }

    // Função para exibir a tela de resultados finais
    function showResults() {
        showScreen('results-screen');
        const percentage = (score / currentPlayQuestions.length) * 100 || 0;
        scoreText.textContent = `Sua pontuação: ${score} de ${currentPlayQuestions.length} (${percentage.toFixed(2)}%)`;
    }

    // Funções auxiliares para controlar a UI
    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    function resetToInitialScreen() {
        showScreen('initial-screen');
        fileInput.value = ''; // Limpa a seleção de arquivo anterior
    }

    function resetFeedbackAndButtons() {
        feedbackText.textContent = '';
        feedbackText.className = 'feedback';
        confirmButton.disabled = true;
        confirmButton.classList.remove('hidden');
        nextButton.classList.add('hidden');
    }
});