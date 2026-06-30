const CARDS_PER_BINGO = 700;
const SIZE = 4;

let cards = [];

// -------------------------
// UTILITATS
// -------------------------

function getBingoKey() {
  return document.getElementById("bingoSelect").value;
}

function getSongs() {
  return document.getElementById("songInput").value
    .split("\n")
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

function shuffle(arr) {
  return arr
    .map(v => [Math.random(), v])
    .sort((a, b) => a[0] - b[0])
    .map(v => v[1]);
}

function chunk(arr, size) {
  let res = [];
  for (let i = 0; i < arr.length; i += size) {
    res.push(arr.slice(i, i + size));
  }
  return res;
}

// 🔥 IMPORTANT: normalitza la fila (ordre NO importa)
function normalizeRow(row) {
  return row.slice().sort().join("|");
}

// -------------------------
// GUARDAR / CARREGAR
// -------------------------

function saveSongs() {
  localStorage.setItem(getBingoKey(), document.getElementById("songInput").value);
  alert("Cançons guardades!");
}

function loadSongs() {
  document.getElementById("songInput").value =
    localStorage.getItem(getBingoKey()) || "";
}

// -------------------------
// GENERADOR PRINCIPAL
// -------------------------

function generateCards() {
  const songs = getSongs();

  if (songs.length < 16) {
    alert("Necessites mínim 16 cançons");
    return;
  }

  cards = [];
  let usedRows = new Set();

  let attempts = 0;
  const maxAttempts = 500000;

  while (cards.length < CARDS_PER_BINGO && attempts < maxAttempts) {
    attempts++;

    // agafa 16 cançons aleatòries
    let shuffled = shuffle(songs).slice(0, 16);

    // divideix en 4 files
    let rows = chunk(shuffled, SIZE);

    // normalitza files (ordre no importa)
    let rowKeys = rows.map(normalizeRow);

    // comprova si alguna fila ja existeix globalment
    let conflict = rowKeys.some(k => usedRows.has(k));

    if (conflict) continue;

    // guarda files com a usades
    rowKeys.forEach(k => usedRows.add(k));

    // evita duplicat exacte de cartró
    let cardKey = rowKeys.sort().join("##");

    if (cards.some(c => c.__key === cardKey)) continue;

    cards.push({
      data: shuffled,
      __key: cardKey
    });
  }

  if (cards.length < CARDS_PER_BINGO) {
    alert("No s'han pogut generar tots els cartrons. Prova amb més cançons.");
  }

  renderCards();
}

// -------------------------
// RENDER (PREVIEW)
// -------------------------

function renderCards() {
  const out = document.getElementById("output");
  out.innerHTML = "";

  cards.slice(0, 50).forEach((cardObj, i) => {
    let card = cardObj.data;

    let div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <b>Cartró ${i + 1}</b>
      <div class="grid">
        ${card.map(c => `<div>${c}</div>`).join("")}
      </div>
    `;

    out.appendChild(div);
  });
}

// -------------------------
// PDF EXPORT
// -------------------------

function exportPDF() {
  let win = window.open("");

  let html = "<html><body>";

  cards.forEach((cardObj, i) => {
    let card = cardObj.data;

    if (i % 4 === 0) {
      html += "<div style='page-break-after:always;display:grid;grid-template-columns:1fr 1fr;gap:10px;'>";
    }

    html += "<div style='border:1px solid black;padding:10px;width:45%;font-size:12px;'>";

    html += "<b>Cartró " + (i + 1) + "</b><br><br>";

    html += "<table border='1' style='width:100%;text-align:center;border-collapse:collapse;'>";

    for (let r = 0; r < 4; r++) {
      html += "<tr>";
      for (let c = 0; c < 4; c++) {
        html += "<td>" + card[r * 4 + c] + "</td>";
      }
      html += "</tr>";
    }

    html += "</table></div>";

    if (i % 4 === 3) html += "</div>";
  });

  html += "</body></html>";

  win.document.write(html);
  win.document.close();
}
