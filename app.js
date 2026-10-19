window.quizDatabase = [];
let currentIndex = 0;
let timeLeft = 30;
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
    window.quizDatabase = localData ? JSON.parse(localData) : [];
}

function toggleMenu() { document.getElementById("dropdownMenu").classList.toggle("show"); }

window.onclick = function(event) {
    if (!event.target.closest('.menu-icon-btn')) {
        let menuBox = document.getElementById("dropdownMenu");
        if (menuBox && menuBox.classList.contains('show')) menuBox.classList.remove('show');
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
        let items = window.quizDatabase.filter(i => i.isHardcore);
        if (items.length === 0) { alert("Compare Mode မေးခွန်းများ မရှိသေးပါ။[span_20](start_span)[span_20](end_span)[span_21](start_span)[span_21](end_span)"); switchPage('dashboard'); return; }
        scoreTotal = items.length;
    } else if (currentQuizMode === 'sentence') {
        let items = window.quizDatabase.filter(i => i.sentence);
        if (items.length === 0) { alert("Sentence Mode မေးခွန်းများ မရှိသေးပါ။[span_22](start_span)[span_22](end_span)[span_23](start_span)[span_23](end_span)"); switchPage('dashboard'); return; }
        scoreTotal = items.length;
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
    timeLeft = currentQuizMode === 'hard' ? 45 : 15;
    isAnswered = false;
    
    let tBox = document.getElementById("timer");
    if (tBox) tBox.innerText = "အချိန်: " + timeLeft + " စက္ကန့်";
    
    let qBox = document.getElementById("questionBox");
    let cContainer = document.getElementById("cardsContainer");
    let resultBox = document.getElementById("result");
    resultBox.innerText = "";
    document.getElementById("nextBtn").style.display = "none";

    let activeList = currentQuizMode === 'hard' ? window.quizDatabase.filter(i => i.isHardcore) : 
                     currentQuizMode === 'sentence' ? window.quizDatabase.filter(i => i.sentence) : 
                     window.quizDatabase;

    let current = activeList[currentIndex];
    if (!current) { showResultsModal(); return; }

    if (currentQuizMode === 'easy') {
        // --- EASY MODE: Hiragana Q -> Kanji Cards ---[span_24](start_span)[span_24](end_span)[span_25](start_span)[span_25](end_span)
        let qText = Array.isArray(current.question) ? current.question[0] : current.question;
        let correctKanji = typeof current.correctKanji === 'object' ? current.correctKanji[qText] : current.correctKanji;
        qBox.innerText = qText;
        
        let displayKanjis = [correctKanji];
        let others = current.kanjis.filter(k => k !== correctKanji);
        others = shuffleArray(others);
        for (let k of others) { if (displayKanjis.length < 3) displayKanjis.push(k); }
        displayKanjis = shuffleArray(displayKanjis);

        cContainer.innerHTML = "";
        displayKanjis.forEach(kChar => {
            let card = document.createElement("div");
            card.className = "card";
            card.innerText = kChar;
            card.onclick = () => selectStandardCard(kChar, correctKanji, card, 'kanji');
            cContainer.appendChild(card);
        });

    } else if (currentQuizMode === 'reverse_easy') {
        // --- REVERSE EASY MODE: Kanji Q -> Hiragana Cards ---[span_26](start_span)[span_26](end_span)[span_27](start_span)[span_27](end_span)
        let hMap = typeof current.correctKanji === 'object' ? current.correctKanji : { [current.question]: current.correctKanji };
        let hKeys = Object.keys(hMap);
        let targetH = hKeys[0];
        let targetK = hMap[targetH];

        qBox.innerText = targetK; // Kanji မေးခွန်း

        let displayHs = [targetH];
        let others = hKeys.filter(h => h !== targetH);
        for (let h of others) { if (displayHs.length < 3) displayHs.push(h); }
        displayHs = shuffleArray(displayHs);

        cContainer.innerHTML = "";
        displayHs.forEach(hChar => {
            let card = document.createElement("div");
            card.className = "card";
            card.style.fontSize = "18px";
            card.innerText = hChar;
            card.onclick = () => selectStandardCard(hChar, targetH, card, 'hiragana');
            cContainer.appendChild(card);
        });

    } else if (currentQuizMode === 'sentence') {
        // --- SENTENCE MODE: Underlined Hiragana -> Kanji Answers ---[span_28](start_span)[span_28](end_span)[span_29](start_span)[span_29](end_span)
        let sent = current.sentence;
        let targetH = current.sentenceTarget;
        let correctK = current.sentenceAnswer;

        // စာကြောင်းထဲမှ Hiragana အောက်မျဉ်းသားပြရန် <u> tag သုံးမည်
        let formattedSent = sent.replace(targetH, `<u style="text-decoration: underline; color: #2563eb; font-weight: bold;">${targetH}</u>`);
        qBox.innerHTML = `စာကြောင်းထဲမှ မျဉ်းသားထားသော စာလုံးအတွက် Kanji ကိုရွေးပါ:<br/><br/><span style="font-size: 20px;">${formattedSent}</span>`;

        let displayKanjis = [correctK];
        let others = current.kanjis.filter(k => k !== correctK);
        others = shuffleArray(others);
        for (let k of others) { if (displayKanjis.length < 3) displayKanjis.push(k); }
        displayKanjis = shuffleArray(displayKanjis);

        cContainer.innerHTML = "";
        displayKanjis.forEach(kChar => {
            let card = document.createElement("div");
            card.className = "card";
            card.innerText = kChar;
            card.onclick = () => selectStandardCard(kChar, correctK, card, 'kanji');
            cContainer.appendChild(card);
        });

    } else {
        // --- COMPARE MODE ---[span_30](start_span)[span_30](end_span)[span_31](start_span)[span_31](end_span)
        qBox.innerText = "🔥 Compare Mode: Kanji နှင့် Hiragana များကို တွဲဖက်ပါ[span_32](start_span)[span_32](end_span)[span_33](start_span)[span_33](end_span)";
        let hiraganaMap = current.correctKanji;
        let kanjiToHiragana = {};
        for (let h in hiraganaMap) { kanjiToHiragana[hiraganaMap[h]] = h; }

        let shuffledKanjis = shuffleArray(current.kanjis);
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

        shuffledKanjis.forEach(kChar => {
            let kBtn = document.createElement("button");
            kBtn.className = "match-btn kanji-match-btn";
            kBtn.innerText = kChar;
            kBtn.style.cssText = "padding: 12px 18px; font-size: 22px; font-weight: bold; background: #fff; border: 2px solid #cbd5e1; border-radius: 8px; cursor: pointer;";
            kBtn.onclick = () => {
                if (kBtn.classList.contains('matched')) return;
                document.querySelectorAll('.kanji-match-btn').forEach(b => b.style.borderColor = "#cbd5e1");
                kBtn.style.borderColor = "#2563eb";
                selectedKanjiItem = { kanji: kChar, element: kBtn, targetHiragana: kanjiToHiragana[kChar] };
            };
            kMatchContainer.appendChild(kBtn);
        });

        shuffleArray(hiraganaKeys).forEach(hKey => {
            let hBtn = document.createElement("button");
            hBtn.className = "match-btn hiragana-match-btn";
            hBtn.innerText = hKey;
            hBtn.style.cssText = "padding: 10px 16px; font-size: 16px; font-weight: bold; background: #f8fafc; border: 2px solid #cbd5e1; border-radius: 8px; cursor: pointer;";
            kBtn.onclick = () => {}; // dummy
            hBtn.onclick = () => {
                if (hBtn.classList.contains('matched') || !selectedKanjiItem) return;
                if (selectedKanjiItem.targetHiragana === hKey) {
                    selectedKanjiItem.element.classList.add('matched');
                    selectedKanjiItem.element.style.background = "#dcfce7";
                    selectedKanjiItem.element.style.borderColor = "#22c55e";
                    selectedKanjiItem.element.disabled = true;

                    hBtn.classList.add('matched');
                    hBtn.style.background = "#dcfce7";
                    hBtn.style.borderColor = "#22c55e";
                    hBtn.disabled = true;

                    selectedKanjiItem = null;
                    matchedPairsCount++;

                    if (matchedPairsCount === hardcoreTotalPairs) {
                        scoreCorrect++;
                        clearInterval(timerInterval);
                        resultBox.style.color = "#22c55e";
                        resultBox.innerText = "Compare Mode အားလုံး မှန်ကန်ပါတယ်! 🎉";
                        isAnswered = true;
                        document.getElementById("nextBtn").style.display = "inline-block";
                    }
                } else {
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

function selectStandardCard(selectedVal, correctVal, cardElement, type) {
    if (isAnswered) return;
    isAnswered = true;
    clearInterval(timerInterval);

    let cards = document.getElementsByClassName("card");
    for (let i = 0; i < cards.length; i++) {
        if (cards[i].innerText === correctVal) cards[i].classList.add("correct");
    }

    let resultBox = document.getElementById("result");
    if (selectedVal === correctVal) {
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
    let activeList = currentQuizMode === 'hard' ? window.quizDatabase.filter(i => i.isHardcore) : 
                     currentQuizMode === 'sentence' ? window.quizDatabase.filter(i => i.sentence) : 
                     window.quizDatabase;

    if (currentIndex < activeList.length) {
        startQuizRun();
    } else {
        showResultsModal();
    }
}

function showResultsModal() {
    document.getElementById("quizScoreText").innerText = `မှန်ကန်မှု ရလဒ်: ${scoreCorrect} / ${scoreTotal} ပုဒ် (${currentQuizMode.toUpperCase()} Mode)`;
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
