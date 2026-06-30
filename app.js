const CARDS_PER_BINGO = 700;
const SIZE = 4;

let cards = [];

function getBingoKey() {
  return document.getElementById("bingoSelect").value;
}

function getSongs() {
  return document.getElementById("songInput").value
    .split("\n")
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

// --------------------
// GUARDAR / CARREGAR
// --------------------
function saveSongs() {
  localStorage.setItem(getBingoKey(), document.getElementById("songInput").value);
  alert("Guardat!");
}

function loadSongs() {
  document.getElementById("songInput").value =
    localStorage.getItem(getBingoKey()) || "";
}

// --------------------
// GENERADOR
// --------------------
function generateCards() {
  const songs = getSongs();
  cards = [];
  let usedRows = new Set();

  while (cards.length < CARDS_PER_BINGO) {

    let card = shuffle(songs).slice(0, 16);
    let rows = chunk(card, SIZE);

    let rowHashes = rows.map(r => r.join("|"));

    if (rowHashes.some(r => usedRows.has(r))) continue;

    usedRows = new Set([...usedRows, ...rowHashes]);

    cards.push(card);
  }

  renderCards();
}

// --------------------
// RENDER
// --------------------
function renderCards() {
  const out = document.getElementById("output");
  out.innerHTML = "";

  cards.slice(0, 50).forEach((card, i) => {
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

// --------------------
// PDF (simple)
// --------------------
function exportPDF() {
  let win = window.open("");

  let html = "<html><body>";

  cards.forEach((card, i) => {
    if (i % 4 === 0) html += "<div style='page-break-after:always;display:grid;grid-template-columns:1fr 1fr;'>";

    html += "<div style='border:1px solid black;padding:10px;width:45%;'>";

    html += "<b>Cartró " + (i+1) + "</b><br><br>";

    html += "<table border='1' style='width:100%;text-align:center'>";
    for (let r = 0; r < 4; r++) {
      html += "<tr>";
      for (let c = 0; c < 4; c++) {
        html += "<td>" + card[r*4 + c] + "</td>";
      }
      html += "</tr>";
    }
    html += "</table>";

    html += "</div>";

    if (i % 4 === 3) html += "</div>";
  });

  html += "</body></html>";

  win.document.write(html);
  win.document.close();
}

// --------------------
// HELPERS
// --------------------
function shuffle(a) {
  return a.sort(() => Math.random() - 0.5);
}

function chunk(arr, size) {
  let res = [];
  for (let i = 0; i < arr.length; i += size) {
    res.push(arr.slice(i, i + size));
  }
  return res;
}
