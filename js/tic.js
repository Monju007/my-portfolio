/* tic.js — Minimax + UI wiring + sound + vibration */
(() => {
  // DOM
  const boardEl = document.getElementById("tic-board");
  const statusEl = document.getElementById("ttt-status");
  const openSettingsBtn = document.getElementById("open-settings");
  const settingsModal = document.getElementById("settings-modal");
  const closeSettingsBtn = document.getElementById("close-settings");
  const opponentSelect = document.getElementById("opponent-select");
  const soundToggle = document.getElementById("sound-toggle");
  const vibrateToggle = document.getElementById("vibrate-toggle");
  const restartBtn = document.getElementById("btn-restart");
  const resetScoreBtn = document.getElementById("reset-score");

  const scoreXEl = document.getElementById("score-x");
  const scoreOEl = document.getElementById("score-o");
  const scoreDrawEl = document.getElementById("score-draw");

  // game state
  let board = Array(9).fill("");
  let current = "X";
  let running = true;
  let vsAI = true; // default
  let scores = { X: 0, O: 0, D: 0 };

  // sound (simple WebAudio oscillator)
  const audioCtx =
    typeof AudioContext !== "undefined" ? new AudioContext() : null;
  function beep(freq = 800, t = 0.06, type = "sine", vol = 0.06) {
    if (!audioCtx) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + t);
    setTimeout(() => {
      try {
        o.stop();
      } catch (e) {}
    }, t * 1000 + 20);
  }
  function playClick() {
    if (soundToggle.classList.contains("on")) beep(950, 0.05, "triangle", 0.04);
  }
  function playWin() {
    if (soundToggle.classList.contains("on")) {
      beep(700, 0.06, "sine", 0.06);
      setTimeout(() => beep(1100, 0.08, "sine", 0.04), 80);
    }
  }
  function vibrate(ms = 30) {
    if (vibrateToggle.classList.contains("on") && navigator.vibrate)
      navigator.vibrate(ms);
  }

  // wins
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

  function makeBoardUI() {
    boardEl.innerHTML = "";
    for (let i = 0; i < 9; i++) {
      const b = document.createElement("button");
      b.className = "tic-cell";
      b.dataset.i = i;
      b.addEventListener("click", () => onCell(i));
      b.setAttribute("aria-label", `Cell ${i + 1}`);
      boardEl.appendChild(b);
    }
    render();
  }

  function render() {
    const cells = boardEl.querySelectorAll(".tic-cell");
    cells.forEach((c, i) => (c.textContent = board[i]));
  }

  function onCell(i) {
    if (!running || board[i]) return;
    playClick();
    vibrate(20);
    board[i] = current;
    render();
    const winner = checkWinner(board);
    if (winner) return handleWin(winner);
    if (!board.includes("")) {
      handleDraw();
      return;
    }
    current = current === "X" ? "O" : "X";
    statusEl.textContent = `Player ${current}'s turn`;
    if (vsAI && current === "O") {
      // give tiny delay for UX
      setTimeout(() => aiMove(), 160);
    }
  }

  function handleWin(w) {
    running = false;
    statusEl.textContent = `🎉 Player ${w} wins!`;
    highlightWin(w);
    playWin();
    vibrate(120);
    if (w === "X") scores.X++;
    else if (w === "O") scores.O++;
    updateScoreUI();
  }
  function handleDraw() {
    running = false;
    statusEl.textContent = "😐 It's a draw!";
    scores.D++;
    updateScoreUI();
  }

  function highlightWin(winner) {
    for (const line of wins) {
      const [a, b, c] = line;
      if (board[a] === winner && board[b] === winner && board[c] === winner) {
        [a, b, c].forEach((i) => boardEl.children[i].classList.add("win"));
        return;
      }
    }
  }

  function checkWinner(bd) {
    for (const w of wins) {
      const [a, b, c] = w;
      if (bd[a] && bd[a] === bd[b] && bd[a] === bd[c]) return bd[a];
    }
    return null;
  }

  // Minimax (returns {index, score})
  function minimax(newBoard, player) {
    const avail = newBoard
      .map((v, i) => (v === "" ? i : null))
      .filter((v) => v !== null);

    if (checkWinner(newBoard) === "X") return { score: -10 };
    if (checkWinner(newBoard) === "O") return { score: 10 };
    if (avail.length === 0) return { score: 0 };

    const moves = [];
    for (let i = 0; i < avail.length; i++) {
      const idx = avail[i];
      newBoard[idx] = player;
      const result = minimax(newBoard, player === "O" ? "X" : "O");
      moves.push({ index: idx, score: result.score });
      newBoard[idx] = "";
    }
    let best;
    if (player === "O") {
      let bestScore = -Infinity;
      moves.forEach((m) => {
        if (m.score > bestScore) {
          bestScore = m.score;
          best = m;
        }
      });
    } else {
      let bestScore = Infinity;
      moves.forEach((m) => {
        if (m.score < bestScore) {
          bestScore = m.score;
          best = m;
        }
      });
    }
    return best;
  }

  function aiMove() {
    if (!running) return;
    const m = minimax(board.slice(), "O");
    if (m && typeof m.index === "number") {
      board[m.index] = "O";
      render();
    }
    const winner = checkWinner(board);
    if (winner) return handleWin(winner);
    if (!board.includes("")) return handleDraw();
    current = "X";
    statusEl.textContent = `Player ${current}'s turn`;
  }

  // controls
  function restart() {
    board = Array(9).fill("");
    current = "X";
    running = true;
    statusEl.textContent = `Player ${current}'s turn`;
    // remove win highlights
    boardEl
      .querySelectorAll(".tic-cell")
      .forEach((c) => c.classList.remove("win"));
    render();
  }

  function updateScoreUI() {
    scoreXEl.textContent = scores.X;
    scoreOEl.textContent = scores.O;
    scoreDrawEl.textContent = scores.D;
  }

  // settings wiring
  openSettingsBtn.addEventListener("click", () => {
    settingsModal.classList.add("open");
    settingsModal.setAttribute("aria-hidden", "false");
  });
  closeSettingsBtn.addEventListener("click", () => {
    settingsModal.classList.remove("open");
    settingsModal.setAttribute("aria-hidden", "true");
  });

  opponentSelect.addEventListener("change", (e) => {
    vsAI = e.target.value === "ai";
    restart();
  });

  // toggles
  function toggleUI(elem) {
    elem.classList.toggle("on");
  }
  soundToggle.addEventListener("click", () => toggleUI(soundToggle));
  vibrateToggle.addEventListener("click", () => toggleUI(vibrateToggle));

  // restart
  restartBtn.addEventListener("click", () => {
    restart();
    playClick();
  });

  // reset score
  resetScoreBtn.addEventListener("click", () => {
    scores = { X: 0, O: 0, D: 0 };
    updateScoreUI();
    playClick();
  });

  // init
  makeBoardUI();
  updateScoreUI();

  // resume audio context on first gesture
  document.addEventListener(
    "pointerdown",
    () => {
      if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
    },
    { once: true }
  );
})();
