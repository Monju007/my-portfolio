/* memory.js — UI integrated */
(() => {
  const grid = document.getElementById("memory-grid");
  const memStart = document.getElementById("mem-start");
  const memOpen = document.getElementById("mem-settings-open");
  const memModal = document.getElementById("mem-settings");
  const memClose = document.getElementById("mem-settings-close");
  const memDiff = document.getElementById("mem-diff");
  const memStatus = document.getElementById("mem-status");
  const memMatchedEl = document.getElementById("mem-matched");

  const POOL = ["🍎", "🍌", "🍇", "🍉", "🍒", "🥝", "🍍", "🥑", "🍑", "🥥"];
  let deck = [],
    flipped = [],
    matched = 0,
    lock = false;

  function startGame() {
    const n = Number(memDiff.value || 8);
    buildDeck(n);
    render();
    memStatus.textContent = "Find pairs!";
    matched = 0;
    memMatchedEl.textContent = matched;
  }

  function buildDeck(n) {
    const chosen = POOL.slice(0)
      .sort(() => Math.random() - 0.5)
      .slice(0, n / 2);
    deck = chosen.concat(chosen).sort(() => Math.random() - 0.5);
  }

  function render() {
    grid.innerHTML = "";
    const cols = Math.sqrt(deck.length);
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    deck.forEach((icon, i) => {
      const card = document.createElement("button");
      card.className = "memory-card panel";
      card.innerHTML = `<div class="inner"><div class="face front">?</div><div class="face back">${icon}</div></div>`;
      card.dataset.idx = i;
      card.addEventListener("click", () => onFlip(card));
      grid.appendChild(card);
    });
  }

  function onFlip(card) {
    if (
      lock ||
      card.classList.contains("flipped") ||
      card.classList.contains("matched")
    )
      return;
    card.classList.add("flipped");
    flipped.push(card);
    if (flipped.length === 2) {
      lock = true;
      const a = flipped[0],
        b = flipped[1];
      const ai = deck[a.dataset.idx],
        bi = deck[b.dataset.idx];
      if (ai === bi) {
        a.classList.add("matched");
        b.classList.add("matched");
        matched += 1;
        memMatchedEl.textContent = matched;
        memStatus.textContent = `Matched ${matched} pair(s)!`;
        flipped = [];
        lock = false;
        if (matched === deck.length / 2)
          memStatus.textContent = "🎉 You matched all!";
      } else {
        setTimeout(() => {
          a.classList.remove("flipped");
          b.classList.remove("flipped");
          flipped = [];
          lock = false;
          memStatus.textContent = "Try again";
        }, 700);
      }
    }
  }

  memStart.addEventListener("click", startGame);
  memOpen.addEventListener("click", () => {
    memModal.classList.add("open");
    memModal.setAttribute("aria-hidden", "false");
  });
  memClose.addEventListener("click", () => {
    memModal.classList.remove("open");
    memModal.setAttribute("aria-hidden", "true");
  });

  // init default
  buildDeck(8);
  render();
})();
