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
        let kanjiBadges = item.kanjis.map(k => `<span class="kanji-badge">${k}</span>`).join("");
        let modeBadge = item.isHardcore ? `<span style="background: #fee2e2; color: #ef4444; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold; margin-left: 6px;">🔥 Compare Mode</span>` : `<span style="background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold; margin-left: 6px;">🟢 Standard Mode</span>`;
        if (item.sentence) modeBadge += ` <span style="background: #ede9fe; color: #7c3aed; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold;">📝 Sentence</span>`;
        
        let itemDiv = document.createElement("div");
        itemDiv.className = "list-item";
        itemDiv.innerHTML = `
            <div>
                <div style="margin-bottom: 6px;">${kanjiBadges} ${modeBadge}</div>
                <div style="font-size: 14px; color: #475569;"><b>Details:</b> ${item.sentence ? item.sentence : (Array.isArray(item.question) ? item.question.join(", ") : item.question)}</div>
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
        alert(isHardcore ? "Compare Mode တွင် Kanji ကွက်လပ် အများဆုံး ၁၀ ခုအထိသာ ထည့်သွင်းနိုင်ပါသည်။[span_12](start_span)[span_12](end_span)[span_13](start_span)[span_13](end_span)" : "Normal Mode တွင် Kanji ကွက်လပ် အများဆုံး ၃ ခုအထိသာ ထည့်သွင်းနိုင်ပါသည်။[span_14](start_span)[span_14](end_span)[span_15](start_span)[span_15](end_span)");
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
    let currentRows = container.getElementsByClassName("hiragana-input-row").length;
    
    if (!isHardcore) {
        alert("Normal Mode တွင် Hiragana မေးခွန်း ၁ ခုသာ ထည့်သွင်းနိုင်ပါသည်။[span_16](start_span)[span_16](end_span)[span_17](start_span)[span_17](end_span)");
        return;
    }

    if (currentRows >= 10) {
        alert("Hiragana မေးခွန်းကွက်လပ် အများဆုံး ၁၀ ခုအထိသာ ထည့်သွင်းနိုင်ပါသည်။[span_18](start_span)[span_18](end_span)[span_19](start_span)[span_19](end_span)");
        return;
    }

    let rowDiv = document.createElement("div");
    rowDiv.className = "hiragana-input-row";
    rowDiv.style.cssText = "display: flex; gap: 8px; margin-bottom: 10px; align-items: center; flex-wrap: wrap; background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;";
    rowDiv.innerHTML = `
        <input type="text" class="hiragana-box" placeholder="Hiragana မေးခွန်း (ဥပမာ: でんしゃ)" style="flex: 2; min-width: 150px; padding: 9px; font-size: 15px; border: 1px solid #cbd5e1; border-radius: 6px;" required>
        <select class="row-answer-select" style="flex: 1; min-width: 100px; padding: 9px; font-size: 15px; border: 1px solid #cbd5e1; border-radius: 6px; background: #fff; font-weight: bold; color: #2563eb;">
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
        let previousSelected = select.value;
        select.innerHTML = `<option value="">အဖြေမှန်ရွေးပါ</option>`;
        validKanjis.forEach(kanji => {
            let opt = document.createElement("option");
            opt.value = kanji;
            opt.innerText = kanji;
            if (kanji === previousSelected) opt.selected = true;
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
    let kanjiBoxes = document.getElementsByClassName("kanji-box");
    let kanjis = [];
    for (let box of kanjiBoxes) {
        let val = box.value.trim();
        if (val !== "") kanjis.push(val);
    }

    if (kanjis.length < 2) {
        alert("ကျေးဇူးပြု၍ Kanji ကွက်လပ် အနည်းဆုံး ၂ ခု ဖြည့်ပါ။");
        return;
    }

    let sentenceText = document.getElementById("sentenceInputBox").value.trim();
    let sentenceTarget = document.getElementById("sentenceTargetHiragana").value.trim();

    let hiraganaRows = document.getElementsByClassName("hiragana-input-row");
    let questionsList = [];
    let answersMap = {};
    let isHardcore = document.getElementById("globalHardcoreSwitch").checked;

    loadDatabase();

    for (let row of hiraganaRows) {
        let qBox = row.querySelector(".hiragana-box");
        let aSelect = row.querySelector(".row-answer-select");
        let question = qBox ? qBox.value.trim() : "";
        let correctKanji = aSelect ? aSelect.value : "";

        if (question !== "" || correctKanji !== "") {
            if (!isHiragana(question)) {
                alert("မေးခွန်း '" + question + "' သည် Hiragana သက်သက် ဖြစ်ရပါမည်။");
                return;
            }
            if (!correctKanji || !kanjis.includes(correctKanji)) {
                alert("အဖြေမှန် Kanji ကို မှန်ကန်စွာ ရွေးချယ်ပေးပါ။");
                return;
            }
            questionsList.push(question);
            answersMap[question] = correctKanji;
        }
    }

    if (questionsList.length === 0) {
        alert("ကျေးဇူးပြု၍ Hiragana မေးခွန်း အနည်းဆုံး ၁ ခုနှင့် အဖြေမှန်ကို ဖြည့်စွက်ပါ။");
        return;
    }

    let newEntry = {
        kanjis: [...kanjis],
        question: isHardcore ? questionsList : questionsList[0],
        correctKanji: isHardcore ? answersMap : answersMap[questionsList[0]],
        isHardcore: isHardcore
    };

    if (sentenceText !== "" && sentenceTarget !== "") {
        newEntry.sentence = sentenceText;
        newEntry.sentenceTarget = sentenceTarget;
        newEntry.sentenceAnswer = answersMap[sentenceTarget] || kanjis[0];
    }

    window.quizDatabase.push(newEntry);
    localStorage.setItem("myBoxKanjiDB", JSON.stringify(window.quizDatabase));
    alert("မေးခွန်းအသစ် အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ! 🎉");

    for (let box of kanjiBoxes) box.value = "";
    document.getElementById("sentenceInputBox").value = "";
    document.getElementById("sentenceTargetHiragana").value = "";
    document.getElementById("globalHardcoreSwitch").checked = false;
    
    renderDashboard();
}

function deleteQuizItem(index) {
    if (confirm("ဤမေးခွန်းကို ဖျက်ရန် သေချာပါသလား?")) {
        loadDatabase();
        window.quizDatabase.splice(index, 1);
        localStorage.setItem("myBoxKanjiDB", JSON.stringify(window.quizDatabase));
        renderDashboard();
    }
}

function clearAllData() {
    if (confirm("သတိပြုရန် - အချက်အလက်အားလုံး လုံးဝ ပျောက်သွားပါမည်။ ဖျက်လိုပါသလား?")) {
        localStorage.removeItem("myBoxKanjiDB");
        window.quizDatabase = [];
        renderDashboard();
    }
}

function openBackupModal() { document.getElementById("backupModal").classList.add("show"); }
function closeBackupModal() { document.getElementById("backupModal").classList.remove("show"); }

async function backupToLocalFolder() {
    closeBackupModal();
    if ('showSaveFilePicker' in window) {
        try {
            const handle = await window.showSaveFilePicker({ suggestedName: 'kanji_backup.json' });
            const writable = await handle.createWritable();
            await writable.write(JSON.stringify(window.quizDatabase, null, 2));
            await writable.close();
            alert("အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ! 🎉");
        } catch (err) { if (err.name !== 'AbortError') backupToDownloadsFolder(); }
    } else { backupToDownloadsFolder(); }
}

function backupToDownloadsFolder() {
    closeBackupModal();
    loadDatabase();
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(window.quizDatabase, null, 2));
    let downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "kanji_backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function importBackupFile(event) {
    let file = event.target.files[0];
    if (!file) return;
    let reader = new FileReader();
    reader.onload = function(e) {
        try {
            let importedData = JSON.parse(e.target.result);
            if (Array.isArray(importedData)) {
                loadDatabase();
                window.quizDatabase = window.quizDatabase.concat(importedData);
                localStorage.setItem("myBoxKanjiDB", JSON.stringify(window.quizDatabase));
                renderDashboard();
                alert("Backup တင်သွင်းမှု အောင်မြင်ပါသည်။ 🎉");
            }
        } catch (err) { alert("ဖိုင် ဖတ်ရှုရာတွင် အမှားရှိပါသည်။"); }
    };
    reader.readAsText(file);
}
