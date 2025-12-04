const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = "menu"; // menu, playing, gameover
let difficulty = "easy";
let score = 0;
let level = 1;

const player = { x: 270, y: 550, size: 40, speed: 5, maxHp: 100, hp: 100 };
let bullets = [];
let enemies = [];
let enemyBullets = [];
let shields = [];

const keys = {};
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

// Pociski gracza
function shoot() {
  if(!keys.shootCooldown) {
    bullets.push({ x: player.x + player.size/2 - 4, y: player.y, size: 8, speed: 8, color: 'yellow' });
    keys.shootCooldown = true;
    setTimeout(() => keys.shootCooldown = false, 200);
  }
}

// Tworzenie przeciwników
function spawnEnemy() {
  const size = 40;
  const x = Math.random() * (canvas.width - size);
  const hp = Math.floor(Math.random() * 101) + 50; // 50-150 HP
  enemies.push({ x: x, y: 0, size: size, speed: difficulty === "easy" ? 2 : 4, hp: hp, maxHp: hp, shootCooldown: 0 });
}

// Strzały przeciwników
function enemyShoot(e) {
  enemyBullets.push({ x: e.x + e.size/2 - 4, y: e.y + e.size, size: 8, speed: 4, color: 'red' });
}

// Tarczę po zabiciu przeciwnika
function spawnShield(x, y) {
  shields.push({ x: x, y: y, size: 15 });
}

// Kolizje
function isColliding(a, b) {
  return a.x < b.x + b.size && a.x + a.size > b.x &&
         a.y < b.y + b.size && a.y + a.size > b.y;
}

function update() {
  if(gameState !== "playing") return;

  // Ruch gracza
  if(keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
  if(keys['ArrowRight'] && player.x + player.size < canvas.width) player.x += player.speed;
  if(keys[' '] || keys['Space']) shoot();

  // Ruch pocisków gracza
  bullets.forEach((b, i) => {
    b.y -= b.speed;
    if(b.y < 0) bullets.splice(i, 1);
  });

  // Ruch przeciwników
  enemies.forEach((e, i) => {
    e.y += e.speed;
    e.shootCooldown--;
    if(e.shootCooldown <= 0) {
      enemyShoot(e);
      e.shootCooldown = Math.floor(Math.random() * 120) + 60;
    }

    if(e.y + e.size > canvas.height) {
      enemies.splice(i, 1);
      player.hp -= 20;
      if(player.hp <= 0) gameState = "gameover";
    }
  });

  // Ruch pocisków przeciwników
  enemyBullets.forEach((b, i) => {
    b.y += b.speed;
    if(b.y > canvas.height) enemyBullets.splice(i, 1);
    if(isColliding(b, player)) {
      enemyBullets.splice(i, 1);
      player.hp -= 10;
      if(player.hp <= 0) gameState = "gameover";
    }
  });

  // Kolizje pocisk-przeciwnik
  bullets.forEach((b, bi) => {
    enemies.forEach((e, ei) => {
      if(isColliding(b, e)) {
        bullets.splice(bi, 1);
        e.hp -= 20;
        if(e.hp <= 0) {
          score += 10;
          spawnShield(e.x + e.size/2 - 7.5, e.y + e.size/2 - 7.5);
          enemies.splice(ei, 1);
        }
      }
    });
  });

  // Kolizje tarcza-gracz
  shields.forEach((s, i) => {
    if(isColliding(s, player)) {
      player.hp += 20;
      if(player.hp > player.maxHp) player.hp = player.maxHp;
      shields.splice(i, 1);
    }
  });
}

// Rysowanie gracza, pocisków, przeciwników i tarcz
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if(gameState === "menu") {
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText("Wybierz trudność:", 150, 200);
    ctx.fillStyle = 'lime';
    ctx.fillText("Łatwy - naciśnij E", 150, 250);
    ctx.fillStyle = 'red';
    ctx.fillText("Trudny - naciśnij T", 150, 300);
    return;
  }

  // Gracz
  ctx.fillStyle = 'lime';
  ctx.fillRect(player.x, player.y, player.size, player.size);

  // Pasek HP gracza
  ctx.fillStyle = 'red';
  ctx.fillRect(player.x, player.y - 10, player.size, 5);
  ctx.fillStyle = 'green';
  ctx.fillRect(player.x, player.y - 10, player.size * (player.hp / player.maxHp), 5);

  // Pociski gracza
  bullets.forEach(b => {
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, b.y, b.size, b.size);
  });

  // Przeciwnicy
  enemies.forEach(e => {
    ctx.fillStyle = 'red';
    ctx.fillRect(e.x, e.y, e.size, e.size);
    // Pasek HP przeciwnika
    ctx.fillStyle = 'green';
    ctx.fillRect(e.x, e.y - 5, e.size * (e.hp / e.maxHp), 3);
  });

  // Pociski przeciwników
  enemyBullets.forEach(b => {
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, b.y, b.size, b.size);
  });

  // Tarcze
  shields.forEach(s => {
    ctx.fillStyle = 'cyan';
    ctx.beginPath();
    ctx.arc(s.x + s.size/2, s.y + s.size/2, s.size/2, 0, Math.PI*2);
    ctx.fill();
  });

  // HUD
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText(`Wynik: ${score}`, 10, 20);
  ctx.fillText(`Poziom: ${level}`, 500 - 100, 20);

  if(gameState === "gameover") {
    ctx.fillStyle = 'white';
    ctx.font = '40px Arial';
    ctx.fillText("Koniec gry!", 200, 300);
    ctx.font = '20px Arial';
    ctx.fillText("Naciśnij R, aby zagrać ponownie", 150, 350);
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Obsługa menu i restartu
document.addEventListener('keydown', (e) => {
  if(gameState === "menu") {
    if(e.key.toLowerCase() === 'e') {
      difficulty = "easy";
      gameState = "playing";
    }
    if(e.key.toLowerCase() === 't') {
      difficulty = "hard";
      gameState = "playing";
    }
  }
  if(gameState === "gameover" && e.key.toLowerCase() === 'r') {
    // Reset gry
    player.hp = player.maxHp;
    player.x = 270;
    bullets = [];
    enemies = [];
    enemyBullets = [];
    shields = [];
    score = 0;
    level = 1;
    gameState = "menu";
  }
});

// Tworzenie przeciwników co 1.5s
setInterval(() => {
  if(gameState === "playing") spawnEnemy();
}, 1500);

gameLoop();
