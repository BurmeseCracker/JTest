window.quizDatabase = [];
let currentIndex = 0;
let timeLeft = 45;
let timerInterval = null;
let isAnswered = false;

let currentQuizMode = 'easy'; 
let scoreCorrect = 0;
let scoreTotal = 0;
let hasShownStartModalThisSession = false;

let selectedKanjiItem = null;
let matchedPairsCount = 0;
let hardcoreTotalPairs = 0;

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
        let hardcoreSets = window.quizDatabase.filter(item => item.isHardcore);
        if (hardcoreSets.length === 0) {
            alert("Hardcore မေးခွန်းများ မရှိသေးပါ။ Dashboard တွင် Hardcore Mode ဖွင့်၍ မေးခွန်းအသစ်များ ထည့်ပါ။");
            switchPage('dashboard');
            return;
        }
        scoreTotal = hardcoreSets.length;
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
    timeLeft = currentQuizMode === 'hard' ? 45 : 10;
    isAnswered = false;
    
    let tBox = document.getElementById("timer");
    if (tBox) tBox.innerText = "အချိန်: " + timeLeft + " စက္ကန့်";
    
    let qBox = document.getElementById("questionBox");
    let cContainer = document.getElementById("cardsContainer");
    let resultBox = document.getElementById("result");
    resultBox.innerText = "";
    document.getElementById("nextBtn").style.display = "none";

    if (currentQuizMode === 'easy') {
        // --- EASY MODE (ပုံမှန် တစ်ပုဒ်ချင်း) ---
        let current = window.quizDatabase[currentIndex];
        let currentQuestionText = Array.isArray(current.question) ? current.question[0] : current.question;
        let currentCorrectOriginalKanji = typeof current.correctKanji === 'object' ? current.correctKanji[currentQuestionText] : current.correctKanji;
        
        qBox.innerText = currentQuestionText;
        
        let displayKanjis = [currentCorrectOriginalKanji];
        let otherKanjis = current.kanjis.filter(k => k !== currentCorrectOriginalKanji);
        otherKanjis = shuffleArray(otherKanjis);
        
        for (let k of otherKanjis) {
            if (displayKanjis.length < 3) displayKanjis.push(k);
        }
        displayKanjis = shuffleArray(displayKanjis);

        cContainer.innerHTML = "";
        displayKanjis.forEach((kanjiChar, index) => {
            let cardDiv = document.createElement("div");
            cardDiv.className = "card";
            cardDiv.innerText = kanjiChar;
            cardDiv.onclick = () => selectEasyCard(kanjiChar, currentCorrectOriginalKanji, cardDiv);
            cContainer.appendChild(cardDiv);
        });

    } else {
        // --- HARDCORE MODE (Kanji များရော Hiragana များပါ အစုံအလင် တစ်ပြိုင်နက်တည်းပေါ်မည်) ---
        let currentSet = window.quizDatabase.filter(item => item.isHardcore)[currentIndex];
        if (!currentSet) {
            showResultsModal();
            return;
        }

        qBox.innerText = "🔥 Hardcore Mode: Kanji များကိုနှိပ်ပြီး ၎င်းတို့နှင့်ကိုက်ညီသော Hiragana များနှင့် တွဲပါ";
        
        let hiraganaMap = currentSet.correctKanji; // { "hiragana": "kanji" }
        // ပြောင်းပြန် map ပြုလုပ်ခြင်း (Kanji -> Hiragana တွဲရန်)
        let kanjiToHiragana = {};
        for (let h in hiraganaMap) {
            kanjiToHiragana[hiraganaMap[h]] = h;
        }

        let shuffledKanjis = shuffleArray(currentSet.kanjis);
        let hiraganaKeys = Object.keys(hiraganaMap);
        hardcoreTotalPairs = hiraganaKeys.length;
        matchedPairsCount = 0;
        selectedKanjiItem = null;

        cContainer.innerHTML = `
            <div style="width: 100%; display: flex; flex-direction: column; gap: 15px;">
                <div style="font-size: 13px; font-weight: bold; color: #64748b; text-align: left;">Kanji များကို ရွေးပါ:</div>
                <div id="kanjiMatchContainer" style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;"></div>
                
                <hr style="border: 0; border-top: 1px solid #e2e8f0; width: 100%; margin: 5px 0;">
                
                <div style="font-size: 13px; font-weight: bold; color: #64748b; text-align: left;">Hiragana များကို ရွေးပါ:</div>
                <div id="hiraganaMatchContainer" style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;"></div>
            </div>
        `;

        let kMatchContainer = document.getElementById("kanjiMatchContainer");
        let hMatchContainer = document.getElementById("hiraganaMatchContainer");

        // Kanji ခလုတ်များ ဖန်တီးခြင်း
        shuffledKanjis.forEach(kChar => {
            let kBtn = document.createElement("button");
            kBtn.className = "match-btn kanji-match-btn";
            kBtn.innerText = kChar;
            kBtn.style.cssText = "padding: 12px 18px; font-size: 22px; font-weight: bold; background: #fff; border: 2px solid #cbd5e1; border-radius: 8px; cursor: pointer; min-width: 50px;";
            
            kBtn.onclick = () => {
                if (kBtn.classList.contains('matched')) return;
                document.querySelectorAll('.kanji-match-btn').forEach(b => b.style.borderColor = "#cbd5e1");
                kBtn.style.borderColor = "#2563eb";
                selectedKanjiItem = { kanji: kChar, element: kBtn, targetHiragana: kanjiToHiragana[kChar] };
            };
            kMatchContainer.appendChild(kBtn);
        });

        // Hiragana ခလုတ်များ ဖန်တီးခြင်း
        shuffleArray(hiraganaKeys).forEach(hKey => {
            let hBtn = document.createElement("button");
            hBtn.className = "match-btn hiragana-match-btn";
            hBtn.innerText = hKey;
            hBtn.style.cssText = "padding: 10px 16px; font-size: 16px; font-weight: bold; background: #f8fafc; border: 2px solid #cbd5e1; border-radius: 8px; cursor: pointer;";
            
            hBtn.onclick = () => {
                if (hBtn.classList.contains('matched') || !selectedKanjiItem) return;

                if (selectedKanjiItem.targetHiragana === hKey) {
                    // မှန်ကန်ပါက
                    selectedKanjiItem.element.classList.add('matched');
                    selectedKanjiItem.element.style.background = "#dcfce7";
                    selectedKanjiItem.element.style.borderColor = "#22c55e";
                    selectedKanjiItem.element.style.color = "#166534";
                    selectedKanjiItem.element.disabled = true;

                    hBtn.classList.add('matched');
                    hBtn.style.background = "#dcfce7";
                    hBtn.style.borderColor = "#22c55e";
                    hBtn.style.color = "#166534";
                    hBtn.disabled = true;

                    selectedKanjiItem = null;
                    matchedPairsCount++;

                    if (matchedPairsCount === hardcoreTotalPairs) {
                        scoreCorrect++;
                        clearInterval(timerInterval);
                        resultBox.style.color = "#22c55e";
                        resultBox.innerText = "Hardcore အားလုံး မှန်ကန်ပါတယ်! 🎉";
                        isAnswered = true;
                        document.getElementById("nextBtn").style.display = "inline-block";
                    }
                } else {
                    // မှားယွင်းပါက
                    hBtn.style.background = "#fee2e2";
                    hBtn.style.borderColor = "#ef4444";
                    setTimeout(() => {
                        hBtn.style.background = "#f8fafc";
                        hBtn.style.borderColor = "#cbd5e1";
                    }, 500);
                }
            };
            hMatchContainer.appendChild(hBtn);
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
                isAnswered = true;
                let resultBox = document.getElementById("result");
                resultBox.style.color = "#ef4444";
                resultBox.innerText = "အချိန်ကုန်သွားပါပြီ ⌛ ❌";
                document.getElementById("nextBtn").style.display = "inline-block";
            }
        }
    }, 1000);
}

function selectEasyCard(selectedKanji, correctKanji, cardElement) {
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
        cardElement.classList.add("wrong");
        resultBox.style.color = "#ef4444";
        resultBox.innerText = "အဖြေမှားယွင်းနေပါတယ် ❌";
    }

    document.getElementById("nextBtn").style.display = "inline-block";
}

function nextQuiz() {
    currentIndex++;
    let totalLimit = currentQuizMode === 'hard' ? window.quizDatabase.filter(item => item.isHardcore).length : window.quizDatabase.length;
    
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
