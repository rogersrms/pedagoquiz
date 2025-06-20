document.addEventListener('DOMContentLoaded', () => {

    // 1. DEFINIR OS QUIZZES DISPONÍVEIS
    const allQuizzes = {
        pedagogico: [
            { name: "FERREIRO - Reflexões sobre a Alfabetização", url: "quiz_ferreiro_alfabetizacao.json" },
            { name: "BACICH - Metodologias ativas para uma educação inovadora", url: "quiz_bacich_metodologias.json" },
            { name: "VEIGA - Projeto Político-Pedagógico e Gestão Democrática", url: "Veiga_ppp.json" },
            { name: "FREIRE - Professora Sim, Tia Não", url: "Professora Sim Tia Não.json" },
            { name: "WEISZ - O diálogo entro o ensino e a aprendizagem", url: "quiz_weisz_dialogo.json" },
            { name: "CAROLYN - As Cem Linguagens da Criança", url: "quiz_reggio_emilia.json" },
            { name: "PANIZZA - Ensinar matemática na educação infantil e nas séries iniciais", url: "quiz_panizza_matematica.json" },
            { name: "SOARES - Letramento e Alfabetização: as muitas facetas", url: "SOARES - Letramento e alfabetização.json" },
            { name: "LEMOV - Aula nota 10 3.0", url: "lemov_aula_nota_10.json" },
            { name: "CARVALHO - Sucesso e fracasso escolar: uma questão de gênero", url: "quiz_carvalho_genero.json" },
            { name: "BARBOSA - Culturas escolares, culturas de infância e culturas familiares", url: "barbosa_culturas.json" },
            { name: "BENEVIDES - Educação para a democracia", url: "benevides_epd.json" },
            { name: "AINSCOW - Tornar a educação inclusiva", url: "ainscow_eduinclus.json" },
            { name: "SASSERON - Alfabetização científica", url: "sasseron_alfabcien.json" },
            { name: "FOCHI - O que os bebês fazem no berçário?", url: "quiz_fochi_bercario.json" },
            { name: "BERBEL - As metodologias ativas e a promoção da autonomia de estudantes", url: "berbel_metodologias.json" },
            { name: "LA TAILLE - Piaget, Vygotsky e Wallon: teorias psicogenéticas em discussão", url: "lataille_piaget_vigotsky_walon.json" },
        
        ],
        legislacao: [
            { name: "LDB", url: "quiz_ldb_completo.json" },
            { name: "ECA - Artigos 1 a 6", url: "quiz_eca_art1a6.json" },
            { name: "ECA - Artigos 15 a 18-B", url: "quiz_eca_art15a18.json" },
            { name: "ECA - Artigos 53 a 59", url: "quiz_eca_art53a59.json" },
            { name: "ECA - Artigos 131 a 138", url: "quiz_eca_art131a138.json" },
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
    const downloadQuizButton = document.getElementById('download-quiz-button');

    // 3. VARIÁVEIS DE ESTADO DO JOGO
    let currentQuizTitle = "";
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
        currentQuizTitle = "Quiz Aleatório (20 Questões)";
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
                return [];
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

    function getBase64Image(imgElement) {
        try {
            const canvas = document.createElement("canvas");
            canvas.width = imgElement.naturalWidth;
            canvas.height = imgElement.naturalHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(imgElement, 0, 0);
            const dataURL = canvas.toDataURL("image/png");
            return dataURL;
        } catch (e) {
            console.error("Erro ao converter imagem para Base64:", e);
            return null;
        }
    }

    function generateQuizPDF() {
        if (!currentPlayQuestions || currentPlayQuestions.length === 0) {
            alert("Não há quiz em andamento para baixar.");
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        let yPosition = 15;
        const leftMargin = 15;
        const rightMargin = 15;
        const pageHeight = doc.internal.pageSize.getHeight();
        const bottomMargin = 20;
        const usableWidth = doc.internal.pageSize.getWidth() - leftMargin - rightMargin;
        const logoElement = document.querySelector('.app-logo');
        if (logoElement) {
            const logoData = getBase64Image(logoElement);
            if (logoData) {
                const logoHeight = 15;
                const logoAspectRatio = logoElement.naturalWidth / logoElement.naturalHeight;
                const logoWidth = logoHeight * logoAspectRatio;
                const logoX = (doc.internal.pageSize.getWidth() - logoWidth) / 2;
                doc.addImage(logoData, 'PNG', logoX, yPosition, logoWidth, logoHeight);
                yPosition += logoHeight + 10;
            }
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        const titleLines = doc.splitTextToSize(currentQuizTitle, usableWidth);
        doc.text(titleLines, 105, yPosition, { align: 'center' });
        yPosition += (titleLines.length * 7) + 10;
        currentPlayQuestions.forEach((question, index) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            const questionLines = doc.splitTextToSize(`${index + 1}. ${question.pergunta}`, usableWidth);
            let alternativesHeight = 0;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            question.alternativas.forEach(alt => {
                const alternativeLines = doc.splitTextToSize(`(A) ${alt}`, usableWidth - 5);
                alternativesHeight += (alternativeLines.length * 5) + 3;
            });
            const totalBlockHeight = (questionLines.length * 6) + alternativesHeight + 5;
            if (yPosition + totalBlockHeight > pageHeight - bottomMargin) {
                doc.addPage();
                yPosition = 20;
            }
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text(questionLines, leftMargin, yPosition);
            yPosition += (questionLines.length * 6) + 3;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            const alternativesPrefix = ['(A)', '(B)', '(C)', '(D)', '(E)'];
            question.alternativas.forEach((alt, alt_index) => {
                const alternativeLines = doc.splitTextToSize(`${alternativesPrefix[alt_index]} ${alt}`, usableWidth - 5);
                doc.text(alternativeLines, leftMargin + 5, yPosition);
                yPosition += (alternativeLines.length * 5) + 3;
            });
            yPosition += 5;
        });
        if (yPosition > pageHeight - bottomMargin - 20) {
            doc.addPage();
            yPosition = 20;
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Gabarito", leftMargin, yPosition);
        yPosition += 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        let gabaritoColumns = ["", ""];
        const questionsPerColumn = Math.ceil(currentPlayQuestions.length / 2);
        currentPlayQuestions.forEach((q, i) => {
            const respostaCorreta = String.fromCharCode(65 + q.correta_idx);
            const gabaritoLine = `${i + 1}. ${respostaCorreta}`;
            if (i < questionsPerColumn) {
                gabaritoColumns[0] += `${gabaritoLine}\n`;
            } else {
                gabaritoColumns[1] += `${gabaritoLine}\n`;
            }
        });
        doc.text(gabaritoColumns[0], leftMargin, yPosition);
        doc.text(gabaritoColumns[1], leftMargin + 50, yPosition);
        const safeTitle = currentQuizTitle.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
        doc.save(`Pedagoquiz_${safeTitle}.pdf`);
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
    downloadQuizButton.addEventListener('click', generateQuizPDF);

    updateVisitorCount();
    displayCategoryButtons();
});
