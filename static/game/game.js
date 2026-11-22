const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const timeEl = document.querySelector("#score");
const damageEl = document.querySelector("#energy");
const stateEl = document.querySelector("#state");
const speedEl = document.querySelector("#speed");
const overlay = document.querySelector("#overlay");
const startButton = document.querySelector("#startButton");
const touchButtons = document.querySelectorAll("[data-action]");

const keys = new Set();
const photons = [];
const sparks = [];
const streams = [];

let running = false;
let lastTime = 0;
let elapsed = 0;
let score = 0;
let damage = 0;
let stress = 0;
let baseSpeed = 220;
let photonTimer = 0;
let streamTimer = 0;
let fieldOffset = 0;
const fieldMolecules = Array.from({ length: 18 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  scale: 0.42 + Math.random() * 0.74,
  phase: Math.random() * Math.PI * 2,
  alpha: 0.035 + Math.random() * 0.055
}));

const player = {
  x: 190,
  y: canvas.height / 2,
  vx: 0,
  vy: 0,
  form: "trans",
  cisTimer: 0,
  boostTimer: 0,
  flicker: 0,
  stride: 0
};

const photonTypes = {
  red: {
    label: "R",
    color: "#ff6b5f",
    radius: 16,
    role: "stabilize"
  },
  green: {
    label: "G",
    color: "#6dff9e",
    radius: 17,
    role: "stable-cis"
  },
  blue: {
    label: "B",
    color: "#56d8ff",
    radius: 15,
    role: "fast-cis"
  },
  uv: {
    label: "UV",
    color: "#c991ff",
    radius: 18,
    role: "damage"
  }
};

function resetGame() {
  running = true;
  lastTime = performance.now();
  elapsed = 0;
  score = 0;
  damage = 0;
  stress = 0;
  baseSpeed = 220;
  photonTimer = 0;
  streamTimer = 0.4;
  fieldOffset = 0;
  photons.length = 0;
  sparks.length = 0;
  streams.length = 0;
  player.x = 190;
  player.y = canvas.height / 2;
  player.vx = 0;
  player.vy = 0;
  player.form = "trans";
  player.cisTimer = 0;
  player.boostTimer = 0;
  player.flicker = 0;
  overlay.classList.add("hidden");
  requestAnimationFrame(loop);
}

function update(dt) {
  elapsed += dt;
  baseSpeed = Math.min(520, baseSpeed + dt * 7.5);
  const boost = player.boostTimer > 0 ? 90 : 0;
  const formSpeed = player.form === "trans" ? 48 : -18;
  const worldSpeed = baseSpeed + boost + formSpeed;
  const instability = damage > 68 ? (damage - 68) * 0.55 : 0;

  score += dt * (10 + worldSpeed * 0.035);
  stress += dt * (player.form === "cis" ? 5.8 : -3.2);
  damage += dt * (stress > 62 ? 1.2 : -0.25);
  stress = clamp(stress, 0, 100);
  damage = clamp(damage, 0, 100);
  fieldOffset = (fieldOffset + worldSpeed * dt) % 112;
  player.boostTimer = Math.max(0, player.boostTimer - dt);
  player.flicker = Math.max(0, player.flicker - dt);
  player.stride += dt * (player.form === "trans" ? 12 : 8);

  if (player.form === "cis") {
    player.cisTimer -= dt;
    if (player.cisTimer <= 0) relaxToTrans();
  }

  updateMovement(dt, instability);
  updateSpawning(dt);
  updatePhotons(dt, worldSpeed);
  updateSparks(dt);

  if (damage >= 100) endGame();
  updateHud(worldSpeed);
}

function updateMovement(dt, instability) {
  const axisX = (keys.has("arrowright") || keys.has("d") ? 1 : 0) - (keys.has("arrowleft") || keys.has("a") ? 1 : 0);
  const axisY = (keys.has("arrowdown") || keys.has("s") ? 1 : 0) - (keys.has("arrowup") || keys.has("w") ? 1 : 0);
  const length = Math.hypot(axisX, axisY) || 1;
  const agility = player.form === "cis" ? 360 : 280;
  const drift = Math.sin(elapsed * 15) * instability;

  player.vx += ((axisX / length) * agility - player.vx) * Math.min(1, dt * 12);
  player.vy += ((axisY / length) * agility + drift - player.vy) * Math.min(1, dt * 12);
  player.x += player.vx * dt;
  player.y += player.vy * dt;

  const radius = playerRadius();
  player.x = clamp(player.x, 72 + radius, canvas.width * 0.62);
  player.y = clamp(player.y, 62 + radius, canvas.height - 62 - radius);
}

function updateSpawning(dt) {
  photonTimer -= dt;
  streamTimer -= dt;
  const density = Math.min(0.62, elapsed / 130);
  if (photonTimer <= 0) {
    spawnPhotonCluster();
    photonTimer = 0.54 - density * 0.32 + Math.random() * 0.18;
  }
  if (streamTimer <= 0) {
    spawnStream();
    streamTimer = 2.4 - density * 1.05 + Math.random() * 1.1;
  }
}

function spawnPhotonCluster() {
  const difficulty = Math.min(1, elapsed / 95);
  const roll = Math.random();
  let kind = "red";
  if (roll < 0.22 + difficulty * 0.1) kind = "uv";
  else if (roll < 0.46) kind = "blue";
  else if (roll < 0.72) kind = "green";

  const count = kind === "uv" ? 2 + Math.floor(Math.random() * 3) : 2 + Math.floor(Math.random() * 5);
  const centerY = 82 + Math.random() * (canvas.height - 164);
  const spread = kind === "green" ? 72 : kind === "red" ? 94 : 56;
  for (let i = 0; i < count; i += 1) {
    spawnPhoton(kind, canvas.width + 80 + i * 34 + Math.random() * 42, centerY + (Math.random() - 0.5) * spread);
  }
}

function spawnStream() {
  const roll = Math.random();
  const kind = roll < 0.34 ? "red" : roll < 0.58 ? "green" : roll < 0.78 ? "blue" : "uv";
  const y = 80 + Math.random() * (canvas.height - 160);
  const count = kind === "uv" ? 7 : 10;
  const wave = Math.random() * Math.PI * 2;
  for (let i = 0; i < count; i += 1) {
    const x = canvas.width + 100 + i * 54;
    const py = y + Math.sin(wave + i * 0.72) * (kind === "red" ? 24 : 42);
    spawnPhoton(kind, x, py);
  }
}

function spawnPhoton(kind, x, y) {
  const type = photonTypes[kind];
  photons.push({
    x,
    y: clamp(y, 58, canvas.height - 58),
    radius: type.radius,
    type,
    phase: Math.random() * Math.PI * 2,
    laneDrift: (Math.random() - 0.5) * (kind === "uv" ? 38 : 20)
  });
}

function updatePhotons(dt, worldSpeed) {
  for (let i = photons.length - 1; i >= 0; i -= 1) {
    const photon = photons[i];
    photon.x -= worldSpeed * dt;
    photon.phase += dt * 5.5;
    photon.y += Math.sin(photon.phase) * photon.laneDrift * dt;

    if (Math.hypot(photon.x - player.x, photon.y - player.y) < photon.radius + playerRadius()) {
      absorbPhoton(photon);
      photons.splice(i, 1);
      continue;
    }

    if (photon.x < -70) photons.splice(i, 1);
  }
}

function absorbPhoton(photon) {
  const type = photon.type;
  if (type.role === "stabilize") {
    stress = Math.max(0, stress - 13);
    damage = Math.max(0, damage - 4);
    score += 70;
  }
  if (type.role === "stable-cis") {
    photoisomerize(5.3, 8, type.color);
    score += 100;
  }
  if (type.role === "fast-cis") {
    photoisomerize(2.4, 18, type.color);
    player.boostTimer = 0.72;
    score += 130;
  }
  if (type.role === "damage") {
    photoisomerize(3.1, 0, type.color);
    damage += 17;
    stress += 13;
    score = Math.max(0, score - 45);
    player.flicker = 0.34;
  }
  burst(photon.x, photon.y, type.color, type.role === "damage" ? 28 : 18);
}

function photoisomerize(cisLifetime, stressGain, color) {
  if (player.form === "cis") {
    switchToTrans(color, true);
    return;
  }

  player.flicker = 0.24;
  player.form = "cis";
  player.cisTimer = Math.max(player.cisTimer, cisLifetime);
  stress += stressGain;
  burst(player.x, player.y, color, 16);
}

function relaxToTrans() {
  switchToTrans("#56d8ff", false);
}

function switchToTrans(color, photochemical) {
  player.form = "trans";
  player.cisTimer = 0;
  player.flicker = 0.22;
  stress = Math.max(0, stress - (photochemical ? 2 : 5));
  burst(player.x, player.y, color, photochemical ? 16 : 12);
}

function updateSparks(dt) {
  for (let i = sparks.length - 1; i >= 0; i -= 1) {
    const spark = sparks[i];
    spark.life -= dt;
    spark.x += spark.vx * dt;
    spark.y += spark.vy * dt;
    if (spark.life <= 0) sparks.splice(i, 1);
  }
}

function playerRadius() {
  return player.form === "cis" ? 25 : 38;
}

function burst(x, y, color, amount) {
  for (let i = 0; i < amount; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 42 + Math.random() * 170;
    sparks.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color,
      life: 0.25 + Math.random() * 0.48
    });
  }
}

function updateHud(worldSpeed) {
  timeEl.textContent = `${Math.floor(elapsed)}s`;
  damageEl.textContent = `${Math.floor(damage)}%`;
  stateEl.textContent = player.form.toUpperCase();
  speedEl.textContent = Math.floor(worldSpeed).toString();
}

function endGame() {
  running = false;
  overlay.classList.remove("hidden");
  overlay.querySelector("h2").textContent = "Photodegradation";
  overlay.querySelector("p").textContent = `The molecule survived for ${Math.floor(elapsed)} seconds. Avoid UV storms, ride green clouds, and use red streams to recover stability.`;
  startButton.textContent = "Restart";
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  photons.forEach(drawPhoton);
  sparks.forEach(drawSpark);
  drawPlayer();
  drawDamageField();
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#03060b");
  gradient.addColorStop(0.44, damage > 68 ? "#211018" : "#0b1118");
  gradient.addColorStop(1, "#06110f");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawPhotochemicalField();

  const glow = ctx.createRadialGradient(player.x, player.y, 40, player.x, player.y, 390);
  glow.addColorStop(0, player.form === "cis" ? "rgba(217,108,255,0.14)" : "rgba(86,216,255,0.13)");
  glow.addColorStop(0.46, "rgba(109,255,158,0.035)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawIrradiationBeams();

  ctx.strokeStyle = damage > 72 ? "rgba(255,90,112,0.16)" : "rgba(247,244,236,0.045)";
  ctx.lineWidth = 1;
  for (let y = 58; y < canvas.height; y += 54) {
    const drift = (fieldOffset * 0.18 + y) % canvas.width;
    ctx.beginPath();
    ctx.moveTo(-60, y + Math.sin((fieldOffset + y) * 0.014) * 8);
    ctx.bezierCurveTo(190, y - 16, 430, y + 18, canvas.width + 60, y + Math.sin(drift * 0.015) * 10);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(247,244,236,0.48)";
  ctx.font = "800 12px Segoe UI";
  ctx.fillText("FLUORESCENCE FLOW", canvas.width - 176, 34);
}

function drawPhotochemicalField() {
  ctx.save();
  for (let x = -fieldOffset * 0.22; x < canvas.width + 80; x += 78) {
    const alpha = 0.035 + Math.sin(elapsed * 1.2 + x * 0.04) * 0.012;
    ctx.strokeStyle = `rgba(86,216,255,${alpha})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 42, canvas.height);
    ctx.stroke();
  }

  for (const molecule of fieldMolecules) {
    const x = (molecule.x - fieldOffset * molecule.scale * 0.38 + canvas.width + 80) % (canvas.width + 160) - 80;
    const y = molecule.y + Math.sin(elapsed * 0.9 + molecule.phase) * 9;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(elapsed * 0.24 + molecule.phase) * 0.18);
    ctx.scale(molecule.scale, molecule.scale);
    ctx.globalAlpha = molecule.alpha;
    drawMoleculeSilhouette();
    ctx.restore();
  }
  ctx.restore();
}

function drawIrradiationBeams() {
  const y = canvas.height * 0.2 + Math.sin(elapsed * 0.55) * 12;
  const band = ctx.createLinearGradient(0, y, canvas.width, y + 160);
  band.addColorStop(0, "rgba(86,216,255,0)");
  band.addColorStop(0.24, "rgba(86,216,255,0.07)");
  band.addColorStop(0.54, "rgba(109,255,158,0.055)");
  band.addColorStop(0.82, "rgba(201,145,255,0.075)");
  band.addColorStop(1, "rgba(201,145,255,0)");
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = band;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.bezierCurveTo(230, y + 28, 530, y - 24, canvas.width, y + 34);
  ctx.lineTo(canvas.width, y + 138);
  ctx.bezierCurveTo(660, y + 112, 260, y + 152, 0, y + 106);
  ctx.closePath();
  ctx.fill();

  for (let i = 0; i < 5; i += 1) {
    const beamY = y + 18 + i * 24 + Math.sin(elapsed + i) * 5;
    const beam = ctx.createLinearGradient(0, beamY, canvas.width, beamY);
    beam.addColorStop(0, "rgba(255,255,255,0)");
    beam.addColorStop(0.5, i % 2 ? "rgba(86,216,255,0.13)" : "rgba(201,145,255,0.12)");
    beam.addColorStop(1, "rgba(255,255,255,0)");
    ctx.strokeStyle = beam;
    ctx.lineWidth = i === 2 ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(0, beamY);
    ctx.bezierCurveTo(260, beamY - 18, 620, beamY + 16, canvas.width, beamY - 4);
    ctx.stroke();
  }
  ctx.restore();
}

function drawMoleculeSilhouette() {
  ctx.strokeStyle = "#f7f4ec";
  ctx.lineWidth = 2;
  drawAromaticRing(-46, 0, 15, "#f7f4ec", false);
  drawAromaticRing(46, 0, 15, "#f7f4ec", false);
  drawBond(-32, 0, -12, 0);
  drawBond(12, 0, 32, 0);
  ctx.beginPath();
  ctx.moveTo(-11, -3);
  ctx.lineTo(11, -3);
  ctx.moveTo(-11, 4);
  ctx.lineTo(11, 4);
  ctx.stroke();
}

function drawPhoton(photon) {
  const type = photon.type;
  const pulse = Math.sin(photon.phase * 1.8) * 2.5;
  ctx.save();
  ctx.translate(photon.x, photon.y);
  const aura = ctx.createRadialGradient(0, 0, photon.radius * 0.35, 0, 0, photon.radius * 3.2 + pulse);
  aura.addColorStop(0, type.color);
  aura.addColorStop(0.38, `${hexToRgba(type.color, 0.28)}`);
  aura.addColorStop(1, "rgba(0,0,0,0)");
  ctx.shadowColor = type.color;
  ctx.shadowBlur = type.role === "damage" ? 26 : 18;
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, 0, photon.radius * 2.7 + pulse, 0, Math.PI * 2);
  ctx.fill();

  const core = ctx.createRadialGradient(-5, -6, 2, 0, 0, photon.radius + pulse);
  core.addColorStop(0, "#ffffff");
  core.addColorStop(0.18, "#f7f4ec");
  core.addColorStop(1, type.color);
  ctx.fillStyle = type.color;
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(0, 0, photon.radius + pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.72)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, photon.radius + pulse + 4, 0, Math.PI * 2);
  ctx.stroke();

  if (type.role === "damage") {
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-12, -12);
    ctx.lineTo(12, 12);
    ctx.moveTo(12, -12);
    ctx.lineTo(-12, 12);
    ctx.stroke();
  }

  ctx.shadowBlur = 0;
  ctx.fillStyle = "#07090e";
  ctx.font = "900 9px Segoe UI";
  ctx.textAlign = "center";
  ctx.fillText(type.label, 0, 3);
  ctx.restore();
}

function drawPlayer() {
  const cis = player.form === "cis";
  const color = cis ? "#d96cff" : "#56d8ff";
  const pulse = player.flicker > 0 ? 9 : 0;
  const bob = Math.sin(player.stride) * (cis ? 2 : 4);
  const damageJitter = damage > 62 ? (Math.random() - 0.5) * ((damage - 62) * 0.12) : 0;
  const breath = Math.sin(player.stride * 0.5) * 1.8;

  ctx.save();
  ctx.translate(player.x + damageJitter, player.y + bob);
  const bodyGlow = ctx.createRadialGradient(0, 0, 8, 0, 0, cis ? 78 : 118);
  bodyGlow.addColorStop(0, hexToRgba(color, 0.38));
  bodyGlow.addColorStop(0.46, hexToRgba(color, 0.12));
  bodyGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = bodyGlow;
  ctx.beginPath();
  ctx.ellipse(0, 10, cis ? 78 : 118, cis ? 54 : 42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = damage > 78 ? "#ff4e64" : color;
  ctx.shadowBlur = 18 + pulse;
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  ctx.lineWidth = cis ? 6 : 7;

  if (cis) {
    drawAzoBridge(-12, -1, 12, -1, color, true);
    drawBond(-12, -1, -36, -23);
    drawBond(12, -1, 36, -23);
    drawAromaticRing(-52, -31, 21 + breath * 0.15, color, true);
    drawAromaticRing(52, -31, 21 + breath * 0.15, color, true);
  } else {
    drawBond(-12, 0, -42, 0);
    drawBond(12, 0, 42, 0);
    drawAzoBridge(-12, 0, 12, 0, color, false);
    drawAromaticRing(-66, 0, 23 + breath * 0.18, color, true);
    drawAromaticRing(66, 0, 23 + breath * 0.18, color, true);
  }

  drawNitrogen(-10, cis ? -1 : 0, pulse);
  drawNitrogen(10, cis ? -1 : 0, pulse);

  if (damage > 26) drawCracks(damage);
  ctx.restore();
}

function hexToRgba(hex, alpha) {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function drawCracks(level) {
  ctx.strokeStyle = level > 70 ? "#ff4e64" : "#ffffff";
  ctx.lineWidth = 1.5;
  const crackCount = level > 70 ? 5 : level > 45 ? 3 : 2;
  for (let i = 0; i < crackCount; i += 1) {
    const x = -24 + i * 12;
    ctx.beginPath();
    ctx.moveTo(x, -10);
    ctx.lineTo(x + 6, -2);
    ctx.lineTo(x + 1, 8);
    ctx.stroke();
  }
}

function drawDamageField() {
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  roundRect(24, 24, 220, 16, 8, false, true);
  ctx.fillStyle = damage > 74 ? "#ff4e64" : damage > 42 ? "#ffd15c" : "#6dff9e";
  roundRect(24, 24, 220 * Math.min(1, damage / 100), 16, 8, false, true);
  ctx.fillStyle = "rgba(247,244,236,0.72)";
  ctx.font = "800 12px Segoe UI";
  ctx.fillText("PHOTON DAMAGE", 24, 56);

  if (player.form === "cis") {
    ctx.fillStyle = "rgba(217,108,255,0.25)";
    roundRect(24, 64, 160, 8, 4, false, true);
    ctx.fillStyle = "#d96cff";
    roundRect(24, 64, 160 * Math.min(1, player.cisTimer / 5.3), 8, 4, false, true);
  }
  ctx.restore();
}

function drawSpark(spark) {
  ctx.globalAlpha = Math.max(0, spark.life * 2.4);
  ctx.fillStyle = spark.color;
  ctx.beginPath();
  ctx.arc(spark.x, spark.y, 3.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawBond(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawAzoBridge(x1, y1, x2, y2, color, bent) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = bent ? 4 : 5;
  ctx.lineCap = "round";
  const offset = bent ? 4 : 5;
  ctx.beginPath();
  ctx.moveTo(x1, y1 - offset);
  ctx.lineTo(x2, y2 - offset);
  ctx.moveTo(x1, y1 + offset);
  ctx.lineTo(x2, y2 + offset);
  ctx.stroke();
  ctx.restore();
}

function drawNitrogen(x, y, pulse) {
  ctx.save();
  ctx.shadowColor = "#f7f4ec";
  ctx.shadowBlur = 8 + pulse;
  ctx.fillStyle = "#f7f4ec";
  ctx.beginPath();
  ctx.arc(x, y, 9 + pulse * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#071018";
  ctx.font = "900 9px Segoe UI";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("N", x, y + 0.5);
  ctx.restore();
}

function drawAromaticRing(x, y, radius, color, filled) {
  ctx.save();
  ctx.translate(x, y);
  if (filled) {
    const fill = ctx.createRadialGradient(0, 0, radius * 0.25, 0, 0, radius * 1.55);
    fill.addColorStop(0, hexToRgba(color, 0.16));
    fill.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.45, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  const vertices = [];
  for (let i = 0; i < 6; i += 1) {
    const angle = Math.PI / 6 + (i * Math.PI * 2) / 6;
    const px = Math.cos(angle) * radius;
    const py = Math.sin(angle) * radius;
    vertices.push({ x: px, y: py });
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();

  ctx.lineWidth = 2;
  ctx.strokeStyle = filled ? "rgba(247,244,236,0.82)" : color;
  for (let i = 0; i < 6; i += 2) {
    const a = vertices[i];
    const b = vertices[(i + 1) % 6];
    ctx.beginPath();
    ctx.moveTo(a.x * 0.72, a.y * 0.72);
    ctx.lineTo(b.x * 0.72, b.y * 0.72);
    ctx.stroke();
  }

  ctx.strokeStyle = hexToRgba(color, filled ? 0.64 : 0.38);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.52, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function roundRect(x, y, width, height, radius, stroke, fill) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function loop(now) {
  if (!running) return;
  const dt = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  keys.add(event.key.toLowerCase());
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) event.preventDefault();
});

window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));

touchButtons.forEach((button) => {
  button.addEventListener("pointerdown", () => keys.add(button.dataset.action === "up" ? "arrowup" : button.dataset.action === "down" ? "arrowdown" : button.dataset.action === "left" ? "arrowleft" : "arrowright"));
  button.addEventListener("pointerup", () => keys.clear());
  button.addEventListener("pointerleave", () => keys.clear());
});

startButton.addEventListener("click", resetGame);
draw();
updateHud(baseSpeed + 48);
