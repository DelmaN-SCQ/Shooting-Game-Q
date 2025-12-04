const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = "menu";
let difficulty = "easy";
let score = 0;
let level = 1;
let enemySpawnInterval = 1500;

const player = { x: 270, y: 550, size: 40, speed: 5, maxHp: 100, hp: 100, powerUp: null, powerTime: 0 };
let bullets = [];
let enemies = [];
let enemyBullets = [];
let shields = [];
let explosions = [];
let stars = [];
let comboMultiplier = 1;

const keys = {};
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

// --------- Utworzenie tła gwiezdnego ---------
for(let i=0;i<100;i++){
  stars.push({x: Math.random()*canvas.width, y: Math.random()*canvas.height, size: Math.random()*2+1, speed: Math.random()*1+0.5});
}

// --------- Pociski gracza ---------
function shoot() {
  if(keys[' '] || keys['Space']) {
    if(!keys.shootCooldown) {
      let bulletSize = player.powerUp === 'double' ? 12 : 8;
      let positions = player.powerUp === 'double' ? [-6, 6] : [0];
      positions.forEach(offset => {
        bullets.push({ x: player.x + player.size/2 - bulletSize/2 + offset, y: player.y, size: bulletSize, speed: 8, color: 'yellow' });
      });
      keys.shootCooldown = true;
      setTimeout(() => keys.shootCooldown = false, player.powerUp === 'rapid' ? 50 : 150);
    }
  }
}

// --------- Przeciwnicy ---------
function spawnEnemy() {
  const size = 40;
  const x = Math.random() * (canvas.width - size);
  const hp = Math.floor(Math.random() * 101) + 50;
  const speed = difficulty === "easy" ? 2 + level*0.2 : 4 + level*0.3;
  const shootCooldown = Math.floor(Math.random() * 180) + 120;
  const pattern = Math.random() < 0.5 ? 'straight' : 'wave';
  enemies.push({ x, y: 0, size, speed, hp, maxHp: hp, shootCooldown, pattern, step: 0 });
}

// --------- Pociski przeciwników ---------
function enemyShoot(e) {
  if(enemyBullets.length < 10) {
    enemyBullets.push({ x: e.x + e.size/2 - 4, y: e.y + e.size, size: 8, speed: 4, color: 'red' });
  }
}

// --------- Tarcze ---------
function spawnShield(x, y) {
  shields.push({ x, y, size: 15 });
}

// --------- Eksplozje ---------
function spawnExplosion(x, y) {
  explosions.push({ x, y, radius: 0, max: 20 });
}

// --------- Kolizje ---------
function isColliding(a, b) {
  return a.x < b.x + b.size && a.x + a.size > b.x &&
         a.y < b.y + b.size && a.y + a.size > b.y;
}
function isCollidingCircle(player, shield) {
  const dx = (player.x + player.size/2) - (shield.x + shield.size/2);
  const dy = (player.y + player.size/2) - (shield.y + shield.size/2);
  const distance = Math.sqrt(dx*dx + dy*dy);
  return distance < player.size/2 + shield.size/2;
}

// --------- Power-ups ---------
function spawnPowerUp(x, y) {
  const types = ['rapid', 'double', 'shield'];
  const type = types[Math.floor(Math.random()*types.length)];
  shields.push({ x, y, size: 15, type });
}

// --------- Update gry ---------
function update() {
  if(gameState !== "playing") return;

  // Tło gwiazd
  stars.forEach(s => {
    s.y += s.speed;
    if(s.y > canvas.height) s.y = 0;
  });

  // Ruch gracza
  if(keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
  if(keys['ArrowRight'] && player.x + player.size < canvas.width) player.x += player.speed;
  shoot();

  // Pociski gracza
  bullets.forEach((b, i) => {
    b.y -= b.speed;
    if(b.y < 0) bullets.splice(i,1);
  });

  // Przeciwnicy
  enemies.forEach((e, i) => {
    e.step++;
    if(e.pattern === 'wave') e.x += Math.sin(e.step*0.05)*2;
    e.y += e.speed;
    e.shootCooldown--;
    if(e.shootCooldown <= 0) {
      enemyShoot(e);
      e.shootCooldown = Math.floor(Math.random() * 180) + 120;
    }

    if(isColliding(e, player)) {
      player.hp -= 20;
      enemies.splice(i,1);
      spawnExplosion(e.x+e.size/2, e.y+e.size/2);
      if(player.hp <= 0) gameState = "gameover";
    }
  });

  // Pociski przeciwników
  enemyBullets.forEach((b,i) => {
    b.y += b.speed;
    if(b.y > canvas.height) enemyBullets.splice(i,1);
    if(isColliding(b, player)) {
      enemyBullets.splice(i,1);
      player.hp -= 10;
      if(player.hp <= 0) gameState = "gameover";
    }
  });

  // Pocisk-przeciwnik
  bullets.forEach((b,bi) => {
    enemies.forEach((e,ei) => {
      if(isColliding(b,e)) {
        bullets.splice(bi,1);
        e.hp -= 20;
        if(e.hp <=0) {
          score += 10*comboMultiplier;
          comboMultiplier++;
          spawnExplosion(e.x+e.size/2,e.y+e.size/2);
          if(Math.random()<0.3) spawnPowerUp(e.x,e.y);
          enemies.splice(ei,1);
        }
      }
    });
  });

  // Reset combo co kilka sekund
  if(comboMultiplier>1) setTimeout(()=>comboMultiplier=1,2000);

  // Tarczki i power-ups
  shields.forEach((s,i)=>{
    if(s.type){
      if(isCollidingCircle(player,s)){
        if(s.type==='shield') player.hp+=20;
        else player.powerUp=s.type;
        player.powerTime=500;
        if(player.hp>player.maxHp) player.hp=player.maxHp;
        shields.splice(i,1);
      }
    } else if(isCollidingCircle(player,s)){
      player.hp+=20;
      if(player.hp>player.maxHp) player.hp=player.maxHp;
      shields.splice(i,1);
    }
  });

  // PowerUp czas
  if(player.powerTime>0) player.powerTime--;
  else player.powerUp=null;

  // Dynamiczny poziom
  if(score>=level*50){
    level++;
    if(enemySpawnInterval>500) enemySpawnInterval-=100;
  }

  // Eksplozje
  explosions.forEach((exp,i)=>{
    exp.radius++;
    if(exp.radius>exp.max) explosions.splice(i,1);
  });
}

// --------- Draw ---------
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  if(gameState==='menu'){
    ctx.fillStyle='white';
    ctx.font='30px Arial';
    ctx.fillText("Wybierz trudność:",150,200);
    ctx.fillStyle='lime';
    ctx.fillText("Łatwy - E",150,250);
    ctx.fillStyle='red';
    ctx.fillText("Trudny - T",150,300);
    return;
  }

  // Tło gwiazd
  stars.forEach(s=>{
    ctx.fillStyle='white';
    ctx.fillRect(s.x,s.y,s.size,s.size);
  });

  // Gracz
  ctx.fillStyle='lime';
  ctx.fillRect(player.x,player.y,player.size,player.size);
  ctx.fillStyle='red';
  ctx.fillRect(player.x,player.y-10,player.size,5);
  ctx.fillStyle='green';
  ctx.fillRect(player.x,player.y-10,player.size*(player.hp/player.maxHp),5);

  // Pociski gracza
  bullets.forEach(b=>{ctx.fillStyle=b.color;ctx.fillRect(b.x,b.y,b.size,b.size);});

  // Przeciwnicy
  enemies.forEach(e=>{
    ctx.fillStyle='red';
    ctx.fillRect(e.x,e.y,e.size,e.size);
    ctx.fillStyle='green';
    ctx.fillRect(e.x,e.y-5,e.size*(e.hp/e.maxHp),3);
  });

  // Pociski przeciwników
  enemyBullets.forEach(b=>{ctx.fillStyle=b.color;ctx.fillRect(b.x,b.y,b.size,b.size);});

  // Tarczki i powerups
  shields.forEach(s=>{
    ctx.fillStyle = s.type ? (s.type==='shield'?'cyan':'orange'):'cyan';
    ctx.beginPath();
    ctx.arc(s.x+s.size/2,s.y+s.size/2,s.size/2,0,Math.PI*2);
    ctx.fill();
  });

  // Eksplozje
  explosions.forEach(exp=>{
    ctx.fillStyle='rgba(255,165,0,'+(1-exp.radius/exp.max)+')';
    ctx.beginPath();
    ctx.arc(exp.x,exp.y,exp.radius,0,Math.PI*2);
    ctx.fill();
  });

  // HUD
  ctx.fillStyle='white';
  ctx.font='20px Arial';
  ctx.fillText(`Wynik: ${score}`,10,20);
  ctx.fillText(`Poziom: ${level}`,500-100,20);
  if(player.powerUp) ctx.fillText(`Power: ${player.powerUp}`,10,50);

  if(gameState==='gameover'){
    ctx.fillStyle='white';
    ctx.font='40px Arial';
    ctx.fillText("Koniec gry!",200,300);
    ctx.font='20px Arial';
    ctx.fillText("Naciśnij R, aby zagrać ponownie",150,350);
  }
}

// --------- Game Loop ---------
function gameLoop(){
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// --------- Menu i restart ---------
document.addEventListener('keydown',(e)=>{
  if(gameState==='menu'){
    if(e.key.toLowerCase()==='e'){difficulty='easy';gameState='playing';}
    if(e.key.toLowerCase()==='t'){difficulty='hard';gameState='playing';}
  }
  if(gameState==='gameover' && e.key.toLowerCase()==='r'){
    player.hp=player.maxHp; player.x=270; bullets=[]; enemies=[]; enemyBullets=[]; shields=[]; explosions=[]; score=0; level=1; enemySpawnInterval=1500; comboMultiplier=1; gameState='menu';
  }
});

// --------- Dynamiczny spawner przeciwników ---------
function enemySpawner(){if(gameState==='playing') spawnEnemy(); setTimeout(enemySpawner,enemySpawnInterval);}
enemySpawner();

gameLoop();
