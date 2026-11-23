// =============================
//  توب المهرجين - اوتلاو
// =============================

// المهرجين (الصور من مجلد characters)
const clowns = [
  { img: "../outlaw/characters/42.jpg" },
  { img: "../outlaw/characters/32.jpg" },
  { img: "../outlaw/characters/11.jpg" },
  { img: "../outlaw/characters/07.jpg" },
  { img: "../outlaw/characters/18.jpg" },
];


const screens = {
  start: document.getElementById("start"),
  battle: document.getElementById("battle"),
  result: document.getElementById("result"),
  cert: document.getElementById("cert"),
};

const leftBtn = document.getElementById("left");
const rightBtn = document.getElementById("right");

let matches = [];
let current = 0;
let points = [];
let locked = false;


function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screens[name].classList.add("active");
  window.scrollTo(0, 0);
}

// صور صغيرة في صفحة البداية
const preview = document.getElementById("preview");
clowns.forEach(c => {
  const img = document.createElement("img");
  img.src = c.img;
  img.alt = "";
  preview.appendChild(img);
});


// ---------- المواجهات ----------
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function startGame() {
  matches = [];
  for (let a = 0; a < clowns.length; a++) {
    for (let b = a + 1; b < clowns.length; b++) {
      // نخلط مين يمين ومين يسار
      matches.push(Math.random() < 0.5 ? [a, b] : [b, a]);
    }
  }
  shuffle(matches);

  current = 0;
  points = clowns.map(() => 0);
  showScreen("battle");
  showMatch();
}

function fillFighter(btn, index) {
  btn.querySelector("img").src = clowns[index].img;
  btn.classList.remove("picked", "lost");
}

function showMatch() {
  const [a, b] = matches[current];
  fillFighter(rightBtn, a);
  fillFighter(leftBtn, b);

  document.getElementById("progress").textContent = `${current + 1} / ${matches.length}`;
  document.getElementById("progressFill").style.width = (current / matches.length) * 100 + "%";
  locked = false;
}

function pick(side) {
  if (locked) return;
  locked = true;

  const [a, b] = matches[current];

  if (side === "right") {
    points[a]++;
    rightBtn.classList.add("picked");
    leftBtn.classList.add("lost");
  } else if (side === "left") {
    points[b]++;
    leftBtn.classList.add("picked");
    rightBtn.classList.add("lost");
  } else {
    // الاثنين مهرجين
    points[a]++;
    points[b]++;
    rightBtn.classList.add("picked");
    leftBtn.classList.add("picked");
  }

  setTimeout(() => {
    current++;
    if (current < matches.length) showMatch();
    else showResult();
  }, 450);
}

rightBtn.addEventListener("click", () => pick("right"));
leftBtn.addEventListener("click", () => pick("left"));
document.getElementById("bothBtn").addEventListener("click", () => pick("both"));
document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("againBtn").addEventListener("click", startGame);


// ---------- النتيجة ----------
let finalOrder = [];

function showResult() {
  finalOrder = clowns
    .map((c, i) => ({ ...c, points: points[i] }))
    .sort((x, y) => y.points - x.points);

  const first = finalOrder[0];
  const winner = document.getElementById("winner");
  winner.querySelector("img").src = first.img;
  winner.querySelector(".score").textContent = `فاز في ${first.points} مواجهات`;

  const list = document.getElementById("ranking");
  list.innerHTML = "";
  finalOrder.slice(1).forEach((c, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="num">${i + 2}</span>
      <img src="${c.img}" alt="">
      <span></span>
      <span class="points">${c.points} نقاط</span>`;
    list.appendChild(li);
  });

  showScreen("result");
}


// ---------- صورة النتيجة ----------
function loadImage(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(img);
    img.src = src;
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawCard(ctx, img, x, y, w, h, rank, big) {
  ctx.save();
  roundRect(ctx, x, y, w, h, big ? 18 : 14);
  ctx.clip();
  const size = Math.max(w, h);
  ctx.drawImage(img, x + (w - size) / 2, y + (h - size) / 2, size, size);

  const fade = ctx.createLinearGradient(0, y + h * 0.45, 0, y + h);
  fade.addColorStop(0, "rgba(7,13,19,0)");
  fade.addColorStop(1, "rgba(7,13,19,.95)");
  ctx.fillStyle = fade;
  ctx.fillRect(x, y, w, h);
  ctx.restore();

  ctx.lineWidth = big ? 2 : 1.5;
  ctx.strokeStyle = big ? "rgba(79,184,196,.9)" : "rgba(79,184,196,.35)";
  roundRect(ctx, x, y, w, h, big ? 18 : 14);
  ctx.stroke();

  ctx.textAlign = "right";
  ctx.font = (big ? 120 : 64) + "px Lalezar, Tahoma, sans-serif";
  ctx.fillStyle = "#fff";
  ctx.fillText(String(rank), x + w - (big ? 24 : 16), y + h - (big ? 22 : 12));
}

document.getElementById("saveBtn").addEventListener("click", async () => {
  try { await document.fonts.ready; } catch (e) {}

  const W = 1200, H = 630;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  const imgs = await Promise.all(finalOrder.slice(0, 3).map(c => loadImage(c.img)));
  const logo = await loadImage("../outlaw/logo.jpg");

  // الخلفية
  ctx.fillStyle = "#070d13";
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(900, 120, 10, 900, 120, 620);
  glow.addColorStop(0, "rgba(79,184,196,.16)");
  glow.addColorStop(1, "rgba(79,184,196,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "rgba(120,200,215,.05)";
  ctx.lineWidth = 1;
  for (let i = 0; i < W; i += 40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke(); }
  for (let j = 0; j < H; j += 40) { ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(W, j); ctx.stroke(); }

  // الصور
  ctx.direction = "rtl";
  ctx.textBaseline = "alphabetic";
  drawCard(ctx, imgs[0], 60, 60, 380, 510, 1, true);
  drawCard(ctx, imgs[1], 460, 60, 180, 245, 2, false);
  drawCard(ctx, imgs[2], 460, 325, 180, 245, 3, false);

  ctx.textAlign = "left";
  ctx.font = "34px Lalezar, Tahoma, sans-serif";
  ctx.fillStyle = "#4fb8c4";
  ctx.fillText("ملك المهرجين", 84, 548);

  // الكلام
  const rx = 1140;
  ctx.save();
  ctx.beginPath();
  ctx.arc(rx - 34, 94, 34, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(logo, rx - 68, 60, 68, 68);
  ctx.restore();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(79,184,196,.8)";
  ctx.beginPath();
  ctx.arc(rx - 34, 94, 34, 0, Math.PI * 2);
  ctx.stroke();

  ctx.textAlign = "right";
  ctx.font = "30px Lalezar, Tahoma, sans-serif";
  ctx.fillStyle = "#86a3b1";
  ctx.fillText("اوتلاو", rx - 84, 104);

  ctx.font = "112px Lalezar, Tahoma, sans-serif";
  ctx.fillStyle = "#fff";
  ctx.fillText("توب", rx, 268);
  ctx.fillText("المهرجين", rx, 378);

  ctx.fillStyle = "#4fb8c4";
  ctx.fillRect(rx - 120, 408, 120, 4);

  ctx.font = "34px Lalezar, Tahoma, sans-serif";
  ctx.fillStyle = "#c9d9e0";
  ctx.fillText("هذا ترتيبي، وش ترتيبك؟", rx, 470);

  canvas.toBlob(blob => {
    try {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "top-clowns.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      document.getElementById("popupImg").src = canvas.toDataURL("image/png");
      document.getElementById("imagePopup").hidden = false;
    }
  }, "image/png");
});

document.getElementById("closePopup").addEventListener("click", () => {
  document.getElementById("imagePopup").hidden = true;
});


// =============================
//  شهادة التهريج
// =============================

// الألقاب (عدليها وزيدي عليها براحتك)
const titles = [
  "مهرج الموسم",
  "ملك الأعذار",
  "مهرج بدرجة امتياز",
  "خبير تهريج معتمد",
  "مهرج مع مرتبة الشرف",
  "سفير السيرك في اوتلاو",
];

let chosenClown = 0;
let chosenTitle = 0;

const picker = document.getElementById("picker");
const titlesBox = document.getElementById("titles");
const certCanvas = document.getElementById("certCanvas");
const nameInput = document.getElementById("nameInput");

nameInput.addEventListener("input", () => drawCertificate());

clowns.forEach((c, i) => {
  const btn = document.createElement("button");
  btn.innerHTML = `<img src="${c.img}" alt="">`;
  if (i === 0) btn.classList.add("on");

  btn.addEventListener("click", () => {
    picker.querySelectorAll("button").forEach(b => b.classList.remove("on"));
    btn.classList.add("on");
    chosenClown = i;
    drawCertificate();
  });
  picker.appendChild(btn);
});

titles.forEach((t, i) => {
  const btn = document.createElement("button");
  btn.textContent = t;
  if (i === 0) btn.classList.add("on");

  btn.addEventListener("click", () => {
    titlesBox.querySelectorAll("button").forEach(b => b.classList.remove("on"));
    btn.classList.add("on");
    chosenTitle = i;
    drawCertificate();
  });
  titlesBox.appendChild(btn);
});

async function drawCertificate() {
  try { await document.fonts.ready; } catch (e) {}

  const ctx = certCanvas.getContext("2d");
  const W = 1200, H = 630;
  const clown = clowns[chosenClown];
  const photo = await loadImage(clown.img);
  const logo = await loadImage("../outlaw/logo.jpg");
  const FONT = "Lalezar, Tahoma, sans-serif";

  // الخلفية
  ctx.fillStyle = "#070d13";
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, 0, 10, W / 2, 0, 700);
  glow.addColorStop(0, "rgba(79,184,196,.18)");
  glow.addColorStop(1, "rgba(79,184,196,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // البرواز
  ctx.strokeStyle = "rgba(79,184,196,.8)";
  ctx.lineWidth = 2;
  roundRect(ctx, 30, 30, W - 60, H - 60, 18);
  ctx.stroke();
  ctx.strokeStyle = "rgba(79,184,196,.25)";
  ctx.lineWidth = 1;
  roundRect(ctx, 44, 44, W - 88, H - 88, 12);
  ctx.stroke();

  // صورة المهرج
  const px = 250, py = 315, r = 150;
  ctx.save();
  ctx.beginPath();
  ctx.arc(px, py, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(photo, px - r, py - r, r * 2, r * 2);
  ctx.restore();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#4fb8c4";
  ctx.beginPath();
  ctx.arc(px, py, r, 0, Math.PI * 2);
  ctx.stroke();

  // الكلام
  const cx = 770;
  ctx.direction = "rtl";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, 112, 36, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(logo, cx - 36, 76, 72, 72);
  ctx.restore();

  ctx.font = "56px " + FONT;
  ctx.fillStyle = "#fff";
  ctx.fillText("شهادة تهريج معتمدة", cx, 210);

  ctx.fillStyle = "#4fb8c4";
  ctx.fillRect(cx - 60, 250, 120, 3);

  ctx.font = "28px " + FONT;
  ctx.fillStyle = "#86a3b1";
  ctx.fillText("تشهد اوتلاو بأن", cx, 290);

  const name = nameInput.value.trim();
  if (name) {
    let size = 84;
    do {
      ctx.font = size + "px " + FONT;
      size -= 4;
    } while (ctx.measureText(name).width > 600 && size > 40);
    ctx.fillStyle = "#fff";
    ctx.fillText(name, cx, 380);
  } else {
    // مكان الاسم فاضي
    ctx.strokeStyle = "rgba(255,255,255,.35)";
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(cx - 220, 380);
    ctx.lineTo(cx + 220, 380);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.font = "28px " + FONT;
  ctx.fillStyle = "#86a3b1";
  ctx.fillText("حصل على لقب", cx, 432);

  ctx.font = "50px " + FONT;
  ctx.fillStyle = "#4fb8c4";
  ctx.fillText(titles[chosenTitle], cx, 494);

  ctx.font = "22px " + FONT;
  ctx.fillStyle = "rgba(134,163,177,.8)";
  ctx.fillText("#توب_المهرجين", cx, 560);
}

function openCert() {
  showScreen("cert");
  drawCertificate();
}

document.getElementById("certBtn1").addEventListener("click", openCert);
document.getElementById("certBtn2").addEventListener("click", openCert);
document.getElementById("backBtn").addEventListener("click", () => showScreen("start"));

document.getElementById("certSaveBtn").addEventListener("click", async () => {
  await drawCertificate();
  certCanvas.toBlob(blob => {
    try {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "clown-certificate.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      document.getElementById("popupImg").src = certCanvas.toDataURL("image/png");
      document.getElementById("imagePopup").hidden = false;
    }
  }, "image/png");
});
