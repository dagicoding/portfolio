/* Theme + navbar (run once the page shell exists) */
function initChrome(){
  const body=document.body, btn=document.getElementById('themeToggle');
  const apply=t=>{body.classList.toggle('light-mode',t==='light');if(btn)btn.innerHTML=t==='light'?'<i class="bi bi-moon-fill"></i>':'<i class="bi bi-sun-fill"></i>';};
  let saved='dark'; try{saved=localStorage.getItem('theme')||'dark'}catch(e){}
  apply(saved);
  btn&&btn.addEventListener('click',()=>{const n=body.classList.contains('light-mode')?'dark':'light';try{localStorage.setItem('theme',n)}catch(e){};apply(n);});
  const nav=document.querySelector('.navbar');
  const onScroll=()=>nav&&nav.classList.toggle('scrolled',window.scrollY>50);
  window.addEventListener('scroll',onScroll);onScroll();
}

/* ========== TYPED ANIMATION ========== */
function initTyped() {
  const el = document.getElementById('typed-text');
  if (!el) return;
  const roles = JSON.parse(el.dataset.roles || '[]');
  if (!roles.length) return;

  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function type() {
    const current = roles[roleIndex];
    if (isDeleting) {
      el.textContent = current.substring(0, charIndex - 1);
      charIndex--;
    } else {
      el.textContent = current.substring(0, charIndex + 1);
      charIndex++;
    }

    let delay = isDeleting ? 60 : 100;
    if (!isDeleting && charIndex === current.length) {
      delay = 1800;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      delay = 400;
    }
    setTimeout(type, delay);
  }
  type();
}

/* ========== SCROLL ANIMATIONS ========== */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
}

/* ========== SKILL BARS ========== */
function initSkillBars() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.width = entry.target.dataset.width + '%';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.skill-fill').forEach(bar => observer.observe(bar));
}

/* ========== COUNTER ANIMATION ========== */
function animateCounter(el) {
  const text = el.dataset.target || el.textContent;
  const numericPart = parseFloat(text.replace(/[^0-9.]/g, ''));
  const suffix = text.replace(/[0-9.]/g, '');
  const steps = 60;
  const increment = numericPart / steps;
  let current = 0, step = 0;
  const timer = setInterval(() => {
    step++;
    current = Math.min(current + increment, numericPart);
    el.textContent = Math.floor(current) + suffix;
    if (step >= steps) clearInterval(timer);
  }, 2000 / steps);
}

function initCounters() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat-value').forEach(c => {
    c.dataset.target = c.textContent;
    observer.observe(c);
  });
}

/* ========== LIGHTBOX ========== */
function initLightbox() {
  const overlay = document.getElementById('lightbox-overlay');
  if (!overlay) return;
  const img = overlay.querySelector('.lightbox-img');
  const closeBtn = overlay.querySelector('.lightbox-close');
  const prevBtn = overlay.querySelector('.lightbox-prev');
  const nextBtn = overlay.querySelector('.lightbox-next');
  const triggers = document.querySelectorAll('[data-lightbox]');
  let images = [], currentIndex = 0;

  function open(index) {
    currentIndex = index;
    img.src = images[currentIndex].src;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    img.src = '';
  }

  function navigate(dir) {
    currentIndex = (currentIndex + dir + images.length) % images.length;
    img.style.opacity = '0';
    setTimeout(() => { img.src = images[currentIndex].src; img.style.opacity = '1'; }, 150);
  }

  triggers.forEach((t, i) => {
    images.push({ src: t.dataset.lightbox, alt: t.dataset.alt || '' });
    t.addEventListener('click', (e) => { e.preventDefault(); open(i); });
  });

  closeBtn && closeBtn.addEventListener('click', close);
  prevBtn && prevBtn.addEventListener('click', () => navigate(-1));
  nextBtn && nextBtn.addEventListener('click', () => navigate(1));
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('active')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });
}

/* ==========================================
   VIDEO MODAL
========================================== */

function initVideoModal() {
    const overlay = document.getElementById('video-modal-overlay');

    if (!overlay) return;

    const container = overlay.querySelector('.video-modal-content');
    const closeBtn = overlay.querySelector('.lightbox-close');

    function getEmbedUrl(url) {
        try {

            /* YouTube */
            if (
                url.includes('youtube.com/watch') ||
                url.includes('youtu.be/')
            ) {

                let videoId = '';

                if (url.includes('youtube.com/watch')) {
                    const parsed = new URL(url);
                    videoId = parsed.searchParams.get('v');
                }

                if (url.includes('youtu.be/')) {
                    videoId = url.split('youtu.be/')[1].split('?')[0];
                }

                return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
            }

            /* Vimeo */
            if (url.includes('vimeo.com/')) {
                const videoId = url.split('vimeo.com/')[1].split('?')[0];
                return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
            }

            return url;

        } catch (error) {
            console.error('Video URL Error:', error);
            return url;
        }
    }

    function openVideo(url, type) {

        container.innerHTML = '';

        if (type === 'file') {

            container.innerHTML = `
                <video controls autoplay playsinline>
                    <source src="${url}">
                    Your browser does not support video playback.
                </video>
            `;

        } else {

            const embedUrl = getEmbedUrl(url);


            container.innerHTML = `
                <iframe
                    src="${embedUrl}"
                    title="Video Player"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen
                    referrerpolicy="strict-origin-when-cross-origin">
                </iframe>
            `;
        }

        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeVideo() {
        overlay.classList.remove('active');
        container.innerHTML = '';
        document.body.style.overflow = '';
    }

    document.querySelectorAll('[data-video]').forEach(button => {

        button.addEventListener('click', function () {

            const url = this.dataset.video;
            const type = this.dataset.type || 'url';

            if (!url) return;

            openVideo(url, type);
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', closeVideo);
    }

    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
            closeVideo();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (
            e.key === 'Escape' &&
            overlay.classList.contains('active')
        ) {
            closeVideo();
        }
    });
}

/* ========== ANNOUNCEMENT POPUP ========== */
function initAnnouncement() {
  const popup = document.getElementById('announcement-popup');
  if (!popup) return;
  const id = popup.dataset.id;
  if ((()=>{try{return localStorage.getItem(`announcement_closed_${id}`)}catch(e){}})()) return;
  setTimeout(() => popup.classList.add('show'), 1000);
  const closeBtn = popup.querySelector('.announcement-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      popup.classList.remove('show');
      try{localStorage.setItem(`announcement_closed_${id}`,'1')}catch(e){}
    });
  }
}


/* Call after dynamic content is rendered */
function initUI(){
  initTyped();initScrollAnimations();initSkillBars();initCounters();
  initLightbox();initVideoModal();initAnnouncement();
}
