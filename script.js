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
