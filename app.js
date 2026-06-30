const CARDS_PER_BINGO = 700;
const SIZE = 4;

let cards = [];

// ----------------------------
// BINGO KEY
// ----------------------------

function getKey() {
  return document.getElementById("bingoSelect").value;
}

function getBingoLabel() {
  const key = getKey();

  if (key === "Bingo1") return "B1";
  if (key === "Bingo2") return "B2";
  return "B3";
}

// ----------------------------
// SONGS
// ----------------------------

function getSongs() {
  return document.getElementById("songInput").value
    .split("\n")
    .map(s => s.trim())
    .filter(Boolean);
}

function saveSongs() {
  localStorage.setItem(getKey(), document.getElementById("songInput").value);
  alert("Guardat!");
}

function loadSongs() {
  document.getElementById("songInput").value =
    localStorage.getItem(getKey()) || "";
}

// ----------------------------
// UTILS
// ----------------------------

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

// fila sense ordre (clau única)
function normalizeRow(row) {
  return row.slice().sort().join("|");
}

// ----------------------------
// GENERADOR (OPCIÓ A)
// ----------------------------

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

    let card = shuffle(songs).slice(0, 16);
    let rows = chunk(card, SIZE);

    let keys = rows.map(normalizeRow);

    // evitar files repetides
    if (keys.some(k => usedRows.has(k))) continue;

    keys.forEach(k => usedRows.add(k));

    cards.push(card);
  }

  renderPreview();
}

// ----------------------------
// PREVIEW
// ----------------------------

function renderPreview() {
  const out = document.getElementById("output");
  out.innerHTML = "";

  cards.slice(0, 40).forEach((card, i) => {

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

// ----------------------------
// PDF / PRINT PRO
// ----------------------------

function exportPDF() {

  const out = document.getElementById("output");
  out.innerHTML = "";

  const bingoLabel = getBingoLabel();

  for (let i = 0; i < cards.length; i += 4) {

    let page = document.createElement("div");
    page.className = "page";

    let group = cards.slice(i, i + 4);

    group.forEach((card, idx) => {

      let div = document.createElement("div");
      div.className = "card";

      let html = `<b>Cartró ${i + idx + 1} - ${bingoLabel}</b>`;

      html += `<table>`;

      for (let r = 0; r < 4; r++) {
        html += "<tr>";

        for (let c = 0; c < 4; c++) {

          html += `
            <td>
              <div class="cell">
                ${card[r * 4 + c]}
              </div>
            </td>
          `;
        }

        html += "</tr>";
      }

      html += "</table>";

      div.innerHTML = html;
      page.appendChild(div);
    });

    out.appendChild(page);
  }

  window.print();
}
