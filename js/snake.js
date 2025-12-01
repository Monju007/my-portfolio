/* snake.js — improved UI & settings */
(() => {
  const canvas = document.getElementById("snake-canvas");
  const startBtn = document.getElementById("snake-start");
  const settingsBtn = document.getElementById("snake-open-settings");
  const closeSettings = document.getElementById("snake-close-settings");
  const settingsModal = document.getElementById("snake-settings");
  const speedRange = document.getElementById("speed-range");
  const wrapModeSelect = document.getElementById("wrap-mode");
  const scoreEl = document.getElementById("snake-score");

  let ctx,
    gridSize = 20,
    cell = 18;
  let snake = [],
    dir = { x: 1, y: 0 },
    food = null,
    loopId = null;
  let speed = Number(speedRange.value),
    wrapMode = "wrap";
  let width = 360,
    height = 360,
    score = 0;

  function resize() {
    const max = Math.min(window.innerWidth - 40, 520);
    width = max;
    height = max;
    canvas.width = width;
    canvas.height = height;
    cell = Math.floor(width / gridSize);
    draw(); // redraw after resize
  }

  function startGame() {
    if (!canvas) return;
    ctx = canvas.getContext("2d");
    snake = [{ x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2) }];
    dir = { x: 1, y: 0 };
    placeFood();
    score = 0;
    updateScore();
    clearInterval(loopId);
    loopId = setInterval(loop, speed);
    // resume audio ctx if needed
    if (window.AudioContext && AudioContext.prototype.state === "suspended")
      AudioContext.resume?.();
  }

  function updateScore() {
    scoreEl.textContent = score;
  }

  function placeFood() {
    let pos;
    do {
      pos = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize),
      };
    } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
    food = pos;
  }

  function draw() {
    // background
    ctx.fillStyle = "#061220";
    ctx.fillRect(0, 0, width, height);
    // food
    ctx.fillStyle = "#ff5d6c";
    roundRect(
      food.x * cell,
      food.y * cell,
      cell,
      cell,
      Math.max(4, cell * 0.12)
    );
    // snake
    ctx.fillStyle = "#0ae6a0";
    snake.forEach((s, i) =>
      roundRect(s.x * cell, s.y * cell, cell, cell, Math.max(4, cell * 0.12))
    );
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();
  }

  function loop() {
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (wrapMode === "wrap") {
      head.x = (head.x + gridSize) % gridSize;
      head.y = (head.y + gridSize) % gridSize;
    } else {
      if (
        head.x < 0 ||
        head.x >= gridSize ||
        head.y < 0 ||
        head.y >= gridSize
      ) {
        gameOver();
        return;
      }
    }
    // collision with self
    if (snake.some((s, i) => i > 0 && s.x === head.x && s.y === head.y)) {
      gameOver();
      return;
    }
    snake.unshift(head);

    // food eaten
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      updateScore();
      placeFood();
      // accelerate slightly with cap
      if (speed > 40) {
        speed = Math.max(40, speed - 6);
        clearInterval(loopId);
        loopId = setInterval(loop, speed);
      }
    } else {
      snake.pop();
    }

    draw();
  }

  function gameOver() {
    clearInterval(loopId);
    alert(`Game Over! Score: ${score}`);
  }

  // input
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" && dir.y === 0) dir = { x: 0, y: -1 };
    if (e.key === "ArrowDown" && dir.y === 0) dir = { x: 0, y: 1 };
    if (e.key === "ArrowLeft" && dir.x === 0) dir = { x: -1, y: 0 };
    if (e.key === "ArrowRight" && dir.x === 0) dir = { x: 1, y: 0 };
  });

  // touch swipe
  let sx = 0,
    sy = 0;
  canvas.addEventListener(
    "touchstart",
    (e) => {
      const t = e.touches[0];
      sx = t.clientX;
      sy = t.clientY;
    },
    { passive: true }
  );
  canvas.addEventListener(
    "touchend",
    (e) => {
      const t = e.changedTouches[0];
      const dx = t.clientX - sx,
        dy = t.clientY - sy;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 20 && dir.x === 0) dir = { x: 1, y: 0 };
        if (dx < -20 && dir.x === 0) dir = { x: -1, y: 0 };
      } else {
        if (dy > 20 && dir.y === 0) dir = { x: 0, y: 1 };
        if (dy < -20 && dir.y === 0) dir = { x: 0, y: -1 };
      }
    },
    { passive: true }
  );

  // hooks
  startBtn.addEventListener("click", () => {
    startGame();
  });
  settingsBtn.addEventListener("click", () => {
    settingsModal.classList.add("open");
    settingsModal.setAttribute("aria-hidden", "false");
  });
  closeSettings.addEventListener("click", () => {
    settingsModal.classList.remove("open");
    settingsModal.setAttribute("aria-hidden", "true");
  });
  speedRange.addEventListener("input", (e) => {
    speed = Number(e.target.value);
    if (loopId) {
      clearInterval(loopId);
      loopId = setInterval(loop, speed);
    }
  });
  wrapModeSelect.addEventListener("change", (e) => (wrapMode = e.target.value));

  window.addEventListener("resize", () => {
    clearTimeout(window._snakeResize);
    window._snakeResize = setTimeout(resize, 120);
  });

  // initial setup
  resize();
})();
