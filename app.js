window.quizDatabase = [];
let currentIndex = 0;
let timeLeft = 5;
let timerInterval = null;
let isAnswered = false;
let currentCorrectOriginalKanji = "";

// Score Tracking & Session Flags
let scoreCorrect = 0;
let scoreTotal = 0;
let hasShownStartModalThisSession = false;

function loadDatabase() {
    let localData = localStorage.getItem("myBoxKanjiDB");
    if (localData) {
        window.quizDatabase = JSON.parse(localData);
    } else {
        window.quizDatabase = [];
    }
}

function toggleMenu() {
    let menuBox = document.getElementById("dropdownMenu");
    menuBox.classList.toggle("show");
}

window.onclick = function(event) {
    if (!event.target.closest('.menu-icon-btn')) {
        let menuBox = document.getElementById("dropdownMenu");
        if (menuBox && menuBox.classList.contains('show')) {
            menuBox.classList.remove('show');
        }
    }
}

function switchPage(pageName) {
    let quizPage = document.getElementById("quizPage");
    let dashPage = document.getElementById("dashboardPage");
    let headerTitle = document.getElementById("headerTitleText");
    let dropItemQuiz = document.getElementById("dropItemQuiz");
    let dropItemDash = document.getElementById("dropItemDash");

    if (pageName === 'quiz') {
        quizPage.classList.add('active');
        dashPage.classList.remove('active');
        dropItemQuiz.classList.add('active');
        dropItemDash.classList.remove('active');
        headerTitle.innerText = "🎮 Quiz Mode";
        loadQuiz();
    } else {
        dashPage.classList.add('active');
        quizPage.classList.remove('active');
        dropItemDash.classList.add('active');
        dropItemQuiz.classList.remove('active');
        headerTitle.innerText = "⚙️ Admin Dashboard";
        renderDashboard();
    }

    document.getElementById("dropdownMenu").classList.remove("show");
}

function shuffleArray(array) {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function loadQuiz() {
    loadDatabase();
    let qBox = document.getElementById("questionBox");
    let cContainer = document.getElementById("cardsContainer");
    let tBox = document.getElementById("timer");

    if (window.quizDatabase.length === 0) {
        if (qBox) qBox.innerText = "မေးခွန်းများ မရှိသေးပါ။ Dashboard သို့သွား၍ မေးခွန်းများ ထည့်ပါ။";
        if (cContainer) cContainer.innerHTML = "";
        if (tBox) tBox.innerText = "အချိန်: -";
        return;
    }

    // Reset session score tracking
    currentIndex = 0;
    scoreCorrect = 0;
    scoreTotal = window.quizDatabase.length;

    // Show Ready modal only once per session
    if (!hasShownStartModalThisSession) {
        document.getElementById("quizStartModal").classList.add("show");
    } else {
        startQuizRun();
    }
}

function startQuizAction() {
    hasShownStartModalThisSession = true;
    document.getElementById("quizStartModal").classList.remove("show");
    startQuizRun();
}

function cancelQuizAction() {
    document.getElementById("quizStartModal").classList.remove("show");
    switchPage('dashboard');
}

function startQuizRun() {
    clearInterval(timerInterval);
    timeLeft = 5;
    isAnswered = false;
    
    let tBox = document.getElementById("timer");
    if (tBox) tBox.innerText = "အချိန်: " + timeLeft + " စက္ကန့်";
    
    let current = window.quizDatabase[currentIndex];
    let qBox = document.getElementById("questionBox");
    if (qBox) qBox.innerText = current.question;
    
    document.getElementById("result").innerText = "";
    document.getElementById("nextBtn").style.display = "none";

    currentCorrectOriginalKanji = current.correctKanji;
    let randomizedKanjis = shuffleArray(current.kanjis);

    let cContainer = document.getElementById("cardsContainer");
    if (cContainer) {
        cContainer.innerHTML = "";
        randomizedKanjis.forEach((kanjiChar, index) => {
            let cardDiv = document.createElement("div");
            cardDiv.className = "card";
            cardDiv.id = "card-" + index;
            cardDiv.innerText = kanjiChar;

            cardDiv.onclick = () => selectCard(kanjiChar, currentCorrectOriginalKanji, index);
            cContainer.appendChild(cardDiv);
        });
    }

    startTimer();
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        let tBox = document.getElementById("timer");
        if (tBox) tBox.innerText = "အချိန်: " + timeLeft + " စက္ကန့်";

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            if (!isAnswered) {
                timeOutAction();
            }
        }
    }, 1000);
}

function selectCard(selectedKanji, correctKanji, clickedIndex) {
    if (isAnswered) return;
    isAnswered = true;
    clearInterval(timerInterval);

    let cards = document.getElementsByClassName("card");
    for (let i = 0; i < cards.length; i++) {
        if (cards[i].innerText === correctKanji) {
            cards[i].classList.add("correct");
        }
    }

    let resultBox = document.getElementById("result");
    if (selectedKanji === correctKanji) {
        scoreCorrect++;
        resultBox.style.color = "#22c55e";
        resultBox.innerText = "မှန်ကန်ပါတယ်! 🎉";
    } else {
        cards[clickedIndex].classList.add("wrong");
        resultBox.style.color = "#ef4444";
        resultBox.innerText = "အဖြေမှားယွင်းနေပါတယ် ❌";
    }

    document.getElementById("nextBtn").style.display = "inline-block";
}

function timeOutAction() {
    isAnswered = true;
    let cards = document.getElementsByClassName("card");

    for (let i = 0; i < cards.length; i++) {
        if (cards[i].innerText === currentCorrectOriginalKanji) {
            cards[i].classList.add("correct");
        }
    }

    document.getElementById("timer").innerText = "အချိန်ကုန်သွားပါပြီ ⌛";
    let resultBox = document.getElementById("result");
    resultBox.style.color = "#ef4444";
    resultBox.innerText = "အချိန်ကုန်သွားပါပြီ ❌";
    
    document.getElementById("nextBtn").style.display = "inline-block";
}

function nextQuiz() {
    currentIndex++;
    if (currentIndex < window.quizDatabase.length) {
        startQuizRun();
    } else {
        showResultsModal();
    }
}

function showResultsModal() {
    let scoreText = document.getElementById("quizScoreText");
    scoreText.innerText = `မှန်ကန်မှု ရလဒ်: ${scoreCorrect} / ${scoreTotal} ပုဒ်`;
    document.getElementById("quizResultsModal").classList.add("show");
}

function closeResultsModal() {
    document.getElementById("quizResultsModal").classList.remove("show");
    hasShownStartModalThisSession = false; // Reset to show start modal on next quiz session
    switchPage('dashboard');
}

window.onload = function() {
    loadDatabase();
    loadQuiz();
};
