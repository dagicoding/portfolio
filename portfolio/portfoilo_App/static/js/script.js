document.addEventListener("DOMContentLoaded", () => {
  // ===================== Typing Animation =====================
  const textElement = document.getElementById("typing-text");
  const words = [
    "Graphic Designer",
    "Video Editor",
    "Developer",
    "Content Creator",
  ];

  let wordIndex = 0,
    charIndex = 0,
    isDeleting = false;

  function type() {
    const currentWord = words[wordIndex];

    if (isDeleting) {
      textElement.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
    } else {
      textElement.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
    }

    let speed = isDeleting ? 50 : 150;

    if (!isDeleting && charIndex === currentWord.length) {
      speed = 1800;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      speed = 400;
    }

    setTimeout(type, speed);
  }

  if (textElement) type();

  // ===================== HORIZONTAL GALLERY =====================
  const pgCards = document.querySelectorAll(".pg-card");
  const scrollEl = document.getElementById("gallery-scroll");
  const arrowLeft = document.getElementById("arrow-left");
  const arrowRight = document.getElementById("arrow-right");
  const thumb = document.getElementById("scrollbar-thumb");

  // --- Entrance animation ---
  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add("visible"), i * 80);
          cardObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 },
  );

  pgCards.forEach((c) => cardObserver.observe(c));

  // --- Arrow scroll ---
  const SCROLL_AMOUNT = 340;
  if (arrowLeft && arrowRight && scrollEl) {
    arrowLeft.addEventListener("click", () =>
      scrollEl.scrollBy({ left: -SCROLL_AMOUNT, behavior: "smooth" }),
    );
    arrowRight.addEventListener("click", () =>
      scrollEl.scrollBy({ left: SCROLL_AMOUNT, behavior: "smooth" }),
    );
  }

  // --- Custom scrollbar thumb ---
  function updateThumb() {
    if (!scrollEl || !thumb) return;
    const max = scrollEl.scrollWidth - scrollEl.clientWidth;
    const pct = max > 0 ? scrollEl.scrollLeft / max : 0;
    const trackW = 220;
    const thumbW = trackW * 0.4;
    thumb.style.left = pct * (trackW - thumbW) + "px";
  }
  scrollEl &&
    scrollEl.addEventListener("scroll", updateThumb, { passive: true });
  updateThumb();

  // --- Parallax on scroll (desktop) ---
  function pgParallax() {
    if (window.innerWidth <= 768) return;
    pgCards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const speed = parseFloat(card.dataset.speed) || 0.4;
      const centerX = rect.left + rect.width / 2;
      const viewCX = window.innerWidth / 2;
      const offset = (centerX - viewCX) * speed * 0.05;
      const img = card.querySelector("img");
      if (img) img.style.transform = `translateY(${offset}px)`;
    });
  }
  scrollEl &&
    scrollEl.addEventListener("scroll", pgParallax, { passive: true });
  window.addEventListener("scroll", pgParallax, { passive: true });
  pgParallax();
});
