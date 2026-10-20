window.quizDatabase = [];
let currentIndex = 0;
let timeLeft = 5; // ⏱️ အချိန်ကို 5 စက္ကန့်သို့ ပြောင်းထားသည်
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

function switchPage(pageName) {
    if (pageName === 'quiz') {
        document.getElementById("quizPage").classList.add('active');
        document.getElementById("dashboardPage").classList.remove('active');
        loadQuiz();
    } else {
        document.getElementById("dashboardPage").classList.add('active');
        document.getElementById("quizPage").classList.remove('active');
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
    if (window.quizDatabase.length === 0) {
        document.getElementById("questionBox").innerText = "မေးခွန်းများ မရှိသေးပါ။";
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

    let filtered = window.quizDatabase;
    if (mode === 'hard') filtered = window.quizDatabase.filter(i => i.isHardcore);
    if (mode === 'sentence') filtered = window.quizDatabase.filter(i => i.isSentence);
    
    scoreTotal = filtered.length;
    if (scoreTotal === 0) {
        alert("ဤ Mode အတွက် မေးခွန်းများ မရှိသေးပါ။");
        switchPage('dashboard');
        return;
    }
    startQuizRun();
}

function cancelQuizAction() {
    document.getElementById("quizStartModal").classList.remove("show");
    switchPage('dashboard');
}

function startQuizRun() {
    clearInterval(timerInterval);
    timeLeft = 5; // ⏱️ မေးခွန်းတိုင်းအတွက် အချိန်ကို 5 စက္ကန့် သတ်မှတ်သည်
    isAnswered = false;
    document.getElementById("timer").innerText = "အချိန်: " + timeLeft + " စက္ကန့်";
    document.getElementById("result").innerText = "";
    document.getElementById("nextBtn").style.display = "none";

    let activeList = currentQuizMode === 'hard' ? window.quizDatabase.filter(i => i.isHardcore) : 
                     currentQuizMode === 'sentence' ? window.quizDatabase.filter(i => i.isSentence) : 
                     window.quizDatabase;

    let current = activeList[currentIndex];
    if (!current) { showResultsModal(); return; }

    let qBox = document.getElementById("questionBox");
    let cContainer = document.getElementById("cardsContainer");

    if (currentQuizMode === 'sentence') {
        let sent = current.sentence;
        let target = current.targetWord;
        let correctAns = current.correctAnswer;

        let formattedSent = sent.replace(target, `<u style="text-decoration: underline; color: #2563eb; font-weight: bold;">${target}</u>`);
        qBox.innerHTML = `မျဉ်းသားထားသော စာလုံးအတွက် အဖြေကိုရွေးပါ:<br/><br/><span style="font-size: 20px;">${formattedSent}</span>`;

        let displayChoices = [correctAns];
        window.quizDatabase.forEach(item => {
            if (item.correctAnswer && item.correctAnswer !== correctAns && displayChoices.length < 3) {
                displayChoices.push(item.correctAnswer);
            }
        });
        while (displayChoices.length < 3) displayChoices.push("dummy");

        displayChoices = shuffleArray(displayChoices);
        cContainer.innerHTML = "";
        displayChoices.forEach(choice => {
            let card = document.createElement("div");
            card.className = "card";
            card.style.fontSize = "18px";
            card.innerText = choice;
            card.onclick = () => selectStandardCard(choice, correctAns, card);
            cContainer.appendChild(card);
        });

    } else if (currentQuizMode === 'easy') {
        let qText = Array.isArray(current.question) ? current.question[0] : current.question;
        let correctKanji = typeof current.correctKanji === 'object' ? current.correctKanji[qText] : current.correctKanji;
        qBox.innerText = qText;
        
        let displayKanjis = [correctKanji];
        current.kanjis.forEach(k => { if (k !== correctKanji && displayKanjis.length < 3) displayKanjis.push(k); });
        displayKanjis = shuffleArray(displayKanjis);

        cContainer.innerHTML = "";
        displayKanjis.forEach(kChar => {
            let card = document.createElement("div");
            card.className = "card";
            card.innerText = kChar;
            card.onclick = () => selectStandardCard(kChar, correctKanji, card);
            cContainer.appendChild(card);
        });

    } else if (currentQuizMode === 'reverse_easy') {
        let hMap = typeof current.correctKanji === 'object' ? current.correctKanji : { [current.question]: current.correctKanji };
        let hKeys = Object.keys(hMap);
        let targetH = hKeys[0];
        let targetK = hMap[targetH];

        qBox.innerText = targetK;

        let displayHs = [targetH];
        hKeys.forEach(h => { if (h !== targetH && displayHs.length < 3) displayHs.push(h); });
        displayHs = shuffleArray(displayHs);

        cContainer.innerHTML = "";
        displayHs.forEach(hChar => {
            let card = document.createElement("div");
            card.className = "card";
            card.style.fontSize = "18px";
            card.innerText = hChar;
            card.onclick = () => selectStandardCard(hChar, targetH, card);
            cContainer.appendChild(card);
        });

    } else {
        qBox.innerText = "🔥 Compare Mode: Kanji နှင့် Hiragana များကို တွဲဖက်ပါ";
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
                        document.getElementById("result").style.color = "#22c55e";
                        document.getElementById("result").innerText = "Compare Mode အားလုံး မှန်ကန်ပါတယ်! 🎉";
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
        document.getElementById("timer").innerText = "အချိန်: " + timeLeft + " စက္ကန့်";
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

function selectStandardCard(selectedVal, correctVal, cardElement) {
    if (isAnswered) return;
    isAnswered = true;
    clearInterval(timerInterval);

    let cards = document.getElementsByClassName("card");
    for (let c of cards) { if (c.innerText === correctVal) c.classList.add("correct"); }

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
                     currentQuizMode === 'sentence' ? window.quizDatabase.filter(i => i.isSentence) : 
                     window.quizDatabase;

    if (currentIndex < activeList.length) {
        startQuizRun();
    } else {
        showResultsModal();
    }
}

function showResultsModal() {
    document.getElementById("quizScoreText").innerText = `ရလဒ်: ${scoreCorrect} / ${scoreTotal} ပုဒ်`;
    document.getElementById("quizResultsModal").classList.add("show");
}

function closeResultsModal() {
    document.getElementById("quizResultsModal").classList.remove("show");
    hasShownStartModalThisSession = false;
    switchPage('dashboard');
}
