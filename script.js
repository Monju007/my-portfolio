// script.js — nav, theme, active link, emailjs, slider, lightbox, reveal
document.addEventListener("DOMContentLoaded", () => {
  /* NAV MENU */
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = navLinks.classList.toggle("show");
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // close menu on outside click
    document.addEventListener("click", (e) => {
      if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
        navLinks.classList.remove("show");
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });

    // close when link clicked (mobile)
    navLinks.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        navLinks.classList.remove("show");
        menuToggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* THEME (dark mode) */
  const themeToggle = document.getElementById("theme-toggle");
  const themeKey = "site-theme";
  function applyTheme(name) {
    if (name === "dark") document.body.classList.add("dark");
    else document.body.classList.remove("dark");
    if (themeToggle) themeToggle.textContent = name === "dark" ? "☀️" : "🌙";
  }
  const saved =
    localStorage.getItem(themeKey) ||
    (window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light");
  applyTheme(saved);
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const next = document.body.classList.contains("dark") ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem(themeKey, next);
    });
  }

  /* ACTIVE NAV LINK */
  const current = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === current) a.classList.add("active-link");
  });

  /* EMAILJS CONTACT FORM */
  const contactForm = document.getElementById("contact-form");
  if (window.emailjs && typeof emailjs.init === "function") {
    // keep your public key or replace with your own
    emailjs.init("HlSZtObBKTuKIS-1g");
  }
  if (contactForm && window.emailjs) {
    const statusEl = document.getElementById("form-status");
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      statusEl.textContent = "Sending...";
      emailjs.sendForm("service_jvisxob", "template_1qvxn0n", contactForm).then(
        () => {
          statusEl.textContent = "✅ Message sent. Thank you!";
          contactForm.reset();
          setTimeout(() => (statusEl.textContent = ""), 5000);
        },
        (err) => {
          console.error("EmailJS error:", err);
          statusEl.textContent = "❌ Failed to send. Try again later.";
        }
      );
    });
  }

  /* CERTIFICATES SLIDER & LIGHTBOX */
  const slideTrack = document.getElementById("slide-track");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxClose = document.getElementById("lightbox-close");

  if (slideTrack) {
    document.querySelectorAll(".slide img").forEach((img) => {
      img.style.cursor = "zoom-in";
      img.addEventListener("click", () => {
        if (!lightbox || !lightboxImg) return;
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || "Certificate";
        lightbox.style.display = "flex";
        lightbox.setAttribute("aria-hidden", "false");
      });
    });
  }

  if (lightboxClose) {
    lightboxClose.addEventListener("click", () => {
      lightbox.style.display = "none";
      lightbox.setAttribute("aria-hidden", "true");
    });
  }
  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) {
        lightbox.style.display = "none";
        lightbox.setAttribute("aria-hidden", "true");
      }
    });
    // keyboard: Esc to close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (lightbox.style.display === "flex") {
          lightbox.style.display = "none";
          lightbox.setAttribute("aria-hidden", "true");
        }
      }
    });
  }

  /* REVEAL ON SCROLL */
  const reveals = document.querySelectorAll(".page, .card, .intro, .hero");
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("reveal");
      });
    },
    { threshold: 0.08 }
  );
  reveals.forEach((r) => obs.observe(r));
});
// CV: animate skill bars & reveal cv-cards when visible
(function () {
  const animateOnce = new Set();

  function animateProgress(elem) {
    const bar = elem.querySelector(".progress-bar");
    if (!bar) return;
    const value = Number(bar.dataset.value || 0);
    // guard
    if (isNaN(value)) return;
    // set with small delay for nicer timing
    requestAnimationFrame(() => {
      bar.style.width = value + "%";
    });
  }

  function revealObserverCallback(entries, obs) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal");
        // animate progress bars inside this card (only once)
        entry.target.querySelectorAll(".progress-bar").forEach((pb) => {
          if (!animateOnce.has(pb)) {
            const v = pb.dataset.value || "0";
            pb.style.width = "0%";
            // small timeout to stagger multiple bars
            setTimeout(() => {
              pb.style.width = v + "%";
            }, 120);
            animateOnce.add(pb);
          }
        });
        // also check for global skill bars outside cards
        entry.target.querySelectorAll(".progress-bar.global").forEach((pb) => {
          if (!animateOnce.has(pb)) {
            pb.style.width = (pb.dataset.value || "0") + "%";
            animateOnce.add(pb);
          }
        });
        obs.unobserve(entry.target);
      }
    });
  }

  // observe every .cv-card for reveal and skill animation
  const observer = new IntersectionObserver(revealObserverCallback, {
    threshold: 0.12,
  });
  document
    .querySelectorAll(".cv-card")
    .forEach((card) => observer.observe(card));

  // also in case there are standalone skills outside .cv-card
  document.querySelectorAll(".progress-bar").forEach((pb) => {
    // if progress bar already has inline width (older pages), leave it
    if (pb.style.width && pb.style.width !== "0%") return;
    // set initial 0
    pb.style.width = "0%";
  });
})();
/* =======================================================
   MOBILE GLASS ANIMATION HANDLER
   ======================================================= */
if (window.innerWidth <= 768) {
  const glassItems = document.querySelectorAll(".glass-mobile-anim");

  const glassObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("show");
      });
    },
    { threshold: 0.12 }
  );

  glassItems.forEach((el) => glassObs.observe(el));
}

/* games.js
   Modular, responsive, touch-optimized game logic
   TicTacToe, RockPaperScissors, Memory, Snake
   Author: assistant (for your portfolio)
*/

(() => {
  // Helper: select
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ------------------------------
     TAB SWITCHING
  -------------------------------*/
  function initTabs() {
    const tabs = $$(".game-tab");
    const games = $$(".game");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        tabs.forEach((t) => t.setAttribute("aria-selected", "false"));
        tab.setAttribute("aria-selected", "true");

        const id = tab.dataset.game;
        games.forEach((g) => g.classList.remove("game-active"));
        const active = document.getElementById(id);
        if (active) active.classList.add("game-active");

        // pause snake loop when not active
        if (id !== "snake") Snake.pause();
        else Snake.resume();
      });
    });
  }

  /* ============================
     TIC TAC TOE (Responsive)
     ============================ */
  const Tic = (() => {
    const container = $("#tic-board-container");
    const status = $("#tic-status");
    const restartBtn = $("#tic-restart");
    const aiBtn = $("#tic-ai");

    let board = Array(9).fill("");
    let current = "X";
    let running = true;
    let vsAI = false;

    const wins = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    function createBoard() {
      container.innerHTML = "";
      // board size responsive: choose smaller of container width
      const size = Math.min(380, Math.floor(container.clientWidth));
      const cellSize = Math.floor(size / 3) - 6; // gap accounted
      const boardEl = document.createElement("div");
      boardEl.className = "tic-board";
      boardEl.style.width = `${cellSize * 3 + 12}px`;

      for (let i = 0; i < 9; i++) {
        const cell = document.createElement("button");
        cell.className = "tic-cell";
        cell.dataset.index = i;
        cell.style.width = `${cellSize}px`;
        cell.style.height = `${cellSize}px`;
        cell.setAttribute("aria-label", `Cell ${i + 1}`);
        cell.addEventListener("click", onCell);
        boardEl.appendChild(cell);
      }
      container.appendChild(boardEl);
    }

    function onCell(e) {
      const idx = Number(e.currentTarget.dataset.index);
      if (!running || board[idx]) return;
      playMove(idx, current);
      if (vsAI && running) {
        // small delay for AI
        setTimeout(() => aiMove(), 250);
      }
    }

    function updateUI() {
      const cells = $$(".tic-cell", container);
      cells.forEach((c, i) => {
        c.textContent = board[i];
      });
    }

    function playMove(i, player) {
      if (board[i] || !running) return;
      board[i] = player;
      updateUI();
      const winner = checkWinner();
      if (winner) {
        status.textContent = `🎉 Player ${winner} wins!`;
        running = false;
        return;
      }
      if (!board.includes("")) {
        status.textContent = "😐 It's a draw!";
        running = false;
        return;
      }
      current = player === "X" ? "O" : "X";
      status.textContent = `Player ${current}'s turn`;
    }

    function checkWinner() {
      for (const w of wins) {
        const [a, b, c] = w;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
          return board[a];
        }
      }
      return null;
    }

    // simple random AI (can be improved later)
    function aiMove() {
      const empty = board
        .map((v, i) => (v === "" ? i : -1))
        .filter((i) => i !== -1);
      if (!empty.length) return;
      // pick center if available
      if (empty.includes(4)) {
        playMove(4, "O");
        return;
      }
      const choice = empty[Math.floor(Math.random() * empty.length)];
      playMove(choice, "O");
    }

    function restart() {
      board = Array(9).fill("");
      current = "X";
      running = true;
      vsAI = false;
      status.textContent = "Player X's turn";
      updateUI();
    }

    function toggleAI() {
      vsAI = !vsAI;
      aiBtn.textContent = vsAI ? "Play vs Human" : "Play vs AI";
      if (vsAI && current === "O") setTimeout(aiMove, 300);
    }

    function resizeHandler() {
      // rebuild board to recalc cell sizes
      const cellsExist = $$(".tic-cell", container).length;
      if (cellsExist) createBoard(), updateUI();
      else createBoard();
    }

    function init() {
      createBoard();
      window.addEventListener("resize", () => {
        // throttle
        clearTimeout(window.ticResize);
        window.ticResize = setTimeout(resizeHandler, 150);
      });
      restartBtn.addEventListener("click", restart);
      aiBtn.addEventListener("click", toggleAI);
    }

    return { init, restart };
  })();

  /* ============================
     ROCK PAPER SCISSORS
     ============================ */
  const RPS = (() => {
    const buttons = $$(".rps-btn");
    const result = $("#rps-result");
    const resetBtn = $("#rps-reset");

    const options = ["rock", "paper", "scissors"];

    function aiChoice() {
      return options[Math.floor(Math.random() * 3)];
    }

    function decide(player, ai) {
      if (player === ai) return "draw";
      if (
        (player === "rock" && ai === "scissors") ||
        (player === "paper" && ai === "rock") ||
        (player === "scissors" && ai === "paper")
      )
        return "win";
      return "lose";
    }

    function onClick(e) {
      const player = e.currentTarget.dataset.choice;
      const ai = aiChoice();
      const r = decide(player, ai);
      if (r === "draw") result.textContent = `😐 Draw — both chose ${player}`;
      else if (r === "win")
        result.textContent = `🎉 You win — ${player} beats ${ai}`;
      else result.textContent = `💀 You lose — ${ai} beats ${player}`;
    }

    function reset() {
      result.textContent = "";
    }

    function init() {
      buttons.forEach((b) => b.addEventListener("click", onClick));
      if (resetBtn) resetBtn.addEventListener("click", reset);
    }

    return { init };
  })();

  /* ============================
     MEMORY MATCH GAME
     Responsive grid + mobile-touch
     ============================ */
  const Memory = (() => {
    const grid = $("#memory-grid");
    const status = $("#memory-status");
    const resetBtn = $("#memory-reset");

    let icons = [];
    let flipped = [];
    let matched = 0;
    let deckSize = 8; // number of cards (must be even)

    // set of simple icons (emoji) — keep lightweight
    const POOL = ["🐱", "🐶", "🐸", "🐵", "🦊", "🦁", "🐻", "🐷", "🐮", "🐼"];

    function buildDeck() {
      // choose deckSize/2 unique icons
      const chosen = POOL.slice(0)
        .sort(() => 0.5 - Math.random())
        .slice(0, deckSize / 2);
      icons = chosen.concat(chosen).sort(() => 0.5 - Math.random());
    }

    function render() {
      grid.innerHTML = "";
      // adapt columns by width
      const cols = window.innerWidth <= 420 ? 3 : 4;
      grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

      icons.forEach((icon, i) => {
        const card = document.createElement("button");
        card.className = "memory-card";
        card.dataset.icon = icon;
        card.dataset.index = i;
        card.innerHTML = `<span class="mem-face">?</span>`;
        card.addEventListener("click", onFlip);
        grid.appendChild(card);
      });
      matched = 0;
      flipped = [];
      status.textContent = "";
    }

    function onFlip(e) {
      const card = e.currentTarget;
      if (
        card.classList.contains("matched") ||
        flipped.includes(card) ||
        flipped.length === 2
      )
        return;
      revealCard(card);
      flipped.push(card);

      if (flipped.length === 2) {
        const a = flipped[0],
          b = flipped[1];
        if (a.dataset.icon === b.dataset.icon) {
          a.classList.add("matched");
          b.classList.add("matched");
          matched += 2;
          flipped = [];
          if (matched === icons.length)
            status.textContent = "🎉 You matched all cards!";
        } else {
          setTimeout(() => {
            hideCard(a);
            hideCard(b);
            flipped = [];
          }, 600);
        }
      }
    }

    function revealCard(card) {
      card.innerHTML = `<span class="mem-face">${card.dataset.icon}</span>`;
    }
    function hideCard(card) {
      card.innerHTML = `<span class="mem-face">?</span>`;
    }

    function restart() {
      buildDeck();
      render();
    }

    function init() {
      deckSize = window.innerWidth <= 420 ? 6 : 8;
      buildDeck();
      render();
      resetBtn && resetBtn.addEventListener("click", restart);
      window.addEventListener("resize", () => {
        clearTimeout(window.memResize);
        window.memResize = setTimeout(() => {
          deckSize = window.innerWidth <= 420 ? 6 : 8;
          buildDeck();
          render();
        }, 200);
      });
    }

    return { init, restart };
  })();

  /* ============================
     SNAKE (Canvas) — responsive + touch
     ============================ */
  const Snake = (() => {
    const canvas = $("#snake-canvas");
    const ctx = canvas.getContext("2d");

    // logical grid size (number of cells)
    let gridSize = 20;
    let cell = 15; // pixel size (calculated)
    let snake = [];
    let dir = { x: 1, y: 0 }; // initial right
    let food = null;
    let running = true;
    let speed = 120; // ms per frame
    let loopId = null;
    let lastMoveTime = 0;

    // resize canvas to container width - keep square
    function resizeCanvas() {
      const wrap = canvas.parentElement;
      const max = Math.min(Math.max(240, wrap.clientWidth - 20), 420);
      canvas.width = max;
      canvas.height = max;
      // choose gridSize so cell size is integer
      gridSize = window.innerWidth <= 420 ? 18 : 20;
      cell = Math.floor(canvas.width / gridSize);
      restart();
    }

    function restart() {
      snake = [{ x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2) }];
      dir = { x: 1, y: 0 };
      placeFood();
      running = true;
      speed = 120;
      if (loopId) clearInterval(loopId);
      loopId = setInterval(loop, speed);
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
      ctx.fillStyle = getComputedStyle(document.body).backgroundColor || "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // draw food
      ctx.fillStyle = "#ffb703";
      roundRect(
        ctx,
        food.x * cell,
        food.y * cell,
        cell,
        cell,
        Math.max(2, cell * 0.12)
      );
      // draw snake
      ctx.fillStyle = "#0a84ff";
      snake.forEach((p, i) =>
        roundRect(
          ctx,
          p.x * cell,
          p.y * cell,
          cell,
          cell,
          Math.max(2, cell * 0.12)
        )
      );
    }

    // small rounded rect helper
    function roundRect(ctx, x, y, w, h, r) {
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
      // move snake head
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      // wall detection: wrap-around for forgiving gameplay
      head.x = (head.x + gridSize) % gridSize;
      head.y = (head.y + gridSize) % gridSize;

      // self collision -> reset (simple)
      if (snake.some((s, i) => i > 0 && s.x === head.x && s.y === head.y)) {
        // reset snake
        restart();
        return;
      }

      snake.unshift(head);

      // eat food
      if (head.x === food.x && head.y === food.y) {
        placeFood();
        // speed up slightly
        if (speed > 50) {
          speed = Math.max(50, speed - 5);
          clearInterval(loopId);
          loopId = setInterval(loop, speed);
        }
      } else {
        snake.pop();
      }

      draw();
    }

    // keyboard controls
    function handleKey(e) {
      if (e.key === "ArrowUp" && dir.y === 0) {
        dir = { x: 0, y: -1 };
      } else if (e.key === "ArrowDown" && dir.y === 0) {
        dir = { x: 0, y: 1 };
      } else if (e.key === "ArrowLeft" && dir.x === 0) {
        dir = { x: -1, y: 0 };
      } else if (e.key === "ArrowRight" && dir.x === 0) {
        dir = { x: 1, y: 0 };
      }
    }

    // touch (swipe) controls (basic)
    function initTouchControls() {
      let startX = 0,
        startY = 0;
      const threshold = 20;

      canvas.addEventListener("touchstart", (e) => {
        const t = e.touches[0];
        startX = t.clientX;
        startY = t.clientY;
      });

      canvas.addEventListener("touchend", (e) => {
        const t = e.changedTouches[0];
        const dx = t.clientX - startX;
        const dy = t.clientY - startY;
        if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;
        if (Math.abs(dx) > Math.abs(dy)) {
          // horizontal
          if (dx > 0 && dir.x === 0) dir = { x: 1, y: 0 };
          else if (dx < 0 && dir.x === 0) dir = { x: -1, y: 0 };
        } else {
          // vertical
          if (dy > 0 && dir.y === 0) dir = { x: 0, y: 1 };
          else if (dy < 0 && dir.y === 0) dir = { x: 0, y: -1 };
        }
      });
    }

    function pause() {
      if (loopId) clearInterval(loopId);
      loopId = null;
    }
    function resume() {
      if (!loopId) loopId = setInterval(loop, speed);
    }

    function init() {
      // responsive canvas sizing
      const resize = () => {
        clearInterval(loopId);
        resizeCanvas();
      };
      window.addEventListener("resize", () => {
        clearTimeout(window.snakeResize);
        window.snakeResize = setTimeout(resize, 180);
      });
      // keyboard, touch, restart
      document.addEventListener("keydown", handleKey);
      initTouchControls();

      // restart button
      const restartBtn = $("#snake-reset");
      restartBtn && restartBtn.addEventListener("click", restart);

      // initial sizing & start loop
      resizeCanvas();
    }

    return { init, pause, resume };
  })();

  /* ---------------------------
     INIT ALL
  ----------------------------*/
  function initAll() {
    initTabs();
    Tic.init();
    RPS.init();
    Memory.init();
    Snake.init();
  }

  // run when DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }
})();
