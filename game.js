const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let player = {
    x: 280,
    y: 360,
    width: 40,
    height: 20,
    speed: 5
};

let bullets = [];
let enemies = [];
let enemySpawnTimer = 0;

document.addEventListener("keydown", movePlayer);
document.addEventListener("keyup", stopPlayer);
document.addEventListener("click", shoot);

let left = false;
let right = false;

function movePlayer(e) {
    if (e.key === "ArrowLeft") left = true;
    if (e.key === "ArrowRight") right = true;
}

function stopPlayer(e) {
    if (e.key === "ArrowLeft") left = false;
    if (e.key === "ArrowRight") right = false;
}

function shoot() {
    bullets.push({
        x: player.x + player.width/2 - 2,
        y: player.y,
        width: 4,
        height: 10,
        speed: 7
    });
}

function spawnEnemy() {
    enemies.push({
        x: Math.random() * 560,
        y: -20,
        width: 40,
        height: 20,
        speed: 2
    });
}

function update() {
    if (left && player.x > 0) player.x -= player.speed;
    if (right && player.x < canvas.width - player.width) player.x += player.speed;

    bullets.forEach((b, i) => {
        b.y -= b.speed;
        if (b.y < 0) bullets.splice(i, 1);
    });

    enemies.forEach((e, i) => {
        e.y += e.speed;
        if (e.y > canvas.height) enemies.splice(i, 1);

        bullets.forEach((b, j) => {
            if (
                b.x < e.x + e.width &&
                b.x + b.width > e.x &&
                b.y < e.y + e.height &&
                b.y + b.height > e.y
            ) {
                enemies.splice(i, 1);
                bullets.splice(j, 1);
            }
        });
    });

    enemySpawnTimer++;
    if (enemySpawnTimer > 50) {
        spawnEnemy();
        enemySpawnTimer = 0;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "lime";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    ctx.fillStyle = "yellow";
    bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));

    ctx.fillStyle = "red";
    enemies.forEach(e => ctx.fillRect(e.x, e.y, e.width, e.height));
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
