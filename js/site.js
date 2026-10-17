import { all, single, img, video, file, esc, slugify, isConfigured } from './data.js';

const page = document.body.dataset.page;
const app = document.getElementById('app');
const D = {};
const SOCIAL = ['facebook', 'instagram', 'tiktok', 'telegram', 'linkedin', 'behance', 'youtube'];
const sIcon = p => 'bi-' + (SOCIAL.includes(p) ? p : 'link-45deg');
const d = i => `style="transition-delay:${i * 100}ms"`;
const fmt = (s, o) => s ? new Date(s + 'T12:00:00').toLocaleDateString('en', o) : '';
const wkey = w => `${w.category || 'work'}/${w._slug}`;           // e.g. poster-design/social-media-post
const wlink = w => `work.html?${esc(wkey(w))}`;
function assignSlugs(list) {                                       // unique per category; explicit slugs win
  const used = new Set(), base = w => slugify(w.slug || w.title || '') || 'work';
  const ord = [...list].sort((a, b) => (a.created || '').localeCompare(b.created || '') || a.id.localeCompare(b.id));
  [...ord.filter(w => w.slug), ...ord.filter(w => !w.slug)].forEach(w => {
    const b = base(w); let s = b, n = 2;
    while (used.has(`${w.category || 'work'}/${s}`)) s = `${b}-${n++}`;
    used.add(`${w.category || 'work'}/${s}`); w._slug = s;
  });
}
const catOf = w => D.categories.find(c => c.slug === w.category);
const empty = (icon, msg) => `<div class="col-12 text-center py-5"><i class="bi ${icon}" style="font-size:4rem;color:var(--text-muted)"></i><p style="color:var(--text-muted);margin-top:16px;">${msg}</p></div>`;
const ph = '<div style="background:var(--gradient-blue-subtle);width:100%;height:100%;display:flex;align-items:center;justify-content:center;"><i class="bi bi-image" style="font-size:3rem;color:var(--accent-blue)"></i></div>';
const thumb = w => w.cover_image ? `<img src="${esc(img(w.cover_image))}" alt="${esc(w.title)}" loading="lazy">` : ph;

/* ---------- Shell (nav / footer / overlays) ---------- */
function shell() {
  const a = n => page === n ? 'active' : '';
  document.body.insertAdjacentHTML('afterbegin', `
<nav class="navbar navbar-expand-lg"><div class="container">
  <a class="navbar-brand" href="index.html">Dagimawi<span style="opacity:0.5">.</span></a>
  <div class="d-flex align-items-center gap-2 order-lg-last">
    <button class="p-3 theme-toggle" id="themeToggle" title="Toggle theme"><i class="bi bi-sun-fill"></i></button>
    <button class="navbar-toggler ms-2" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu"><span class="navbar-toggler-icon"></span></button>
  </div>
  <div class="collapse navbar-collapse" id="navMenu">
    <ul class="navbar-nav mx-auto gap-1">
      <li class="nav-item"><a class="nav-link ${a('home')}" href="index.html">Home</a></li>
      <li class="nav-item dropdown"><a class="nav-link dropdown-toggle ${a('works')}" href="#" data-bs-toggle="dropdown">Works</a>
        <ul class="dropdown-menu" id="navCats" style="background:var(--bg-secondary);border:1px solid var(--border-glass);border-radius:var(--radius);">
          <li><a class="dropdown-item" style="color:var(--text-secondary);padding:10px 20px;" href="works.html">All Works</a></li></ul></li>
      <li class="nav-item"><a class="nav-link ${a('about')}" href="about.html">About</a></li>
    </ul>
    <a href="#" id="hireBtn" class="btn-gradient d-none d-lg-inline-flex align-items-center gap-2">Hire Me <i class="bi bi-arrow-right"></i></a>
  </div>
</div></nav>`);
  document.body.insertAdjacentHTML('beforeend', `
<footer class="footer"><div class="container"><div class="row g-5">
  <div class="col-lg-4"><div class="footer-brand">Dagimawi.</div>
    <p class="footer-desc">Crafting visual experiences through design, video, and creative content that leave a lasting impression.</p>
    <div class="d-flex gap-2 mt-3" id="footSocial"></div></div>
  <div class="col-6 col-lg-2"><div class="footer-heading">Navigation</div>
    <a href="index.html" class="footer-link">Home</a><a href="works.html" class="footer-link">Works</a><a href="about.html" class="footer-link">About</a></div>
  <div class="col-6 col-lg-2"><div class="footer-heading">Services</div><div id="footCats"></div></div>
  <div class="col-lg-4"><div class="footer-heading">Get In Touch</div><div id="footContact"></div><span id="footCv"></span></div>
</div><div class="footer-bottom"><p>&copy; ${new Date().getFullYear()} Dagimawi Tarekegne. All rights reserved.</p></div></div></footer>
<div id="lightbox-overlay" class="lightbox-overlay"><button class="lightbox-close"><i class="bi bi-x-lg"></i></button>
  <button class="lightbox-nav lightbox-prev"><i class="bi bi-chevron-left"></i></button><img class="lightbox-img" src="" alt="">
  <button class="lightbox-nav lightbox-next"><i class="bi bi-chevron-right"></i></button></div>
<div id="video-modal-overlay" class="video-modal-overlay"><button class="lightbox-close"><i class="bi bi-x-lg"></i></button><div class="video-modal-content"></div></div>
<div id="announce"></div>`);
  initChrome();
}

/* ---------- Data ---------- */
async function load() {
  const names = ['roles', 'skills', 'stats', 'services', 'experience', 'testimonials', 'social', 'categories', 'works', 'announcements'];
  const [vals, profile, contact] = await Promise.all([Promise.all(names.map(all)), single('profile'), single('contact')]);
  names.forEach((n, i) => D[n] = vals[i]);
  D.profile = profile; D.contact = contact;
  assignSlugs(D.works);
  D.works = D.works.filter(w => w.is_visible !== false)
    .sort((a, b) => (b.created || '').localeCompare(a.created || '') || (a.order ?? 0) - (b.order ?? 0));
}

const tg = () => D.social.find(s => s.platform === 'telegram');
const hire = () => tg() ? tg().url : (D.contact.email ? 'mailto:' + D.contact.email : '#');
const socials = () => D.social.map(l => `<a href="${esc(l.url)}" target="_blank" rel="noopener" class="social-icon-link" title="${esc(l.platform)}"><i class="bi ${sIcon(l.platform)}"></i></a>`).join('');
const cvBtn = cls => D.profile.cv_url ? `<a href="${esc(file(D.profile.cv_url))}" target="_blank" rel="noopener" class="${cls}"><i class="bi bi-download me-1"></i> Download CV</a>` : '';

function fillShell() {
  const c = D.contact;
  document.getElementById('hireBtn').href = hire();
  document.getElementById('navCats').insertAdjacentHTML('beforeend', D.categories.map(x =>
    `<li><a class="dropdown-item" style="color:var(--text-secondary);padding:10px 20px;" href="works.html?category=${esc(x.slug)}">${esc(x.name)}</a></li>`).join(''));
  document.getElementById('footCats').innerHTML = D.categories.map(x => `<a href="works.html?category=${esc(x.slug)}" class="footer-link">${esc(x.name)}</a>`).join('');
  document.getElementById('footSocial').innerHTML = socials();
  const row = (i, t, href) => `<div class="d-flex align-items-center gap-2 mb-2"><i class="bi ${i}" style="color:var(--accent-blue)"></i>${href ? `<a href="${href}" class="footer-link mb-0">${esc(t)}</a>` : `<span class="footer-link mb-0">${esc(t)}</span>`}</div>`;
  document.getElementById('footContact').innerHTML =
    (c.email ? row('bi-envelope', c.email, 'mailto:' + esc(c.email)) : '') + (c.phone ? row('bi-telephone', c.phone) : '') + (c.address ? row('bi-geo-alt', c.address) : '');
  document.getElementById('footCv').innerHTML = cvBtn('btn-outline-glow mt-4 d-inline-flex align-items-center gap-2');
  const now = new Date();
  const a = D.announcements.find(x => x.is_active !== false && (!x.end_date || new Date(x.end_date + 'T23:59:59') >= now));
  if (a) {
    const badge = { info: '<i class="bi bi-info-circle"></i> Info', success: '<i class="bi bi-check-circle"></i> Update', warning: '<i class="bi bi-exclamation-triangle"></i> Notice' }[a.type] || '<i class="bi bi-star"></i> Promotion';
    document.getElementById('announce').innerHTML = `
<div id="announcement-popup" class="announcement-popup" data-id="${esc(a.id)}"><div class="announcement-inner">
  <button class="announcement-close"><i class="bi bi-x-lg"></i></button><div class="announcement-glow"></div>
  <div class="announcement-type-badge ${esc(a.type || 'info')}">${badge}</div>
  <div class="announcement-title">${esc(a.title)}</div><div class="announcement-message">${esc(a.message)}</div>
  ${a.button_text && a.button_link ? `<a href="${esc(a.button_link)}" class="btn-gradient d-inline-block">${esc(a.button_text)} <i class="bi bi-arrow-right ms-1"></i></a>` : ''}
</div></div>`;
  }
}

/* ---------- Reusable pieces ---------- */
function card(w, i = 0, col = 'col-md-6 col-lg-4') {
  const cat = catOf(w);
  if (w.video_url && w.category === 'video-editing') return `
<div class="${col} fade-up" ${d(i)}><div class="video-card" data-video="${esc(video(w.video_url))}" data-type="url">
  <div class="video-thumb-wrapper">${thumb(w)}<div class="video-play-btn"><i class="bi bi-play-fill"></i></div></div>
  <div class="card-body p-3"><div class="card-title" style="font-size:0.95rem;font-weight:700;color:var(--text-primary);">${esc(w.title)}</div>
  <div style="color:var(--text-muted);font-size:0.78rem;margin-top:4px;">${fmt(w.created, { month: 'short', year: 'numeric' })}</div></div></div></div>`;
  return `
<div class="${col} fade-up" ${d(i)}><a href="${wlink(w)}" class="portfolio-card d-block text-decoration-none">
  <div class="card-img-wrapper">${thumb(w)}<div class="card-overlay"><span class="btn-gradient px-4 py-2 rounded-pill">View Project</span></div></div>
  <div class="card-body">${cat ? `<div class="card-category">${esc(cat.name)}</div>` : ''}<div class="card-title">${esc(w.title)}</div></div></a></div>`;
}
const section = (label, title, body, style = 'padding:100px 0;') => `
<section style="${style}"><div class="container"><div class="text-center mb-5"><div class="section-label">${label}</div>
<h2 class="section-title fade-up">${title}</h2><div class="section-divider"></div></div>${body}</div></section>`;
const statsRow = (pad) => D.stats.length ? `<section style="padding:${pad};"><div class="container"><div class="row g-4 text-center">${D.stats.map((s, i) =>
  `<div class="col-6 col-md-3 fade-up" ${d(i)}><div class="stat-card"><div class="stat-value">${esc(s.value)}</div><div class="stat-label">${esc(s.title)}</div></div></div>`).join('')}</div></div></section>` : '';
const skillItem = s => `<div class="skill-item"><div class="skill-header"><span class="skill-name">${s.icon ? `<i class="${esc(s.icon)} me-2" style="color:var(--accent-blue)"></i>` : ''}${esc(s.name)}</span><span class="skill-percent">${+s.percentage || 0}%</span></div><div class="skill-bar"><div class="skill-fill" data-width="${+s.percentage || 0}"></div></div></div>`;
const avatar = p => p.profile_image ? `<img src="${esc(img(p.profile_image))}" alt="${esc(p.name)}" class="profile-img">` : '<div class="profile-img-placeholder"><i class="bi bi-person-fill"></i></div>';

/* ---------- Pages ---------- */
const pages = {
  home() {
    const p = D.profile, name = p.name || 'Dagimawi Tarekegne';
    const roles = D.roles.length ? D.roles.map(r => r.title) : ['Graphic Designer', 'Video Editor', 'Content Creator'];
    const featured = D.works.filter(w => w.featured).slice(0, 6);
    return `
<section class="hero-section"><div class="container"><div class="row align-items-center g-5">
  <div class="col-lg-6 order-2 order-lg-1">
    <div class="hero-greeting fade-up">Welcome to my portfolio</div>
    <h1 class="hero-name fade-up fade-up-delay-1">Hey, I am<br><span>${esc(name)}</span></h1>
    <div class="hero-typing-wrapper fade-up fade-up-delay-2">I'm a <span id="typed-text" data-roles="${esc(JSON.stringify(roles))}"></span><span class="typed-cursor">|</span></div>
    <p class="hero-description fade-up fade-up-delay-3">${esc(p.description || 'Passionate about creating stunning visual experiences through innovative design, compelling video editing, and engaging content creation.')}</p>
    <div class="hero-buttons fade-up fade-up-delay-4">
      <a href="works.html" class="btn-gradient">View My Work <i class="bi bi-arrow-right ms-1"></i></a>
      <a href="${esc(hire())}" class="btn-outline-glow">Contact Me</a>${cvBtn('btn-outline-glow')}</div>
    <div class="hero-social fade-up">${socials()}</div></div>
  <div class="col-lg-6 order-1 order-lg-2 text-center"><div class="profile-image-wrapper d-inline-block fade-up">${avatar(p)}</div></div>
</div></div></section>
${D.stats.length ? statsRow('3rem 0').replace('<section style="', '<section style="background:var(--bg-secondary);border-top:1px solid var(--border-glass);border-bottom:1px solid var(--border-glass);') : ''}
${featured.length ? section('Portfolio', 'Featured <span>Works</span>', `<div class="row g-4">${featured.map((w, i) => card(w, i)).join('')}</div>
  <div class="text-center mt-5 fade-up"><a href="works.html" class="btn-outline-glow">View All Works <i class="bi bi-arrow-right ms-1"></i></a></div>`) : ''}
${D.skills.length ? `<section style="padding:100px 0;background:var(--bg-secondary);border-top:1px solid var(--border-glass);"><div class="container"><div class="row g-5 align-items-center">
  <div class="col-lg-5 fade-up"><div class="section-label">Expertise</div><h2 class="section-title">My <span>Skills</span></h2>
    <p style="color:var(--text-secondary);line-height:1.8;">I combine technical proficiency with creative vision to deliver results that exceed expectations.</p>
    <a href="about.html" class="btn-gradient mt-3 d-inline-flex align-items-center gap-2">Learn More <i class="bi bi-arrow-right"></i></a></div>
  <div class="col-lg-7 fade-up fade-up-delay-2">${D.skills.map(skillItem).join('')}</div></div></div></section>` : ''}
${D.testimonials.filter(t => t.is_active !== false).length ? section('Testimonials', 'What Clients <span>Say</span>', `<div class="row g-4">${D.testimonials.filter(t => t.is_active !== false).map((t, i) => `
  <div class="col-md-6 col-lg-4 fade-up" ${d(i)}><div class="testimonial-card"><div class="testimonial-stars">${[1, 2, 3, 4, 5].map(n => n <= t.rating ? '<i class="bi bi-star-fill"></i>' : '<i class="bi bi-star" style="opacity:0.3"></i>').join('')}</div>
  <p class="testimonial-text">"${esc(t.review)}"</p><div class="testimonial-client">
  ${t.client_image ? `<img src="${esc(img(t.client_image))}" alt="${esc(t.client_name)}" class="testimonial-avatar">` : `<div class="testimonial-avatar-placeholder">${esc((t.client_name || '?')[0].toUpperCase())}</div>`}
  <div><div class="testimonial-name">${esc(t.client_name)}</div>${t.company ? `<div class="testimonial-company">${esc(t.company)}</div>` : ''}</div></div></div></div>`).join('')}</div>`) : ''}
<section style="padding:100px 0;background:var(--bg-secondary);border-top:1px solid var(--border-glass);"><div class="container text-center"><div class="fade-up" style="max-width:600px;margin:0 auto;">
  <div class="section-label">Let's Work Together</div><h2 class="section-title">Have a Project in <span>Mind?</span></h2>
  <p style="color:var(--text-secondary);margin-bottom:32px;">Let's create something amazing together. I'm available for freelance projects and collaborations.</p>
  <div class="d-flex gap-3 justify-content-center flex-wrap"><a href="${esc(hire())}" class="btn-gradient">Start a Project <i class="bi bi-arrow-right ms-1"></i></a>
  <a href="works.html" class="btn-outline-glow">View My Work</a></div></div></div></section>`;
  },

  works() {
    const slug = new URLSearchParams(location.search).get('category') || '';
    const list = s => D.works.filter(w => !s || w.category === s);
    const draw = s => {
      const items = list(s);
      document.getElementById('work-grid').innerHTML = items.length ? items.map((w, i) => card(w, i).replace('fade-up', 'fade-up visible')).join('') : empty('bi-grid', 'No works found in this category.');
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.slug === s));
      initUI();
    };
    setTimeout(() => {
      document.querySelectorAll('.filter-btn').forEach(b => b.addEventListener('click', () => {
        history.replaceState(null, '', b.dataset.slug ? `?category=${b.dataset.slug}` : location.pathname); draw(b.dataset.slug);
      }));
      draw(slug);
    });
    return `
<section class="page-hero"><div class="container text-center"><div class="section-label">Portfolio</div><h1 class="section-title fade-up">My <span>Works</span></h1>
<p class="fade-up" style="color:var(--text-secondary);max-width:500px;margin:0 auto;">A collection of my design, video, and creative work.</p></div></section>
<section style="padding:0 0 100px;"><div class="container"><div class="filter-tabs fade-up"><button class="filter-btn" data-slug="">All</button>
${D.categories.map(c => `<button class="filter-btn" data-slug="${esc(c.slug)}">${esc(c.name)}</button>`).join('')}</div><div class="row g-4" id="work-grid"></div></div></section>`;
  },

  work() {
    const qid = new URLSearchParams(location.search).get('id');          // old links (?id=...) still work
    const raw = decodeURIComponent(location.search.slice(1).split('&')[0]);
    const w = qid ? D.works.find(x => x.id === qid) : D.works.find(x => wkey(x) === raw);
    if (w && qid) history.replaceState(null, '', 'work.html?' + wkey(w));
    if (!w) return `<section class="page-hero"><div class="container text-center"><h1 class="section-title">Work <span>not found</span></h1><a href="works.html" class="btn-gradient mt-3 d-inline-block">Back to Works</a></div></section>`;
    document.title = `${w.title} | Dagimawi Tarekegne`;
    const cat = catOf(w), gal = w.gallery || [];
    const related = D.works.filter(x => x.category === w.category && x.id !== w.id).slice(0, 4);
    const meta = (i, t) => `<div class="d-flex align-items-center gap-2 mb-2"><i class="bi ${i}" style="color:var(--accent-blue)"></i><span style="color:var(--text-secondary);font-size:.85rem;">${esc(t)}</span></div>`;
    return `
<section class="page-hero" style="padding-bottom:40px;"><div class="container">
  <div class="d-flex align-items-center gap-2 mb-3" style="color:var(--text-muted);font-size:0.85rem;"><a href="index.html" style="color:var(--text-muted)">Home</a>
  <i class="bi bi-chevron-right" style="font-size:.7rem"></i><a href="works.html" style="color:var(--text-muted)">Works</a>
  <i class="bi bi-chevron-right" style="font-size:.7rem"></i>${cat ? `<a href="works.html?category=${esc(cat.slug)}" style="color:var(--text-muted)">${esc(cat.name)}</a><i class="bi bi-chevron-right" style="font-size:.7rem"></i>` : ''}<span style="color:var(--accent-blue)">${esc(w.title)}</span></div>
  <div class="row align-items-start g-5">
    <div class="col-lg-8 fade-up">${w.cover_image ? `<img src="${esc(img(w.cover_image))}" alt="${esc(w.title)}" style="width:100%;border-radius:var(--radius-lg);border:1px solid var(--border-glass);">` : ''}</div>
    <div class="col-lg-4 fade-up fade-up-delay-2"><div class="glass-card p-4">
      ${cat ? `<div class="section-label mb-2">${esc(cat.name)}</div>` : ''}<h1 style="font-size:1.6rem;font-weight:800;margin-bottom:16px;">${esc(w.title)}</h1>
      ${w.description ? `<p style="color:var(--text-secondary);line-height:1.8;margin-bottom:24px;white-space:pre-line;">${esc(w.description)}</p>` : ''}
      <div style="border-top:1px solid var(--border-glass);padding-top:20px;">${w.created ? meta('bi-calendar3', fmt(w.created, { month: 'long', year: 'numeric' })) : ''}${cat ? meta('bi-tag', cat.name) : ''}</div>
      ${w.video_url ? `<button class="btn-gradient w-100 mt-4 d-flex align-items-center justify-content-center gap-2" data-video="${esc(video(w.video_url))}" data-type="url"><i class="bi bi-play-circle-fill"></i> Watch Video</button>` : ''}
    </div></div></div></div></section>
${gal.length ? `<section style="padding:60px 0 100px;"><div class="container"><h2 class="section-title mb-5 fade-up">Project <span>Gallery</span></h2><div class="gallery-masonry">
  ${gal.map((u, i) => `<div class="gallery-item fade-up" ${d(i)}><a href="${esc(img(u))}" data-lightbox="${esc(img(u))}" data-alt=""><img src="${esc(img(u))}" alt="" loading="lazy"></a></div>`).join('')}</div></div></section>` : ''}
${related.length ? `<section style="padding:0 0 100px;"><div class="container"><h2 class="section-title mb-4 fade-up">Related <span>Works</span></h2><div class="row g-4">${related.map((x, i) => card(x, i, 'col-md-6 col-lg-3')).join('')}</div></div></section>` : ''}`;
  },

  about() {
    const p = D.profile, name = p.name || 'Dagimawi Tarekegne';
    const dates = e => `${fmt(e.start_date, { month: 'short', year: 'numeric' })} — ${e.is_current ? 'Present' : fmt(e.end_date, { month: 'short', year: 'numeric' })}`;
    return `
<section class="page-hero"><div class="container text-center"><div class="section-label">About Me</div><h1 class="section-title fade-up">The Creative <span>Behind the Work</span></h1></div></section>
<section style="padding:0 0 80px;"><div class="container"><div class="row g-5 align-items-center">
  <div class="col-lg-5 text-center fade-up"><div class="profile-image-wrapper d-inline-block">${avatar(p)}</div></div>
  <div class="col-lg-7 fade-up fade-up-delay-2"><div class="section-label">Biography</div><h2 class="section-title">${esc(name)}</h2>
    <p style="color:var(--text-secondary);line-height:1.9;margin-bottom:24px;white-space:pre-line;">${esc(p.description || '')}</p>
    <div class="d-flex gap-3 flex-wrap"><a href="${esc(hire())}" class="btn-gradient">Hire Me <i class="bi bi-arrow-right ms-1"></i></a>${cvBtn('btn-outline-glow')}</div></div></div></div></section>
${D.skills.length ? section('Skills', 'My <span>Expertise</span>', `<div class="row g-4">${D.skills.map((s, i) => `<div class="col-md-6 fade-up" ${d(i)}>${skillItem(s)}</div>`).join('')}</div>`, 'padding:80px 0;background:var(--bg-secondary);border-top:1px solid var(--border-glass);border-bottom:1px solid var(--border-glass);') : ''}
${D.services.length ? section('Services', 'What I <span>Offer</span>', `<div class="row g-4">${D.services.map((s, i) => `<div class="col-md-6 col-lg-4 fade-up" ${d(i)}><div class="glass-card p-4 h-100">
  ${s.icon ? `<div style="width:52px;height:52px;border-radius:var(--radius);background:var(--gradient-blue-subtle);border:1px solid rgba(0,123,255,0.2);display:flex;align-items:center;justify-content:center;margin-bottom:18px;"><i class="${esc(s.icon)}" style="font-size:1.4rem;color:var(--accent-blue)"></i></div>` : ''}
  <h3 style="font-size:1.05rem;font-weight:700;margin-bottom:10px;">${esc(s.title)}</h3><p style="color:var(--text-secondary);font-size:0.88rem;line-height:1.7;">${esc(s.description)}</p></div></div>`).join('')}</div>`, 'padding:80px 0;') : ''}
${D.experience.length ? section('Experience', 'My <span>Journey</span>', `<div class="row justify-content-center"><div class="col-lg-8 fade-up">${D.experience.sort((a, b) => (b.start_date || '').localeCompare(a.start_date || '')).map(e => `
  <div class="experience-item"><div class="experience-dot"></div><div class="experience-period">${dates(e)}</div><div class="experience-title">${esc(e.title)}</div>
  <div class="experience-company">${esc(e.company)}</div>${e.description ? `<div class="experience-desc">${esc(e.description)}</div>` : ''}</div>`).join('')}</div></div>`, 'padding:80px 0;background:var(--bg-secondary);border-top:1px solid var(--border-glass);') : ''}
${statsRow('80px 0')}`;
  }
};

/* ---------- Skeleton placeholders (shown until Firebase answers) ---------- */
const sk = (w, h, x = '') => `<div class="sk" style="width:${w};height:${h};${x}"></div>`;
const skCard = col => `<div class="${col}"><div class="sk-card"><div class="sk" style="aspect-ratio:4/3;border-radius:0"></div><div class="p-3">${sk('35%', '10px', 'margin-bottom:12px')}${sk('75%', '16px')}</div></div></div>`;
const skGrid = (n, col = 'col-md-6 col-lg-4') => `<div class="row g-4">${Array(n).fill(skCard(col)).join('')}</div>`;
const skHead = `<div class="text-center mb-5 sk-stack" style="display:flex;flex-direction:column;align-items:center">${sk('110px', '12px')}${sk('min(320px,70%)', '38px')}</div>`;
const skeletons = {
  home: () => `<section class="hero-section"><div class="container"><div class="row align-items-center g-5">
    <div class="col-lg-6 order-2 order-lg-1 sk-stack">${sk('170px', '14px')}${sk('85%', '58px')}${sk('55%', '58px', 'margin-bottom:26px')}${sk('45%', '26px', 'margin-bottom:26px')}${sk('100%', '12px')}${sk('92%', '12px')}${sk('70%', '12px', 'margin-bottom:28px')}
      <div class="d-flex gap-3 flex-wrap">${sk('160px', '50px', 'border-radius:50px')}${sk('140px', '50px', 'border-radius:50px')}</div></div>
    <div class="col-lg-6 order-1 order-lg-2 text-center"><div class="sk sk-circle" style="width:min(340px,72vw);aspect-ratio:1;margin:auto"></div></div></div></div></section>
    <section style="padding:3rem 0"><div class="container"><div class="row g-4">${Array(4).fill(`<div class="col-6 col-md-3">${sk('100%', '110px', 'border-radius:16px')}</div>`).join('')}</div></div></section>
    <section style="padding:80px 0"><div class="container">${skHead}${skGrid(3)}</div></section>`,
  works: () => `<section class="page-hero"><div class="container text-center sk-stack" style="display:flex;flex-direction:column;align-items:center">${sk('100px', '12px')}${sk('min(300px,70%)', '46px')}${sk('min(420px,80%)', '14px')}</div></section>
    <section style="padding:0 0 100px"><div class="container"><div class="d-flex justify-content-center gap-2 flex-wrap mb-5">${Array(5).fill(sk('110px', '40px', 'border-radius:50px')).join('')}</div>${skGrid(6)}</div></section>`,
  work: () => `<section class="page-hero" style="padding-bottom:60px"><div class="container">${sk('min(380px,90%)', '14px', 'margin-bottom:24px')}<div class="row g-5">
    <div class="col-lg-8"><div class="sk" style="aspect-ratio:16/10;border-radius:20px"></div></div>
    <div class="col-lg-4"><div class="sk-card p-4 sk-stack">${sk('90px', '12px')}${sk('85%', '30px', 'margin-bottom:22px')}${sk('100%', '12px')}${sk('100%', '12px')}${sk('65%', '12px', 'margin-bottom:26px')}${sk('45%', '12px')}${sk('100%', '48px', 'border-radius:50px;margin-top:20px')}</div></div></div></div></section>`,
  about: () => `<section class="page-hero"><div class="container text-center sk-stack" style="display:flex;flex-direction:column;align-items:center">${sk('90px', '12px')}${sk('min(480px,85%)', '46px')}</div></section>
    <section style="padding:0 0 80px"><div class="container"><div class="row g-5 align-items-center">
    <div class="col-lg-5 text-center"><div class="sk sk-circle" style="width:min(320px,70vw);aspect-ratio:1;margin:auto"></div></div>
    <div class="col-lg-7 sk-stack">${sk('100px', '12px')}${sk('55%', '36px', 'margin-bottom:20px')}${sk('100%', '12px')}${sk('96%', '12px')}${sk('100%', '12px')}${sk('60%', '12px', 'margin-bottom:24px')}${sk('150px', '48px', 'border-radius:50px')}</div></div></div></section>
    <section style="padding:80px 0"><div class="container">${skHead}<div class="row g-4">${Array(4).fill(`<div class="col-md-6">${sk('100%', '48px')}</div>`).join('')}</div></div></section>`,
};

/* ---------- Boot ---------- */
shell();
const failHtml = '<div class="container text-center" style="padding:160px 0"><h2 class="section-title">Couldn\'t load <span>content</span></h2><p style="color:var(--text-secondary)">Please refresh the page.</p></div>';
if (!isConfigured) {
  app.innerHTML = '<div class="container text-center" style="padding:160px 0"><h2 class="section-title">Almost <span>there</span></h2><p style="color:var(--text-secondary)">Add your Firebase config in <code>js/firebase-config.js</code>.</p></div>';
} else {
  app.innerHTML = skeletons[page]();
  const timer = setTimeout(() => { app.innerHTML = failHtml; }, 15000); // network hung
  try {
    await load();
    clearTimeout(timer);
    fillShell();
    app.innerHTML = pages[page]();
  } catch (e) {
    clearTimeout(timer); console.error(e);
    app.innerHTML = failHtml;
  }
}
initUI();
