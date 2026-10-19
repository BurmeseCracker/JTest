// --- DASHBOARD & CRUD LOGIC ---

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
        let questionsText = Array.isArray(item.question) ? item.question.join(", ") : item.question;
        let hardcoreBadge = item.isHardcore ? `<span style="background: #fee2e2; color: #ef4444; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold; margin-left: 6px;">🔥 Hardcore</span>` : "";
        
        let itemDiv = document.createElement("div");
        itemDiv.className = "list-item";
        itemDiv.innerHTML = `
            <div>
                <div style="margin-bottom: 6px;">${kanjiBadges} ${hardcoreBadge}</div>
                <div style="font-size: 14px; color: #475569;"><b>Hiragana:</b> ${questionsText}</div>
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
        alert(isHardcore ? "Hardcore Mode တွင် Kanji ကွက်လပ် အများဆုံး ၁၀ ခုအထိသာ ထည့်သွင်းနိုင်ပါသည်။" : "Normal Mode တွင် Kanji ကွက်လပ် အများဆုံး ၃ ခုအထိသာ ထည့်သွင်းနိုင်ပါသည်။ Hardcore Mode ဖွင့်ပါက ၁၀ ခုအထိ ထည့်နိုင်ပါသည်။");
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
        alert("Normal Mode တွင် Hiragana မေးခွန်း ၁ ခုသာ ထည့်သွင်းနိုင်ပါသည်။ မေးခွန်းများ ပိုမိုထပ်ထည့်လိုပါက 'Hardcore Mode' Switch ကို ဖွင့်ပါ။");
        return;
    }

    if (currentRows >= 10) {
        alert("Hiragana မေးခွန်းကွက်လပ် အများဆုံး ၁၀ ခုအထိသာ ထည့်သွင်းနိုင်ပါသည်။");
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
            while (rows.length > 1) {
                rows[rows.length - 1].remove();
            }
        }
    }
});

function updateAllRowAnswerDropdowns() {
    let kanjiBoxes = document.getElementsByClassName("kanji-box");
    let validKanjis = [];

    for (let box of kanjiBoxes) {
        let val = box.value.trim();
        if (val !== "" && !validKanjis.includes(val)) {
            validKanjis.push(val);
        }
    }

    let answerSelects = document.getElementsByClassName("row-answer-select");
    for (let select of answerSelects) {
        let previousSelected = select.value;
        select.innerHTML = `<option value="">အဖြေမှန်ရွေးပါ</option>`;

        validKanjis.forEach(kanji => {
            let opt = document.createElement("option");
            opt.value = kanji;
            opt.innerText = kanji;
            if (kanji === previousSelected) {
                opt.selected = true;
            }
            select.appendChild(opt);
        });
    }
}

document.addEventListener("input", function(e) {
    if (e.target && e.target.classList.contains("kanji-box")) {
        updateAllRowAnswerDropdowns();
    }
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
                alert("Hiragana မေးခွန်း ('" + question + "') အတွက် အဖြေမှန် Kanji ကို မှန်ကန်စွာ ရွေးချယ်ပေးပါ။");
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

    // မေးခွန်းသိမ်းဆည်းခြင်း (Hardcore ဖြစ်ပါက questions/answers များ အများကြီးပါဝင်မည်)
    window.quizDatabase.push({
        kanjis: [...kanjis],
        question: isHardcore ? questionsList : questionsList[0],
        correctKanji: isHardcore ? answersMap : answersMap[questionsList[0]],
        isHardcore: isHardcore
    });

    localStorage.setItem("myBoxKanjiDB", JSON.stringify(window.quizDatabase));
    alert("မေးခွန်းအသစ် အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ! 🎉");

    for (let box of kanjiBoxes) box.value = "";
    document.getElementById("globalHardcoreSwitch").checked = false;
    
    let hContainer = document.getElementById("hiraganaInputsContainer");
    hContainer.innerHTML = `
        <div class="hiragana-input-row" style="display: flex; gap: 8px; margin-bottom: 10px; align-items: center; flex-wrap: wrap; background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <input type="text" class="hiragana-box" placeholder="Hiragana မေးခွန်း (ဥပမာ: でんしゃ)" style="flex: 2; min-width: 150px; padding: 9px; font-size: 15px; border: 1px solid #cbd5e1; border-radius: 6px;" required>
            <select class="row-answer-select" style="flex: 1; min-width: 100px; padding: 9px; font-size: 15px; border: 1px solid #cbd5e1; border-radius: 6px; background: #fff; font-weight: bold; color: #2563eb;">
                <option value="">အဖြေမှန်ရွေးပါ</option>
            </select>
        </div>
    `;
    updateAllRowAnswerDropdowns();
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
    if (confirm("သတိပြုရန် - အချက်အလက်အားလုံး လုံးဝ ပျောက်သွားပါမည်။ အသေအချာ ဖျက်လိုပါသလား?")) {
        localStorage.removeItem("myBoxKanjiDB");
        window.quizDatabase = [];
        renderDashboard();
        alert("ဒေတာများ အားလုံး ရှင်းလင်းပြီးပါပြီ။");
    }
}

// --- BACKUP & IMPORT LOGIC ---
function openBackupModal() {
    document.getElementById("backupModal").classList.add("show");
}

function closeBackupModal() {
    document.getElementById("backupModal").classList.remove("show");
}

async function backupToLocalFolder() {
    closeBackupModal();
    if ('showSaveFilePicker' in window) {
        try {
            const options = {
                suggestedName: 'kanji_quiz_backup.json',
                types: [{
                    description: 'JSON Files',
                    accept: { 'application/json': ['.json'] },
                }],
            };
            const handle = await window.showSaveFilePicker(options);
            const writable = await handle.createWritable();
            await writable.write(JSON.stringify(window.quizDatabase, null, 2));
            await writable.close();
            alert("Local Folder ထဲသို့ Backup အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ! 🎉");
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error(err);
                alert("Backup သိမ်းဆည်းရာတွင် အမှားအယွင်း ရှိခဲ့ပါသည်။");
            }
        }
    } else {
        alert("သင့် Browser သည် Local Folder Direct Access ကို မထောက်ပံ့ပါ။ နည်းလမ်း ၂ (Downloads Folder) ကို အသုံးပြုပါ။");
        backupToDownloadsFolder();
    }
}

function backupToDownloadsFolder() {
    closeBackupModal();
    loadDatabase();
    let fileName = prompt("Backup ဖိုင်နာမည် ပေးပါ:", "kanji_quiz_backup_" + new Date().toISOString().slice(0,10) + ".json");
    if (!fileName) return;
    
    if (!fileName.endsWith('.json')) {
        fileName += '.json';
    }

    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(window.quizDatabase, null, 2));
    let downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    
    alert("Downloads Folder သို့ '" + fileName + "' အဖြစ် အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ! 📥");
}

function importBackupFile(event) {
    let file = event.target.files[0];
    if (!file) return;

    let reader = new FileReader();
    reader.onload = function(e) {
        try {
            let importedData = JSON.parse(e.target.result);
            if (Array.isArray(importedData)) {
                if (confirm("မေးခွန်းဒေတာ " + importedData.length + " ပုဒ်ကို တင်သွင်းရန် သေချာပါသလား? (လက်ရှိ ဒေတာများနှင့် ပေါင်းထည့်မည်)")) {
                    loadDatabase();
                    window.quizDatabase = window.quizDatabase.concat(importedData);
                    localStorage.setItem("myBoxKanjiDB", JSON.stringify(window.quizDatabase));
                    renderDashboard();
                    alert("Backup ဖိုင်ကို အောင်မြင်စွာ ပြန်လည်တင်သွင်းပြီးပါပြီ! 🎉");
                }
            } else {
                alert("ဖိုင် ပုံစံ မှားယွင်းနေပါသည်။ (JSON Format မမှန်ပါ)");
            }
        } catch (err) {
            console.error(err);
            alert("JSON ဖိုင်ကို ဖတ်ရှုရာတွင် အမှားအယွင်း ရှိခဲ့ပါသည်။");
        }
        event.target.value = "";
    };
    reader.readAsText(file);
}
