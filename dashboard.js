// Dynamic Kanji Box ထပ်ထည့်ပေးခြင်း (အများဆုံး ၁၀ ခုအထိ)
function addKanjiInputBox(value = "") {
    let container = document.getElementById("kanjiInputsContainer");
    if (!container) return;
    
    let currentBoxes = container.getElementsByClassName("kanji-input-row");
    if (currentBoxes.length >= 10) {
        alert("အများဆုံး ၁၀ လုံး (၁၀ ကွက်) အထိသာ ထည့်ခွင့်ပြုပါသည်။");
        return;
    }

    let row = document.createElement("div");
    row.className = "kanji-input-row";
    row.innerHTML = `
        <input type="text" class="kanji-box" placeholder="Kanji ထည့်ရန်" value="${value}" maxlength="3" required>
        <button type="button" class="remove-kanji-btn" onclick="removeKanjiInputBox(this)">✕</button>
    `;
    container.appendChild(row);
}

// Kanji Box ကို ပြန်ဖျက်ခြင်း
function removeKanjiInputBox(btn) {
    let container = document.getElementById("kanjiInputsContainer");
    if (container.getElementsByClassName("kanji-input-row").length <= 2) {
        alert("အနည်းဆုံး Kanji ၂ ကွက် ရှိရပါမည်။");
        return;
    }
    btn.parentElement.remove();
}

// Dashboard စာရင်းများ ပြသခြင်း
function renderDashboard() {
    let listContainer = document.getElementById("dashboardList");
    if (!listContainer) return;
    listContainer.innerHTML = "";

    if (quizDatabase.length === 0) {
        listContainer.innerHTML = "<p style='color:#64748b; text-align:left;'>မေးခွန်းများ မရှိသေးပါ။ အပေါ်တွင် မေးခွန်းများ ထည့်ပါ။</p>";
        return;
    }

    quizDatabase.forEach((item, index) => {
        let div = document.createElement("div");
        div.className = "list-item";
        let kanjiBadges = item.kanjis.map(k => `<span class="kanji-badge">${k}</span>`).join("");

        div.innerHTML = `
            <div>
                <div style="margin-bottom:6px;">${kanjiBadges}</div>
                <strong>မေးခွန်း:</strong> ${item.question}<br>
                <strong>အဖြေမှန်:</strong> <span style="color:#22c55e; font-weight:bold;">${item.correctKanji}</span>
            </div>
            <button class="btn-danger" style="padding: 6px 12px; font-size: 13px;" onclick="deleteQuizSet(${index})">ဖျက်မည်</button>
        `;
        listContainer.appendChild(div);
    });
}

// မေးခွန်းအသစ် သိမ်းဆည်းခြင်း
function addQuizSet() {
    let boxElements = document.getElementsByClassName("kanji-box");
    let kanjiArray = [];

    for (let box of boxElements) {
        let val = box.value.trim();
        if (val) {
            kanjiArray.push(val);
        }
    }

    let qInput = document.getElementById("questionInput").value.trim();
    let aInput = document.getElementById("answerInput").value.trim();

    if (kanjiArray.length < 2) {
        alert("ကျေးဇူးပြု၍ Kanji အနည်းဆုံး ၂ လုံး ထည့်ပါ။");
        return;
    }
    if (!qInput || !aInput) {
        alert("ကျေးဇူးပြု၍ Hiragana မေးခွန်းနှင့် အဖြေမှန် Kanji ကို ဖြည့်ပါ။");
        return;
    }

    quizDatabase.push({
        kanjis: kanjiArray,
        question: qInput,
        correctKanji: aInput
    });

    localStorage.setItem("myBoxKanjiDB", JSON.stringify(quizDatabase));
    alert("အချက်အလက်သစ် သိမ်းဆည်းပြီးပါပြီ! 🎉");

    document.getElementById("questionInput").value = "";
    document.getElementById("answerInput").value = "";
    
    // Default 3 Boxes ပြန်ထားခြင်း
    document.getElementById("kanjiInputsContainer").innerHTML = `
        <div class="kanji-input-row"><input type="text" class="kanji-box" placeholder="ဥပမာ: 日" maxlength="3" required></div>
        <div class="kanji-input-row"><input type="text" class="kanji-box" placeholder="ဥပမာ: 月" maxlength="3" required></div>
        <div class="kanji-input-row"><input type="text" class="kanji-box" placeholder="ဥပမာ: 電車" maxlength="3" required></div>
    `;

    renderDashboard();
}

// မေးခွန်း ဖျက်ခြင်း
function deleteQuizSet(index) {
    if (confirm("ဒီမေးခွန်းကို ဖျက်ရန် သေချာပါသလား?")) {
        quizDatabase.splice(index, 1);
        localStorage.setItem("myBoxKanjiDB", JSON.stringify(quizDatabase));
        renderDashboard();
    }
}

// အချက်အလက် အားလုံး ဖျက်ခြင်း
function clearAllData() {
    if (confirm("မေးခွန်း အချက်အလက် အားလုံးကို ဖျက်ပစ်မှာ သေချာပါသလား?")) {
        localStorage.removeItem("myBoxKanjiDB");
        loadDatabase();
        renderDashboard();
    }
}
