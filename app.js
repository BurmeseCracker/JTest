window.quizDatabase = [];
let currentIndex = 0;
let timeLeft = 5;
let timerInterval = null;
let isAnswered = false;
let currentCorrectOriginalKanji = "";

function loadDatabase() {
    let localData = localStorage.getItem("myBoxKanjiDB");
    if (localData) {
        window.quizDatabase = JSON.parse(localData);
    } else {
        window.quizDatabase = [];
    }
}

// ☰ Menu Toggle (Menu Pinned Dropdown ဖွင့်/ပိတ်)
function toggleMenu() {
    let dropdown = document.getElementById("menuDropdown");
    dropdown.classList.toggle("show");
}

// Menu အပြင်ဘက်ကို နှိပ်လိုက်ရင် Menu Dropdown ပိတ်သွားစေရန်
window.onclick = function(event) {
    if (!event.target.matches('.hamburger-btn') && !event.target.matches('.hamburger-btn span')) {
        let dropdown = document.getElementById("menuDropdown");
        if (dropdown && dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
        }
    }
}

// Page ရွေးချယ်ခြင်း
function selectPage(pageName) {
    let quizPage = document.getElementById("quizPage");
    let dashPage = document.getElementById("dashboardPage");
    let headerTitle = document.getElementById("appHeaderTitle");
    let itemQuiz = document.getElementById("menuItemQuiz");
    let itemDash = document.getElementById("menuItemDash");

    if (pageName === 'quiz') {
        quizPage.classList.add('active');
        dashPage.classList.remove('active');
        itemQuiz.classList.add('active');
        itemDash.classList.remove('active');
        headerTitle.innerText = "🎮 Quiz Mode";
        loadQuiz();
    } else {
        dashPage.classList.add('active');
        quizPage.classList.remove('active');
        itemDash.classList.add('active');
        itemQuiz.classList.remove('active');
        headerTitle.innerText = "⚙️ Admin Dashboard";
        renderDashboard();
    }

    // Menu ကို ပြန်ပိတ်မည်
    document.getElementById("menuDropdown").classList.remove("show");
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

    clearInterval(timerInterval);
    timeLeft = 5;
    isAnswered = false;
    if (tBox) tBox.innerText = "အချိန်: " + timeLeft + " စက္ကန့်";
    
    let current = window.quizDatabase[currentIndex];
    if (qBox) qBox.innerText = current.question;
    document.getElementById("result").innerText = "";
    document.getElementById("nextBtn").style.display = "none";

    currentCorrectOriginalKanji = current.correctKanji;
    let randomizedKanjis = shuffleArray(current.kanjis);

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
    currentIndex = (currentIndex + 1) % window.quizDatabase.length;
    loadQuiz();
}

window.onload = function() {
    loadDatabase();
    loadQuiz();
};
