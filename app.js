let quizDatabase = [];
let currentIndex = 0;
let timeLeft = 5;
let timerInterval;
let isAnswered = false;
let currentCorrectOriginalKanji = "";

// Database ရယူခြင်း
function loadDatabase() {
    let localData = localStorage.getItem("myBoxKanjiDB");
    if (localData) {
        quizDatabase = JSON.parse(localData);
    } else {
        quizDatabase = [];
    }
}

// Page ပြောင်းလဲခြင်း (Quiz Mode vs Dashboard)
function switchPage(pageName) {
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.page-view').forEach(page => page.classList.remove('active'));

    if (pageName === 'quiz') {
        document.querySelectorAll('.nav-item')[0].classList.add('active');
        document.getElementById('quizPage').classList.add('active');
        loadQuiz();
    } else {
        document.querySelectorAll('.nav-item')[1].classList.add('active');
        document.getElementById('dashboardPage').classList.add('active');
        renderDashboard();
    }
}

// Array Shuffle
function shuffleArray(array) {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Quiz မေးခွန်း Load လုပ်ခြင်း
function loadQuiz() {
    loadDatabase();
    if (quizDatabase.length === 0) {
        document.getElementById("questionBox").innerText = "မေးခွန်းများ မရှိသေးပါ။ Dashboard သို့သွား၍ မေးခွန်းများ ထည့်ပါ။";
        document.getElementById("cardsContainer").innerHTML = "";
        document.getElementById("timer").innerText = "အချိန်: -";
        return;
    }

    clearInterval(timerInterval);
    timeLeft = 5;
    isAnswered = false;
    document.getElementById("timer").innerText = "အချိန်: " + timeLeft + " စက္ကန့်";
    
    let current = quizDatabase[currentIndex];
    document.getElementById("questionBox").innerText = current.question;
    document.getElementById("result").innerText = "";
    document.getElementById("nextBtn").style.display = "none";

    currentCorrectOriginalKanji = current.correctKanji;
    let randomizedKanjis = shuffleArray(current.kanjis);

    let cardsContainer = document.getElementById("cardsContainer");
    cardsContainer.innerHTML = "";
    
    randomizedKanjis.forEach((kanjiChar, index) => {
        let cardDiv = document.createElement("div");
        cardDiv.className = "card";
        cardDiv.id = "card-" + index;
        cardDiv.innerText = kanjiChar;

        cardDiv.onclick = () => selectCard(kanjiChar, currentCorrectOriginalKanji, index);
        cardsContainer.appendChild(cardDiv);
    });

    startTimer();
}

// Timer စတင်ခြင်း
function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").innerText = "အချိန်: " + timeLeft + " စက္ကန့်";

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            if (!isAnswered) {
                timeOutAction();
            }
        }
    }, 1000);
}

// Card ရွေးချယ်ခြင်း
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

    if (selectedKanji === correctKanji) {
        document.getElementById("result").style.color = "#22c55e";
        document.getElementById("result").innerText = "မှန်ကန်ပါတယ်! 🎉";
    } else {
        cards[clickedIndex].classList.add("wrong");
        document.getElementById("result").style.color = "#ef4444";
        document.getElementById("result").innerText = "အဖြေမှားယွင်းနေပါတယ် ❌";
    }

    document.getElementById("nextBtn").style.display = "inline-block";
}

// အချိန်ကုန်သွားသောအခါ
function timeOutAction() {
    isAnswered = true;
    let cards = document.getElementsByClassName("card");

    for (let i = 0; i < cards.length; i++) {
        if (cards[i].innerText === currentCorrectOriginalKanji) {
            cards[i].classList.add("correct");
        }
    }

    document.getElementById("timer").innerText = "အချိန်ကုန်သွားပါပြီ ⌛";
    document.getElementById("result").style.color = "#ef4444";
    document.getElementById("result").innerText = "အချိန်ကုန်သွားပါပြီ ❌";
    
    document.getElementById("nextBtn").style.display = "inline-block";
}

// နောက်တစ်ပုဒ်သို့ သွားခြင်း
function nextQuiz() {
    currentIndex = (currentIndex + 1) % quizDatabase.length;
    loadQuiz();
}

// App စတင်ခြင်း
loadDatabase();
loadQuiz();
