/* rps.js — UI polish + scoring */
(() => {
  const startBtn = document.getElementById("rps-start");
  const options = Array.from(document.querySelectorAll(".rps-option"));
  const resultEl = document.getElementById("rps-result");
  const youEl = document.getElementById("rps-you");
  const aiEl = document.getElementById("rps-ai");

  let score = { you: 0, ai: 0 };

  function start() {
    resultEl.textContent = "Choose an option";
  }

  function aiChoice() {
    const arr = ["rock", "paper", "scissors"];
    return arr[Math.floor(Math.random() * 3)];
  }

  function evaluate(p, a) {
    if (p === a) return "draw";
    if (
      (p === "rock" && a === "scissors") ||
      (p === "paper" && a === "rock") ||
      (p === "scissors" && a === "paper")
    )
      return "win";
    return "lose";
  }

  options.forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = btn.dataset.choice;
      const a = aiChoice();
      const res = evaluate(p, a);
      if (res === "draw") {
        resultEl.innerHTML = `Draw — You: ${p} | AI: ${a}`;
      } else if (res === "win") {
        score.you++;
        youEl.textContent = score.you;
        resultEl.innerHTML = `You Win 🎉 — You: ${p} | AI: ${a}`;
      } else {
        score.ai++;
        aiEl.textContent = score.ai;
        resultEl.innerHTML = `AI Wins — You: ${p} | AI: ${a}`;
      }
      // small animation
      btn.animate([{ transform: "scale(0.96)" }, { transform: "scale(1)" }], {
        duration: 160,
        easing: "ease",
      });
    });
  });

  startBtn.addEventListener("click", start);
})();
