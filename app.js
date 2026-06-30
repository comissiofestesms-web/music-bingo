const CARDS_PER_BINGO = 700;
const SIZE = 4;

let cards = [];

// -------------------------
// UTILITATS
// -------------------------

function getSongs() {
  return document.getElementById("songInput").value
    .split("\n")
    .map(s => s.trim())
    .filter(Boolean);
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

function normalizeRow(row) {
  return row.slice().sort().join("|");
}

// -------------------------
// GUARDAR / CARREGAR
// -------------------------

function saveSongs() {
  localStorage.setItem("bingoSongs", document.getElementById("songInput").value);
  alert("Guardat!");
}

function loadSongs() {
  document.getElementById("songInput").value =
    localStorage.getItem("bingoSongs") || "";
}

// -------------------------
// GENERAR CARTRONS
// -------------------------

function generateCards() {
  const songs = getSongs();

  cards = [];
  let usedRows = new Set();

  while (cards.length < CARDS_PER_BINGO) {

    let card = shuffle(songs).slice(0, 16);
    let rows = chunk(card, 4);

    let keys = rows.map(normalizeRow);

    if (keys.some(k => usedRows.has(k))) continue;

    keys.forEach(k => usedRows.add(k));

    cards.push(card);
  }

  renderCards();
}

// -------------------------
// PREVIEW
// -------------------------

function renderCards() {
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

// -------------------------
// PDF / PRINT
// -------------------------

function exportPDF() {

  const out = document.getElementById("output");
  out.innerHTML = "";

  for (let i = 0; i < cards.length; i += 4) {

    let page = document.createElement("div");
    page.className = "page";

    let group = cards.slice(i, i + 4);

    group.forEach((card, idx) => {

      let div = document.createElement("div");
      div.className = "card";

      let html = `<b>Cartró ${i + idx + 1}</b><table>`;

      for (let r = 0; r < 4; r++) {
        html += "<tr>";
        for (let c = 0; c < 4; c++) {
          html += `<td>${card[r * 4 + c]}</td>`;
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
