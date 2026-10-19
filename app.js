window.quizDatabase = [];
let currentIndex = 0;
let timeLeft = 10;
let timerInterval = null;
let isAnswered = false;

// Quiz Session & Mode State
let currentQuizMode = 'easy'; 
let scoreCorrect = 0;
let scoreTotal = 0;
let hasShownStartModalThisSession = false;

// Hardcore Active Match State variables
let activeHardcoreItems = [];
let hardcoreCurrentPairIndex = 0;

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

    if (!hasShownStartModalThisSession) {
        document.getElementById("quizStartModal").classList.add("show");
    } else {
        startQuizRun();
    }
}

function startQuizMode(mode) {
    currentQuizMode = mode;
    hasShownStartModalThisSession = true;
    document.getElementById("quizStartModal").classList.remove("show");

    currentIndex = 0;
    scoreCorrect = 0;

    if (currentQuizMode === 'hard') {
        // Hardcore mode အတွက် ဒေတာများကို စုစည်းမည်
        activeHardcoreItems = [];
        window.quizDatabase.forEach(item => {
            if (item.isHardcore && Array.isArray(item.question)) {
                item.question.forEach(q => {
                    activeHardcoreItems.push({
                        kanjis: item.kanjis,
                        question: q,
                        correctKanji: item.correctKanji[q]
                    });
                });
            }
        });

        if (activeHardcoreItems.length === 0) {
            alert("Hardcore မေးခွန်းများ မရှိသေးပါ။ Dashboard တွင် Hardcore Switch ဖွင့်၍ မေးခွန်းအသစ်များ ထည့်ပါ။");
            switchPage('dashboard');
            return;
        }
        scoreTotal = activeHardcoreItems.length;
    } else {
        scoreTotal = window.quizDatabase.length;
    }

    startQuizRun();
}

function cancelQuizAction() {
    document.getElementById("quizStartModal").classList.remove("show");
    switchPage('dashboard');
}

function startQuizRun() {
    clearInterval(timerInterval);
    timeLeft = 10;
    isAnswered = false;
    
    let tBox = document.getElementById("timer");
    if (tBox) tBox.innerText = "အချိန်: " + timeLeft + " စက္ကန့်";
    
    let currentQuestionText = "";
    let displayKanjis = [];
    let currentCorrectOriginalKanji = "";

    if (currentQuizMode === 'easy') {
        let current = window.quizDatabase[currentIndex];
        // Easy Mode တွင် အကယ်၍ ထိုအကွက်သည် Hardcore ဖြစ်နေပါက ပထမဆုံး Hiragana ကို ယူမည်
        currentQuestionText = Array.isArray(current.question) ? current.question[0] : current.question;
        currentCorrectOriginalKanji = typeof current.correctKanji === 'object' ? current.correctKanji[currentQuestionText] : current.correctKanji;
        
        displayKanjis = [currentCorrectOriginalKanji];
        let otherKanjis = current.kanjis.filter(k => k !== currentCorrectOriginalKanji);
        otherKanjis = shuffleArray(otherKanjis);
        
        for (let k of otherKanjis) {
            if (displayKanjis.length < 3) displayKanjis.push(k);
        }
        displayKanjis = shuffleArray(displayKanjis);
    } else {
        // Hardcore Mode (မေးခွန်းကြီးထဲမှ တစ်ခုချင်းစီကို တစ်ပုဒ်စီ ထုတ်ပြမည်)
        let item = activeHardcoreItems[currentIndex];
        currentQuestionText = item.question;
        currentCorrectOriginalKanji = item.correctKanji;
        displayKanjis = shuffleArray(item.kanjis);
    }

    let qBox = document.getElementById("questionBox");
    if (qBox) qBox.innerText = currentQuestionText;
    
    document.getElementById("result").innerText = "";
    document.getElementById("nextBtn").style.display = "none";
    
    let cContainer = document.getElementById("cardsContainer");
    if (cContainer) {
        cContainer.innerHTML = "";
        displayKanjis.forEach((kanjiChar, index) => {
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
                // အချိန်ကုန်သွားပါက ပထမဆုံး card သို့မဟုတ် မှန်ကန်သော card ကို ဖော်ပြမည်
                let cards = document.getElementsByClassName("card");
                for (let i = 0; i < cards.length; i++) {
                    cards[i].classList.add("wrong");
                }
                let resultBox = document.getElementById("result");
                resultBox.style.color = "#ef4444";
                resultBox.innerText = "အချိန်ကုန်သွားပါပြီ ⌛ ❌";
                isAnswered = true;
                document.getElementById("nextBtn").style.display = "inline-block";
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

function nextQuiz() {
    currentIndex++;
    let totalLimit = currentQuizMode === 'hard' ? activeHardcoreItems.length : window.quizDatabase.length;
    
    if (currentIndex < totalLimit) {
        startQuizRun();
    } else {
        showResultsModal();
    }
}

function showResultsModal() {
    let scoreText = document.getElementById("quizScoreText");
    scoreText.innerText = `မှန်ကန်မှု ရလဒ်: ${scoreCorrect} / ${scoreTotal} ပုဒ် (${currentQuizMode.toUpperCase()} Mode)`;
    document.getElementById("quizResultsModal").classList.add("show");
}

function closeResultsModal() {
    document.getElementById("quizResultsModal").classList.remove("show");
    hasShownStartModalThisSession = false;
    switchPage('dashboard');
}

window.onload = function() {
    loadDatabase();
    loadQuiz();
};
