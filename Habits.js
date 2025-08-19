const tracker = document.getElementById("tracker");
const monthSelector = document.getElementById("month-selector");

const today = new Date();
let currentMonth = localStorage.getItem("habit-lastMonth") || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

init();

function init() {
  loadMonthSelector();
  renderTable(currentMonth);
}

function loadData(monthKey) {
  const raw = localStorage.getItem(`habit-${monthKey}`);
  return raw ? JSON.parse(raw) : null;
}

function toggleData(monthKey, hIndex, day) {
  const dataObj = loadData(monthKey);
  if (!dataObj) return;

  const habitData = dataObj.data;
  if (!Array.isArray(habitData[hIndex])) habitData[hIndex] = [];

  const index = habitData[hIndex].indexOf(day);
  if (index >= 0) {
    habitData[hIndex].splice(index, 1);
  } else {
    habitData[hIndex].push(day);
  }

  localStorage.setItem(`habit-${monthKey}`, JSON.stringify(dataObj));
}

function renderTable(monthKey) {
  tracker.innerHTML = "";
  const [year, month] = monthKey.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();

  const gradientColors = [
    "#ff5ca9", "#ff6d6d", "#ff8942", "#ffa933", "#ffc938",
    "#eaff3b", "#c7ff49", "#a1ff57", "#7dff68", "#5aff7d",
    "#3aff98", "#25ffb7", "#16ffd6", "#10f2f2", "#1ddfff",
    "#3dc5ff", "#5fa9ff", "#7b8bff", "#936eff", "#a852ff",
    "#ba38ff", "#ca21ff", "#d80fff", "#e100f2", "#e900d1",
    "#ef00aa", "#f00084", "#ec005d", "#e1003a", "#ce0021",
    "#b10011"
  ];

  const dataObj = loadData(monthKey);
  if (!dataObj) {
    tracker.innerHTML = "<p>Nessun dato per questo mese.</p>";
    return;
  }

  const { habits, data } = dataObj;

  const table = document.createElement("table");
  const headerRow = document.createElement("tr");
  headerRow.innerHTML = `<th>Habits</th>` +
    Array.from({ length: daysInMonth }, (_, i) => `<th>${i + 1}</th>`).join("");
  table.appendChild(headerRow);

  habits.forEach((habit, hIndex) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${habit}</td>`;

    for (let d = 0; d < daysInMonth; d++) {
      const cell = document.createElement("td");
      const isDone = data?.[hIndex]?.includes(d + 1);

      updateCellStyle(cell, isDone, d);

      cell.onclick = () => {
        toggleData(monthKey, hIndex, d + 1);
        const updatedData = loadData(monthKey);
        const updatedDone = updatedData.data[hIndex].includes(d + 1);
        updateCellStyle(cell, updatedDone, d);
        
        cell.classList.add("bounce");
        setTimeout(() => cell.classList.remove("bounce"), 300);
      };

      row.appendChild(cell);
    }

    table.appendChild(row);
  });

  tracker.appendChild(table);
}

function updateCellStyle(cell, done, dayIndex) {
  const gradientColors = [
    "#ff5ca9", "#ff6d6d", "#ff8942", "#ffa933", "#ffc938",
    "#eaff3b", "#c7ff49", "#a1ff57", "#7dff68", "#5aff7d",
    "#3aff98", "#25ffb7", "#16ffd6", "#10f2f2", "#1ddfff",
    "#3dc5ff", "#5fa9ff", "#7b8bff", "#936eff", "#a852ff",
    "#ba38ff", "#ca21ff", "#d80fff", "#e100f2", "#e900d1",
    "#ef00aa", "#f00084", "#ec005d", "#e1003a", "#ce0021",
    "#b10011"
  ];
  if (done) {
    const color = gradientColors[dayIndex] || "#40c4ff";
    cell.style.backgroundColor = color;
    cell.style.color = "#fff";
    cell.classList.add("done");
  } else {
    cell.style.backgroundColor = "#f3f3f3";
    cell.style.color = "#000";
    cell.classList.remove("done");
  }
}

function loadMonthSelector() {
  const keys = Object.keys(localStorage)
    .filter(k => k.startsWith("habit-") && k !== "habit-lastMonth");
  const allMonths = keys.map(k => k.replace("habit-", "")).sort();

  monthSelector.innerHTML = allMonths.map(m =>
    `<option value="${m}" ${m === currentMonth ? "selected" : ""}>${m}</option>`
  ).join("");

  monthSelector.onchange = () => {
    currentMonth = monthSelector.value;
    localStorage.setItem("habit-lastMonth", currentMonth);
    renderTable(currentMonth);
  };
}

function addNewMonth() {
  const input = prompt("Inserisci nuovo mese (YYYY-MM):");
  if (input && /^\d{4}-\d{2}$/.test(input)) {
    if (localStorage.getItem(`habit-${input}`)) {
      alert("Questo mese esiste già.");
      return;
    }

    const habitInput = prompt("Inserisci le abitudini separate da virgola (es: Workout, Lettura, Meditazione)");
    if (!habitInput) {
      alert("Nessuna abitudine inserita");
      return;
    }

    const newHabits = habitInput.split(",").map(h => h.trim()).filter(Boolean);
    const data = {
      habits: newHabits,
      data: newHabits.map(() => [])
    };

    localStorage.setItem(`habit-${input}`, JSON.stringify(data));
    currentMonth = input;
    localStorage.setItem("habit-lastMonth", currentMonth);
    loadMonthSelector();
    renderTable(currentMonth);
  } else {
    alert("Formato non valido. Per favore, usa YYYY-MM");
  }
}

function editHabits() {
  const dataObj = loadData(currentMonth);
  if (!dataObj) {
    alert("Nessun dato per questo mese");
    return;
  }

  const { habits } = dataObj;
  const modalBody = document.getElementById("modal-body");

  let html = `
  <h2>Modifica abitudini per ${currentMonth}</h2>
  <button onclick="addHabit()" style="margin-bottom: 10px;">Aggiungi abitudine</button>
  <ul style="list-style:none; padding:0;">`;

  habits.forEach((habit, i) => {

    html += `
  <li class="habit-row">
    <span class="habit-name">${habit}</span>
    <div class="buttons-row">
      <button onclick="renameHabit(${i})">Edit</button>
      <button onclick="deleteHabit(${i})">Delete</button>
    </div>
  </li>`;

  });

  html += "</ul>";

  modalBody.innerHTML = html;
  document.getElementById("habit-modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("habit-modal").style.display = "none";
  renderTable(currentMonth);
}

function renameHabit(index) {
  const dataObj = loadData(currentMonth);
  const oldName = dataObj.habits[index];
  const nuovoNome = prompt(`Rinomina l'abitudine "${oldName}" in:`);
  if (nuovoNome && nuovoNome.trim()) {
    dataObj.habits[index] = nuovoNome.trim();
    localStorage.setItem(`habit-${currentMonth}`, JSON.stringify(dataObj));
    editHabits();
  }
}

function deleteHabit(index) {
  const dataObj = loadData(currentMonth);
  const nome = dataObj.habits[index];
  const conferma = confirm(`Eliminare "${nome}" da ${currentMonth}?`);
  if (conferma) {
    dataObj.habits.splice(index, 1);
    dataObj.data.splice(index, 1);
    localStorage.setItem(`habit-${currentMonth}`, JSON.stringify(dataObj));
    editHabits();
  }
}

function addHabit() {
  const dataObj = loadData(currentMonth);
  const nuovoNome = prompt("Inserisci il nome della nuova abitudine:");
  if (nuovoNome && nuovoNome.trim()) {
    dataObj.habits.push(nuovoNome.trim());
    dataObj.data.push([]);
    localStorage.setItem(`habit-${currentMonth}`, JSON.stringify(dataObj));
    editHabits();
  }
}

function deleteCurrentMonth() {
  const conferma = confirm(`Eliminare il mese "${currentMonth}"? Questa operazione è irreversibile.`);
  if (!conferma) return;

  localStorage.removeItem(`habit-${currentMonth}`);

  // Rimuove anche il riferimento all'ultimo mese usato, se corrisponde
  if (localStorage.getItem("habit-lastMonth") === currentMonth) {
    localStorage.removeItem("habit-lastMonth");
  }

  // Ricarica la lista dei mesi e resetta la visualizzazione
  const keys = Object.keys(localStorage)
    .filter(k => k.startsWith("habit-") && k !== "habit-lastMonth");
  if (keys.length > 0) {
    currentMonth = keys[0].replace("habit-", "");
    localStorage.setItem("habit-lastMonth", currentMonth);
  } else {
    currentMonth = "";
  }

  loadMonthSelector();
  renderTable(currentMonth);
}