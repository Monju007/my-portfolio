// js/launcher.js
// Game launcher interactivity: ripple animation, keyboard/tap, sounds, last-play tracking

(() => {
  const tiles = Array.from(document.querySelectorAll(".launcher-tile"));
  const audioCtx =
    typeof AudioContext !== "undefined" ? new AudioContext() : null;
  const lastKey = "launcher-last-play";

  /* ---------- SOUND helpers (WebAudio) ---------- */
  function beep(freq = 440, type = "sine", dur = 0.08, gain = 0.08) {
    if (!audioCtx) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    setTimeout(() => {
      try {
        o.stop();
      } catch (e) {}
    }, dur * 1000 + 10);
  }

  function clickSound() {
    beep(880, "triangle", 0.08, 0.06);
  }
  function hoverSound() {
    beep(1200, "sine", 0.04, 0.02);
  }
  function successSound() {
    beep(700, "sine", 0.06, 0.06);
    setTimeout(() => beep(960, "sine", 0.09, 0.04), 80);
  }

  /* ---------- ripple + launch ---------- */
  function addRipple(tile, x, y) {
    const rect = tile.getBoundingClientRect();
    const rx = x - rect.left;
    const ry = y - rect.top;
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.left = `${rx}px`;
    ripple.style.top = `${ry}px`;
    tile.appendChild(ripple);
    requestAnimationFrame(() => {
      ripple.style.transform = "translate(-50%,-50%) scale(12)";
      ripple.style.opacity = "0";
    });
    setTimeout(() => ripple.remove(), 700);
  }

  function openGame(tile) {
    const target = tile.dataset.target;
    if (!target) return;
    // animate tile quickly, play sound, save last-played
    clickSound();
    tile.classList.add("playing");
    // small scale 'press' effect
    tile.style.transform = "scale(0.98)";
    setTimeout(() => (tile.style.transform = ""), 160);

    // mark last played in localStorage
    localStorage.setItem(lastKey, target);
    showBadges(); // update badges

    // small delay for UX to let sound/ripple run
    setTimeout(() => {
      // navigate
      window.location.href = target;
    }, 220);
  }

  /* ---------- badges (last played) ---------- */
  function showBadges() {
    const last = localStorage.getItem(lastKey);
    tiles.forEach((tile) => {
      // remove any existing badge
      const existing = tile.querySelector(".tile-badge");
      if (existing) existing.remove();
      if (tile.dataset.target === last) {
        const b = document.createElement("span");
        b.className = "tile-badge";
        b.textContent = "Last played";
        tile.appendChild(b);
      }
    });
  }

  /* ---------- event wiring ---------- */
  tiles.forEach((tile) => {
    // mouse / pointer
    tile.addEventListener("pointerenter", (e) => {
      hoverSound();
      tile.classList.add("hovered");
    });
    tile.addEventListener("pointerleave", () => {
      tile.classList.remove("hovered");
    });

    // keyboard activation (enter/space)
    tile.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        clickSound();
        addRipple(tile, tile.clientWidth / 2, tile.clientHeight / 2);
        openGame(tile);
      }
    });

    // click / tap
    tile.addEventListener("pointerdown", (e) => {
      // ensure audio context resumed on first user gesture
      if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume().catch(() => {});
      }
      addRipple(tile, e.clientX, e.clientY);
      // small delay to allow ripple to show
      setTimeout(() => openGame(tile), 90);
    });
  });

  // show last played if exists
  showBadges();

  // small accessible shortcut: press number keys 1..4 to open game
  window.addEventListener("keydown", (e) => {
    if (document.activeElement && document.activeElement.tagName !== "BODY")
      return;
    if (/^[1-9]$/.test(e.key)) {
      const idx = Number(e.key) - 1;
      if (tiles[idx]) {
        addRipple(
          tiles[idx],
          tiles[idx].clientWidth / 2,
          tiles[idx].clientHeight / 2
        );
        clickSound();
        setTimeout(() => openGame(tiles[idx]), 140);
      }
    }
  });

  // gentle entrance tone if supported
  setTimeout(() => successSound(), 120);
})();
