const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const player = { x: 220, y: 550, width: 60, height: 20, speed: 5 };
let bullets = [];
let enemies = [];
let score = 0;

const keys = {};
document.addEventListener('keydown', (e) => { keys[e.key] = true; });
document.addEventListener('keyup', (e) => { keys[e.key] = false; });

function shoot() {
  bullets.push({ x: player.x + player.width/2 - 2.5, y: player.y, width: 5, height: 10, speed: 7 });
}

function spawnEnemy() {
  const x = Math.random() * (canvas.width - 40);
  enemies.push({ x: x, y: 0, width: 40, height: 20, speed: 2 });
}

function isColliding(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x &&
         a.y < b.y + b.height && a.y + a.height > b.y;
}

function update() {
  if(keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
  if(keys['ArrowRight'] && player.x + player.width < canvas.width) player.x += player.speed;
  if(keys[' '] || keys['Space']) shoot();

  bullets.forEach((b, i) => {
    b.y -= b.speed;
    if(b.y < 0) bullets.splice(i, 1);
  });

  enemies.forEach((e, i) => {
    e.y += e.speed;
    if(e.y > canvas.height) enemies.splice(i, 1);
  });

  bullets.forEach((b, bi) => {
    enemies.forEach((e, ei) => {
      if(isColliding(b, e)) {
        bullets.splice(bi, 1);
        enemies.splice(ei, 1);
        score += 10;
      }
    });
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'lime';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  ctx.fillStyle = 'yellow';
  bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));

  ctx.fillStyle = 'red';
  enemies.forEach(e => ctx.fillRect(e.x, e.y, e.width, e.height));

  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText('Wynik: ' + score, 10, 30);
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

setInterval(spawnEnemy, 1500);
gameLoop();
