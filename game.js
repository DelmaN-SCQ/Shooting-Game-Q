const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const player = { x: 220, y: 550, width: 60, height: 20, speed: 6, lives: 3 };
let bullets = [];
let enemies = [];
let explosions = [];
let score = 0;
let level = 1;
let enemySpeed = 2;

const keys = {};
document.addEventListener('keydown', (e) => { keys[e.key] = true; });
document.addEventListener('keyup', (e) => { keys[e.key] = false; });

function shoot() {
  if(!keys.shootCooldown) {
    bullets.push({ x: player.x + player.width/2 - 3, y: player.y, width: 6, height: 12, speed: 8, color: getRandomColor() });
    keys.shootCooldown = true;
    setTimeout(() => { keys.shootCooldown = false; }, 250);
  }
}

function spawnEnemy() {
  const x = Math.random() * (canvas.width - 40);
  enemies.push({ x: x, y: 0, width: 40, height: 20, speed: enemySpeed, color: getRandomColor(), dx: Math.random() > 0.5 ? 1 : -1 });
}

function isColliding(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x &&
         a.y < b.y + b.height && a.y + a.height > b.y;
}

function getRandomColor() {
  const colors = ['#ff3c3c', '#3cff3c', '#3c3cff', '#ff3cff', '#fff23c'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Tworzenie eksplozji
function createExplosion(x, y) {
  for(let i=0; i<15; i++) {
    explosions.push({
      x: x,
      y: y,
      dx: (Math.random()-0.5)*4,
      dy: (Math.random()-0.5)*4,
      radius: Math.random()*3+2,
      color: getRandomColor(),
      life: 20
    });
  }
}

function update() {
  // Ruch gracza
  if(keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
  if(keys['ArrowRight'] && player.x + player.width < canvas.width) player.x += player.speed;
  if(keys[' '] || keys['Space']) shoot();

  // Pociski
  bullets.forEach((b, i) => {
    b.y -= b.speed;
    if(b.y < 0) bullets.splice(i, 1);
  });

  // Przeciwnicy
  enemies.forEach((e, i) => {
    e.y += e.speed;
    e.x += e.dx * 1.5;
    if(e.x < 0 || e.x + e.width > canvas.width) e.dx *= -1;

    if(e.y > canvas.height) {
      enemies.splice(i, 1);
      player.lives--;
      if(player.lives <= 0) resetGame();
    }
  });

  // Kolizje pocisk-przeciwnik
  bullets.forEach((b, bi) => {
    enemies.forEach((e, ei) => {
      if(isColliding(b, e)) {
        createExplosion(e.x + e.width/2, e.y + e.height/2);
        bullets.splice(bi, 1);
        enemies.splice(ei, 1);
        score += 10;

        if(score % 50 === 0) {
          level++;
          enemySpeed += 0.5;
        }
      }
    });
  });

  // Aktualizacja eksplozji
  explosions.forEach((ex, i) => {
    ex.x += ex.dx;
    ex.y += ex.dy;
    ex.life--;
    if(ex.life <= 0) explosions.splice(i, 1);
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Gracz
  ctx.fillStyle = 'lime';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Pociski
  bullets.forEach(b => {
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, b.y, b.width, b.height);
  });

  // Przeciwnicy
  enemies.forEach(e => {
    ctx.fillStyle = e.color;
    ctx.fillRect(e.x, e.y, e.width, e.height);
  });

  // Eksplozje
  explosions.forEach(ex => {
    ctx.fillStyle = ex.color;
    ctx.beginPath();
    ctx.arc(ex.x, ex.y, ex.radius, 0, Math.PI*2);
    ctx.fill();
  });

  // HUD
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText(`Wynik: ${score}`, 10, 30);
  ctx.fillText(`Życia: ${player.lives}`, 10, 60);
  ctx.fillText(`Poziom: ${level}`, 10, 90);
}

function resetGame() {
  alert(`Game Over! Twój wynik: ${score}`);
  score = 0;
  level = 1;
  enemySpeed = 2;
  player.lives = 3;
  bullets = [];
  enemies = [];
  explosions = [];
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

setInterval(spawnEnemy, 1000);
gameLoop();
