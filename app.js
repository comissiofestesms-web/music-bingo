const CARDS_PER_BINGO = 700;
const SIZE = 4;

let cards = [];

function getKey() {
  return document.getElementById("bingoSelect").value;
}

function getLabel() {
  const k = getKey();
  if (k === "Bingo1") return "B1";
  if (k === "Bingo2") return "B2";
  return "B3";
}

function getSongs() {
  return document.getElementById("songInput").value
    .split("\n")
    .map(s => s.trim())
    .filter(Boolean);
}

function saveSongs() {
  localStorage.setItem(getKey(), document.getElementById("songInput").value);
  alert("Guardat");
}

function loadSongs() {
  document.getElementById("songInput").value =
    localStorage.getItem(getKey()) || "";
}

function shuffle(arr) {
  return arr
    .map(v => [Math.random(), v])
    .sort((a,b) => a[0]-b[0])
    .map(v => v[1]);
}

function chunk(arr, size) {
  let r = [];
  for (let i=0;i<arr.length;i+=size) r.push(arr.slice(i,i+size));
  return r;
}

function normalize(row) {
  return row.slice().sort().join("|");
}

function generateCards() {
  const songs = getSongs();

  cards = [];
  let used = new Set();

  while (cards.length < CARDS_PER_BINGO) {

    let card = shuffle(songs).slice(0,16);
    let rows = chunk(card, SIZE);
    let keys = rows.map(normalize);

    if (keys.some(k => used.has(k))) continue;

    keys.forEach(k => used.add(k));

    cards.push(card);
  }

  render();
}

function render() {
  const out = document.getElementById("output");
  out.innerHTML = "";

  cards.slice(0,40).forEach((card,i)=>{

    let div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <b>Cartró ${i+1}</b>
      <div class="grid">
        ${card.map(c=>`<div>${c}</div>`).join("")}
      </div>
    `;

    out.appendChild(div);
  });
}

function exportPDF() {

  const out = document.getElementById("output");
  out.innerHTML = "";

  const label = getLabel();

  for (let i=0;i<cards.length;i+=4) {

    let page = document.createElement("div");
    page.className = "page";

    cards.slice(i,i+4).forEach((card,idx)=>{

      let div = document.createElement("div");
      div.className = "card";

      let html = `<b>Cartró ${i+idx+1} - ${label}</b>`;

      html += `<table>`;

      for (let r=0;r<4;r++){
        html += "<tr>";
        for (let c=0;c<4;c++){
          html += `<td><div class="cell">${card[r*4+c]}</div></td>`;
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
