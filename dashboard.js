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
        
        let itemDiv = document.createElement("div");
        itemDiv.className = "list-item";
        itemDiv.innerHTML = `
            <div>
                <div style="margin-bottom: 6px;">${kanjiBadges}</div>
                <div style="font-size: 14px; color: #475569;"><b>မေးခွန်း:</b> ${item.question}</div>
                <div style="font-size: 14px; color: #16a34a;"><b>အဖြေမှန်:</b> ${item.correctKanji}</div>
            </div>
            <button class="btn-danger" style="padding: 6px 12px; font-size: 13px;" onclick="deleteQuizItem(${index})">ဖျက်မည်</button>
        `;
        listContainer.appendChild(itemDiv);
    });
}

function addKanjiInputBox() {
    let container = document.getElementById("kanjiInputsContainer");
    let currentRows = container.getElementsByClassName("kanji-input-row").length;
    
    if (currentRows >= 10) {
        alert("အများဆုံး ၁ ခုလျှင် ၁၀ ကွက်အထိသာ ထည့်သွင်းနိုင်ပါသည်။");
        return;
    }

    let rowDiv = document.createElement("div");
    rowDiv.className = "kanji-input-row";
    rowDiv.innerHTML = `
        <input type="text" class="kanji-box" placeholder="Kanji ထည့်ရန်" maxlength="3" required>
        <button type="button" class="remove-kanji-btn" onclick="this.parentElement.remove()">✕</button>
    `;
    container.appendChild(rowDiv);
}

function addQuizSet() {
    let kanjiBoxes = document.getElementsByClassName("kanji-box");
    let kanjis = [];
    for (let box of kanjiBoxes) {
        let val = box.value.trim();
        if (val !== "") kanjis.push(val);
    }

    let question = document.getElementById("questionInput").value.trim();
    let correctKanji = document.getElementById("answerInput").value.trim();

    if (kanjis.length < 2) {
        alert("ကျေးဇူးပြု၍ Kanji ကွက်လပ် အနည်းဆုံး ၂ ခု ဖြည့်ပါ။");
        return;
    }
    if (!question || !correctKanji) {
        alert("မေးခွန်းနှင့် အဖြေမှန်ကို ပြည့်စုံစွာ ဖြည့်ပါ။");
        return;
    }

    if (!kanjis.includes(correctKanji)) {
        alert("အဖြေမှန် Kanji သည် အပေါ်တွင် သင်ထည့်ထားသော Kanji စာရင်းထဲတွင် ပါဝင်ရပါမည်။");
        return;
    }

    loadDatabase();
    window.quizDatabase.push({ kanjis, question, correctKanji });
    localStorage.setItem("myBoxKanjiDB", JSON.stringify(window.quizDatabase));

    alert("မေးခွန်းအသစ် သိမ်းဆည်းပြီးပါပြီ! 🎉");

    // Clear Inputs
    for (let box of kanjiBoxes) box.value = "";
    document.getElementById("questionInput").value = "";
    document.getElementById("answerInput").value = "";

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

// --- BACKUP MODAL LOGIC ---

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

function backupToGoogleDrive() {
    closeBackupModal();
    let confirmDrive = confirm("Google Drive နှင့် ချိတ်ဆက်ရန် Google OAuth API Key လိုအပ်ပါသည်။ ယခုလက်တလောတွင် Backup ဖိုင်ကို ဒေါင်းလုဒ်ဆွဲပြီး Google Drive ထဲသို့ ကိုယ်တိုင် Upload တင်လိုပါသလား?");
    if (confirmDrive) {
        backupToDownloadsFolder();
    }
}
