var canvas = document.getElementById("game");
var context = canvas.getContext("2d");

var i, ship, Timer;
var aster = [];
var fire = [];
var expl = [];
var spaceshipSelect = document.getElementById("spaceship-select");
var selectedSpaceship = "none";

let score = 0;
let timer = 100;
let live = 3;
let timerInterval;

var isPaused = false;
let gameRunning = false;

asterimg = new Image();
asterimg.src = "astero.png";

shieldimg = new Image();
shieldimg.src = "shield.png";

fireimg = new Image();
fireimg.src = "fire.png";

explimg = new Image();
explimg.src = "expl222.png";

fon = new Image();
fon.src = "fon.png";

spaceshipSelect.addEventListener("change", function () {
  selectedSpaceship = this.value;

  switch (selectedSpaceship) {
    case "spaceship1":
      shipimg = new Image();
      shipimg.src = "ship01.png";
      break;
    case "spaceship2":
      shipimg = new Image();
      shipimg.src = "ship02.png";
      break;
  }
});

function stopGame() {
  clearInterval(timerInterval);
  gameRunning = false;
}

document.getElementById("start-button").addEventListener("click", function () {
  if (selectedSpaceship != "none") {
    gameRunning = true;
    startGame();
  } else {
    alert("Вы не выбрали космический корабль");
  }
});

document.getElementById("pause-button").addEventListener("click", function () {
  isPaused = !isPaused;
  console.log(isPaused);
  if (isPaused) {
    clearInterval(timerInterval);
    document.getElementById("pause-button").textContent = "Продолжить";
  } else {
    timerInterval = setInterval(updateTimer, 1000);
    document.getElementById("pause-button").textContent = "Пауза";
  }
});

document.addEventListener("keydown", function (event) {
  if (event.code == "Space") {
    event.preventDefault();
    isPaused = !isPaused;
    console.log(isPaused);
    if (isPaused) {
      clearInterval(timerInterval);
      document.getElementById("pause-button").textContent = "Продолжить";
    } else {
      timerInterval = setInterval(updateTimer, 1000);
      document.getElementById("pause-button").textContent = "Пауза";
    }
  }

  if (event.code == "Escape") {
    stopGame();
    document.getElementById("game-screen").style.display = "none";
    document.getElementById("start-screen").style.display = "flex";
  }
});

document.getElementById("exit-button").addEventListener("click", function () {
  stopGame();
  document.getElementById("game-screen").style.display = "none";
  document.getElementById("start-screen").style.display = "flex";
});

function resetGameState() {
  Timer = 0;
  score = 0;
  timer = 100;
  live = 3;
  ship = { x: 300, y: 300, animx: 0, animy: 0 };
  aster = [];
  fire = [];
  expl = [];
  isPaused = false;
  clearInterval(timerInterval);
}

function gameLoop() {
  if (!isPaused && gameRunning) {
    update();
    render();
  }
  if (gameRunning) {
    requestAnimFrame(gameLoop);
  }
}

function gameOver() {
  isPaused = true;
  document.getElementById("game-screen").style.display = "none";

  var gameOverMessage = document.getElementById("game-over-message");
  gameOverMessage.textContent = "Очки: " + score;

  var gameOverScreen = document.getElementById("game-over-screen");
  gameOverScreen.style.display = "flex";

  clearInterval(timerInterval);

  var backToMenuButton = document.getElementById("back-to-menu-button");
  backToMenuButton.addEventListener("click", function () {
    stopGame();
    gameOverScreen.style.display = "none";
    document.getElementById("start-screen").style.display = "flex";
  });
}

function startGame() {
  resetGameState();
  isPaused = false;
  document.getElementById("timer").textContent = "Время: " + timer;
  document.getElementById("score").textContent = "Очки: " + score;
  document.getElementById("lives").textContent = "Жизни: " + live;

  document.getElementById("pause-button").textContent = "Пауза";
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "flex";
  timerInterval = setInterval(updateTimer, 1000);
  init();
  gameLoop();
}

var requestAnimFrame = (function () {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 20);
    }
  );
})();

function init() {
  canvas.addEventListener("mousemove", function (event) {
    var rect = canvas.getBoundingClientRect(),
      root = document.documentElement;

    var mouseX = event.clientX - rect.left - root.scrollLeft;
    var mouseY = event.clientY - rect.top - root.scrollTop;

    var width_canvas = document.getElementById("game").offsetWidth;
    var height_canvas = document.getElementById("game").offsetHeight;

    ship.x = (mouseX * 600) / width_canvas - 25;
    ship.y = (mouseY * 600) / height_canvas - 13;
  });

  Timer = 0;
  ship = { x: 300, y: 300, animx: 0, animy: 0 };
}

function game() {
  update();
  render();
  requestAnimFrame(game);
}

function update() {
  Timer++;

  //спавн астероидов
  if (Timer % 50 == 0) {
    aster.push({
      angle: 0,
      dxangle: Math.random() * 0.2 - 0.1,
      del: 0,
      x: Math.random() * 550,
      y: -50,
      dx: Math.random() * 2 - 1,
      dy: Math.random() * 2 + 1,
    });
  }
  //выстрел
  if (Timer % 30 == 0) {
    fire.push({ x: ship.x + 10, y: ship.y, dx: 0, dy: -5.2 });
    fire.push({ x: ship.x + 10, y: ship.y, dx: 0.5, dy: -5 });
    fire.push({ x: ship.x + 10, y: ship.y, dx: -0.5, dy: -5 });
  }

  //движение астероидов
  for (i in aster) {
    aster[i].x = aster[i].x + aster[i].dx;
    aster[i].y = aster[i].y + aster[i].dy;
    aster[i].angle = aster[i].angle + aster[i].dxangle;

    //граничные условия (коллайдер со стенками)
    if (aster[i].x <= 0 || aster[i].x >= 550) aster[i].dx = -aster[i].dx;
    if (aster[i].y >= 650) aster.splice(i, 1);

    //проверим каждый астероид на столкновение с каждой пулей
    for (let j = 0; j < fire.length; j++) {
      if (fire[j] && aster[i]) {
        // Проверяем, что fire[j] и aster[i] определены
        if (
          Math.abs(aster[i].x + 25 - fire[j].x - 15) < 50 &&
          Math.abs(aster[i].y - fire[j].y) < 25
        ) {
          // Произошло столкновение

          // Спавн взрыва
          expl.push({
            x: aster[i].x - 25,
            y: aster[i].y - 25,
            animx: 0,
            animy: 0,
          });

          updateScore();
          // Помечаем астероид на удаление
          aster[i].del = 1;
          // Удаляем снаряд из массива fire
          fire.splice(j, 1);
          // Уменьшаем индекс j, так как мы удалили элемент из массива
          j--;
          break;
        }
      }
    }
    //удаляем астероиды
    if (aster[i]) {
      if (aster[i].del == 1) aster.splice(i, 1);
    }
  }

  //двигаем пули
  for (i in fire) {
    fire[i].x = fire[i].x + fire[i].dx;
    fire[i].y = fire[i].y + fire[i].dy;

    if (fire[i].y < -30) fire.splice(i, 1);
  }

  //Анимация взрывов
  for (i in expl) {
    expl[i].animx = expl[i].animx + 0.5;
    if (expl[i].animx > 7) {
      expl[i].animy++;
      expl[i].animx = 0;
    }
    if (expl[i].animy > 7) expl.splice(i, 1);
  }

  //столкновение с кораблём
  for (i = 0; i < aster.length; i++) {
    if (
      ship.x + 50 > aster[i].x &&
      ship.x < aster[i].x + 50 &&
      ship.y + 50 > aster[i].y &&
      ship.y < aster[i].y + 50
    ) {
      updateLive();
      aster.splice(i, 1);
      i--;
      if (live <= 0) {
        gameOver();
        return;
      }
    }
  }

  //анимация щита
  ship.animx = ship.animx + 1;
  if (ship.animx > 4) {
    ship.animy++;
    ship.animx = 0;
  }
  if (ship.animy > 3) {
    ship.animx = 0;
    ship.animy = 0;
  }
}

function updateTimer() {
  timer--;
  document.getElementById("timer").textContent = "Время: " + timer;

  if (timer <= 0) {
    clearInterval(timerInterval);
    gameOver();
  }
}

function updateScore() {
  score += 50;
  document.getElementById("score").textContent = "Очки: " + score;
}

function updateLive() {
  live--;
  document.getElementById("lives").textContent = "Жизни: " + live;
}

function render() {
  //очистка холста (не обязательно)
  context.clearRect(0, 0, 600, 600);
  //рисуем фон
  context.drawImage(fon, 0, 0, 600, 600);
  //рисуем пули
  for (i in fire) context.drawImage(fireimg, fire[i].x, fire[i].y, 30, 30);
  //рисуем корабль
  context.drawImage(shipimg, ship.x, ship.y);
  //рисуем щит
  context.drawImage(
    shieldimg,
    192 * Math.floor(ship.animx),
    192 * Math.floor(ship.animy),
    192,
    192,
    ship.x - 25,
    ship.y - 25,
    100,
    100
  );
  //рисуем астероиды
  for (i in aster) {
    //context.drawImage(asterimg, aster[i].x, aster[i].y, 50, 50);
    //вращение астероидов
    context.save();
    context.translate(aster[i].x + 25, aster[i].y + 25);
    context.rotate(aster[i].angle);
    context.drawImage(asterimg, -25, -25, 50, 50);
    context.restore();
    //context.beginPath();
    //context.lineWidth="2";
    //context.strokeStyle="green";
    //context.rect(aster[i].x, aster[i].y, 50, 50);
    //context.stroke();
  }
  //рисуем взрывы
  for (i in expl)
    context.drawImage(
      explimg,
      128 * Math.floor(expl[i].animx),
      128 * Math.floor(expl[i].animy),
      128,
      128,
      expl[i].x,
      expl[i].y,
      100,
      100
    );
}
