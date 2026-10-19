function toggleSentenceAdminUI() {
    let isSentence = document.getElementById("sentenceModeSwitch").checked;
    let sentenceFields = document.getElementById("sentenceAdminFields");
    let standardFields = document.getElementById("standardAdminFields");

    if (isSentence) {
        sentenceFields.style.display = "flex";
        standardFields.style.display = "none";
    } else {
        sentenceFields.style.display = "none";
        standardFields.style.display = "block";
    }
}

function renderDashboard() {
    let listContainer = document.getElementById("dashboardList");
    if (!listContainer) return;
    loadDatabase();
    listContainer.innerHTML = "";

    if (window.quizDatabase.length === 0) {
        listContainer.innerHTML = `<div style="text-align: center; color: #64748b; padding: 20px;">မေးခွန်းများ မရှိသေးပါ။</div>`;
        return;
    }

    window.quizDatabase.forEach((item, index) => {
        let badge = item.isSentence ? `<span style="background: #ede9fe; color: #7c3aed; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold;">📝 Sentence</span>` : 
                    item.isHardcore ? `<span style="background: #fee2e2; color: #ef4444; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold;">🔥 Compare</span>` : 
                    `<span style="background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold;">🟢 Easy</span>`;

        let itemDiv = document.createElement("div");
        itemDiv.className = "list-item";
        itemDiv.innerHTML = `
            <div>
                <div style="margin-bottom: 6px;">${badge}</div>
                <div style="font-size: 14px; color: #475569;"><b>Q:</b> ${item.isSentence ? item.sentence : (Array.isArray(item.question) ? item.question[0] : item.question)}</div>
            </div>
            <button class="btn-danger" style="padding: 6px 12px; font-size: 13px;" onclick="deleteQuizItem(${index})">ဖျက်မည်</button>
        `;
        listContainer.appendChild(itemDiv);
    });
}

function addKanjiInputBox() {
    let isHardcore = document.getElementById("globalHardcoreSwitch").checked;
    let container = document.getElementById("kanjiInputsContainer");
    let currentRows = container.getElementsByClassName("kanji-input-row").length;
    let limit = isHardcore ? 10 : 3;
    if (currentRows >= limit) {
        alert(isHardcore ? "Compare Mode တွင် Kanji အများဆုံး ၁၀ ခုအထိ ထည့်နိုင်ပါသည်။[span_12](start_span)[span_12](end_span)[span_13](start_span)[span_13](end_span)" : "Normal Mode တွင် Kanji အများဆုံး ၃ ခုအထိ ထည့်နိုင်ပါသည်။[span_14](start_span)[span_14](end_span)[span_15](start_span)[span_15](end_span)");
        return;
    }
    let rowDiv = document.createElement("div");
    rowDiv.className = "kanji-input-row";
    rowDiv.innerHTML = `
        <input type="text" class="kanji-box" placeholder="Kanji ထည့်ရန်" maxlength="3" required>
        <button type="button" class="remove-kanji-btn" onclick="this.parentElement.remove(); updateAllRowAnswerDropdowns();">✕</button>
    `;
    container.appendChild(rowDiv);
    updateAllRowAnswerDropdowns();
}

function addHiraganaInputBox() {
    let isHardcore = document.getElementById("globalHardcoreSwitch").checked;
    let container = document.getElementById("hiraganaInputsContainer");
    if (!isHardcore) { alert("Normal Mode တွင် Hiragana ၁ ခုသာ ထည့်နိုင်ပါသည်။[span_16](start_span)[span_16](end_span)[span_17](start_span)[span_17](end_span)"); return; }
    let rowDiv = document.createElement("div");
    rowDiv.className = "hiragana-input-row";
    rowDiv.style.cssText = "display: flex; gap: 8px; margin-bottom: 10px; align-items: center; background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;";
    rowDiv.innerHTML = `
        <input type="text" class="hiragana-box" placeholder="Hiragana မေးခွန်း" style="flex: 2; padding: 9px; border: 1px solid #cbd5e1; border-radius: 6px;" required>
        <select class="row-answer-select" style="flex: 1; padding: 9px; border: 1px solid #cbd5e1; border-radius: 6px; background: #fff; font-weight: bold; color: #2563eb;">
            <option value="">အဖြေမှန်ရွေးပါ</option>
        </select>
        <button type="button" class="remove-kanji-btn" onclick="this.parentElement.remove()">✕</button>
    `;
    container.appendChild(rowDiv);
    updateAllRowAnswerDropdowns();
}

document.addEventListener("change", function(e) {
    if (e.target && e.target.id === "globalHardcoreSwitch") {
        let isHardcore = e.target.checked;
        let container = document.getElementById("hiraganaInputsContainer");
        if (!isHardcore && container) {
            let rows = container.getElementsByClassName("hiragana-input-row");
            while (rows.length > 1) rows[rows.length - 1].remove();
        }
    }
});

function updateAllRowAnswerDropdowns() {
    let kanjiBoxes = document.getElementsByClassName("kanji-box");
    let validKanjis = [];
    for (let box of kanjiBoxes) {
        let val = box.value.trim();
        if (val !== "" && !validKanjis.includes(val)) validKanjis.push(val);
    }
    let answerSelects = document.getElementsByClassName("row-answer-select");
    for (let select of answerSelects) {
        let prev = select.value;
        select.innerHTML = `<option value="">အဖြေမှန်ရွေးပါ</option>`;
        validKanjis.forEach(k => {
            let opt = document.createElement("option");
            opt.value = k;
            opt.innerText = k;
            if (k === prev) opt.selected = true;
            select.appendChild(opt);
        });
    }
}

document.addEventListener("input", function(e) {
    if (e.target && e.target.classList.contains("kanji-box")) updateAllRowAnswerDropdowns();
});

function isHiragana(str) {
    return /^[\u3040-\u309F\sー]+$/.test(str);
}

function addQuizSet() {
    let isSentence = document.getElementById("sentenceModeSwitch").checked;
    loadDatabase();

    if (isSentence) {
        let sentenceText = document.getElementById("sentenceInputBox").value.trim();
        let targetWord = document.getElementById("sentenceTargetWord").value.trim();
        let underlineType = document.getElementById("sentenceUnderlineType").value;
        let correctAnswer = document.getElementById("sentenceCorrectAnswer").value.trim();

        if (!sentenceText || !targetWord || !correctAnswer) {
            alert("ကျေးဇူးပြု၍ Sentence အချက်အလက်များကို အပြည့်အစုံ ဖြည့်ပါ။");
            return;
        }

        window.quizDatabase.push({
            isSentence: true,
            sentence: sentenceText,
            targetWord: targetWord,
            underlineType: underlineType, // 'kanji' သို့မဟုတ် 'hiragana'
            correctAnswer: correctAnswer
        });

        localStorage.setItem("myBoxKanjiDB", JSON.stringify(window.quizDatabase));
        alert("Sentence မေးခွန်း သိမ်းဆည်းပြီးပါပြီ! 🎉");
        
        document.getElementById("sentenceInputBox").value = "";
        document.getElementById("sentenceTargetWord").value = "";
        document.getElementById("sentenceCorrectAnswer").value = "";
        document.getElementById("sentenceModeSwitch").checked = false;
        toggleSentenceAdminUI();
        renderDashboard();
        return;
    }

    let kanjiBoxes = document.getElementsByClassName("kanji-box");
    let kanjis = [];
    for (let box of kanjiBoxes) {
        let val = box.value.trim();
        if (val !== "") kanjis.push(val);
    }
    if (kanjis.length < 2) { alert("Kanji အနည်းဆုံး ၂ ခု ဖြည့်ပါ။"); return; }

    let hiraganaRows = document.getElementsByClassName("hiragana-input-row");
    let questionsList = [];
    let answersMap = {};
    let isHardcore = document.getElementById("globalHardcoreSwitch").checked;

    for (let row of hiraganaRows) {
        let qBox = row.querySelector(".hiragana-box");
        let aSelect = row.querySelector(".row-answer-select");
        let question = qBox ? qBox.value.trim() : "";
        let correctKanji = aSelect ? aSelect.value : "";
        if (question !== "" && correctKanji !== "") {
            questionsList.push(question);
            answersMap[question] = correctKanji;
        }
    }

    window.quizDatabase.push({
        kanjis: [...kanjis],
        question: isHardcore ? questionsList : questionsList[0],
        correctKanji: isHardcore ? answersMap : answersMap[questionsList[0]],
        isHardcore: isHardcore,
        isSentence: false
    });

    localStorage.setItem("myBoxKanjiDB", JSON.stringify(window.quizDatabase));
    alert("မေးခွန်း သိမ်းဆည်းပြီးပါပြီ! 🎉");
    renderDashboard();
}

function deleteQuizItem(index) {
    if (confirm("ဖျက်ရန် သေချာပါသလား?")) {
        loadDatabase();
        window.quizDatabase.splice(index, 1);
        localStorage.setItem("myBoxKanjiDB", JSON.stringify(window.quizDatabase));
        renderDashboard();
    }
}

function clearAllData() {
    if (confirm("ဒေတာအားလုံး ဖျက်မည်မှာ သေချာပါသလား?")) {
        localStorage.removeItem("myBoxKanjiDB");
        window.quizDatabase = [];
        renderDashboard();
    }
}

window.onload = function() { loadDatabase(); renderDashboard(); };
