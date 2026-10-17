import { auth, onAuthStateChanged, signOut, all, single, saveSingle, add, upd, del, img, esc, slugify, isConfigured } from './data.js';

const $ = s => document.querySelector(s);
const body = $('#pageBody');
const today = () => new Date().toISOString().slice(0, 10);
const muted = 'color:var(--muted);font-size:0.78rem;';
const PLATFORMS = ['facebook', 'instagram', 'tiktok', 'telegram', 'linkedin', 'behance', 'youtube', 'other'].map(p => [p, p[0].toUpperCase() + p.slice(1)]);
const IMG_HELP = 'Paste a Google Drive share link ("Anyone with the link") or any direct image URL.';
let cats = [];

/* ---------- Section definitions ---------- */
const thumb = u => u ? `<img src="${esc(img(u))}" style="width:52px;height:40px;object-fit:cover;border-radius:6px;border:1px solid var(--border)">` : '';
const toggle = f => r => `<button class="btn-sm-icon" data-act="toggle" data-id="${r.id}" data-field="${f}" title="Toggle"><i class="bi bi-toggle-${r[f] === false || !r[f] ? 'off' : 'on'}" style="font-size:1.1rem;color:${r[f] === false || !r[f] ? '#666' : '#00d450'}"></i></button>`;
const bold = t => `<span style="font-weight:600;font-size:0.875rem;">${esc(t)}</span>`;

const SECTIONS = {
  works: {
    label: 'Works', icon: 'bi-images', group: 'Content', coll: 'works', autoSlug: 1, add: 'Add Work', sub: 'Add, edit and hide your portfolio projects.',
    fields: [
      { k: 'title', l: 'Title', t: 'text', req: 1 },
      { k: 'slug', l: 'Link Name (slug)', t: 'text', help: 'Used in the link: work.html?category/this-name — filled in from the title automatically.' },
      { k: 'category', l: 'Category', t: 'select', opts: () => cats.map(c => [c.slug, c.name]) },
      { k: 'cover_image', l: 'Cover Image URL', t: 'img', req: 1 },
      { k: 'video_url', l: 'Video URL (optional)', t: 'text', help: 'YouTube, Vimeo or a Google Drive video link.' },
      { k: 'gallery', l: 'Gallery Image URLs', t: 'lines', help: 'One URL per line. Google Drive links work.' },
      { k: 'description', l: 'Description', t: 'textarea' },
      { k: 'created', l: 'Date', t: 'date', def: today },
      { k: 'featured', l: 'Featured on homepage', t: 'check' },
      { k: 'is_visible', l: 'Visible on site', t: 'check', def: true },
    ],
    cols: [
      ['Work', r => `<div class="d-flex align-items-center gap-3">${thumb(r.cover_image)}<div>${bold(r.title)}<div style="${muted}">${esc(r.created || '')}</div></div></div>`],
      ['Category', r => esc((cats.find(c => c.slug === r.category) || {}).name || '—')],
      ['Featured', toggle('featured')], ['Visible', toggle('is_visible')],
    ],
    sort: (a, b) => (b.created || '').localeCompare(a.created || ''),
  },
  categories: {
    label: 'Categories', icon: 'bi-tags-fill', group: 'Content', coll: 'categories', add: 'Add Category', sub: 'Categories used to filter your works.',
    fields: [{ k: 'name', l: 'Name', t: 'text', req: 1 }, { k: 'slug', l: 'Slug', t: 'text', help: 'Leave empty to generate from the name. Use "video-editing" for the video-card style.' }],
    cols: [['Name', r => bold(r.name)], ['Slug', r => `<code style="${muted}">${esc(r.slug)}</code>`]],
    pre: d => { d.slug = slugify(d.slug || d.name); },
  },
  skills: {
    label: 'Skills', icon: 'bi-bar-chart-fill', group: 'Content', coll: 'skills', add: 'Add Skill', sub: 'Manage skill bars shown on your homepage and about page.',
    fields: [{ k: 'name', l: 'Skill Name', t: 'text', req: 1 }, { k: 'percentage', l: 'Percentage (0–100)', t: 'number', min: 0, max: 100, def: 80 }, { k: 'icon', l: 'Icon Class (Bootstrap Icons)', t: 'text', ph: 'bi bi-brush' }],
    cols: [
      ['Skill', r => `${r.icon ? `<i class="${esc(r.icon)} me-2" style="color:#007BFF"></i>` : ''}${bold(r.name)}`],
      ['Icon Class', r => `<span style="${muted}font-family:monospace;">${esc(r.icon || '—')}</span>`],
      ['Level', r => `<div class="d-flex align-items-center gap-2" style="min-width:160px"><div class="skill-bar-preview" style="flex:1"><div class="skill-bar-fill" style="width:${+r.percentage || 0}%"></div></div><span style="font-size:0.78rem;color:#00D4FF;font-weight:600;">${+r.percentage || 0}%</span></div>`],
    ],
  },
  stats: {
    label: 'Statistics', icon: 'bi-graph-up-arrow', group: 'Content', coll: 'stats', add: 'Add Stat', sub: 'Counter numbers shown on the site.',
    fields: [{ k: 'title', l: 'Title', t: 'text', req: 1, ph: 'Projects Completed' }, { k: 'value', l: 'Value', t: 'text', req: 1, ph: '50+' }],
    cols: [['Title', r => bold(r.title)], ['Value', r => `<span style="color:#00D4FF;font-weight:700">${esc(r.value)}</span>`]],
  },
  services: {
    label: 'Services', icon: 'bi-briefcase-fill', group: 'Content', coll: 'services', add: 'Add Service', sub: 'Services shown on the About page.',
    fields: [{ k: 'title', l: 'Title', t: 'text', req: 1 }, { k: 'description', l: 'Description', t: 'textarea', req: 1 }, { k: 'icon', l: 'Icon Class', t: 'text', ph: 'bi bi-brush' }],
    cols: [['Service', r => `${r.icon ? `<i class="${esc(r.icon)} me-2" style="color:#007BFF"></i>` : ''}${bold(r.title)}`], ['Description', r => `<span style="${muted}">${esc((r.description || '').slice(0, 90))}</span>`]],
  },
  experience: {
    label: 'Experience', icon: 'bi-clock-history', group: 'Content', coll: 'experience', add: 'Add Experience', sub: 'Your work history timeline.',
    fields: [{ k: 'title', l: 'Job Title', t: 'text', req: 1 }, { k: 'company', l: 'Company', t: 'text', req: 1 }, { k: 'start_date', l: 'Start Date', t: 'date', req: 1 }, { k: 'end_date', l: 'End Date', t: 'date' }, { k: 'is_current', l: 'I currently work here', t: 'check' }, { k: 'description', l: 'Description', t: 'textarea' }],
    cols: [['Role', r => `${bold(r.title)}<div style="${muted}">${esc(r.company)}</div>`], ['Period', r => `<span style="${muted}">${esc(r.start_date || '')} → ${r.is_current ? 'Present' : esc(r.end_date || '')}</span>`]],
  },
  testimonials: {
    label: 'Testimonials', icon: 'bi-chat-quote-fill', group: 'Content', coll: 'testimonials', add: 'Add Testimonial', sub: 'Client reviews with star ratings.',
    fields: [{ k: 'client_name', l: 'Client Name', t: 'text', req: 1 }, { k: 'company', l: 'Company', t: 'text' }, { k: 'client_image', l: 'Client Photo URL', t: 'img' }, { k: 'rating', l: 'Rating (1–5)', t: 'number', min: 1, max: 5, def: 5 }, { k: 'review', l: 'Review', t: 'textarea', req: 1 }, { k: 'is_active', l: 'Show on site', t: 'check', def: true }],
    cols: [['Client', r => `<div class="d-flex align-items-center gap-3">${thumb(r.client_image)}<div>${bold(r.client_name)}<div style="${muted}">${esc(r.company || '')}</div></div></div>`], ['Rating', r => `<span style="color:#ffc107">${'★'.repeat(+r.rating || 0)}</span>`], ['Active', toggle('is_active')]],
  },
  social: {
    label: 'Social Links', icon: 'bi-share-fill', group: 'Settings', coll: 'social', add: 'Add Link', sub: 'Your social media profiles.',
    fields: [{ k: 'platform', l: 'Platform', t: 'select', opts: () => PLATFORMS, req: 1 }, { k: 'url', l: 'URL', t: 'url', req: 1, ph: 'https://' }],
    cols: [['Platform', r => bold(r.platform)], ['URL', r => `<a href="${esc(r.url)}" target="_blank" style="${muted}color:#007BFF">${esc(r.url)}</a>`]],
  },
  announcements: {
    label: 'Announcements', icon: 'bi-megaphone-fill', group: 'Settings', coll: 'announcements', add: 'New Announcement', sub: 'Popup announcements shown to visitors.',
    fields: [{ k: 'title', l: 'Title', t: 'text', req: 1 }, { k: 'message', l: 'Message', t: 'textarea', req: 1 }, { k: 'type', l: 'Type', t: 'select', opts: () => [['info', 'Information'], ['success', 'Success'], ['warning', 'Warning'], ['promo', 'Promotion']] }, { k: 'button_text', l: 'Button Text', t: 'text' }, { k: 'button_link', l: 'Button Link', t: 'url' }, { k: 'end_date', l: 'Hide after (optional)', t: 'date' }, { k: 'is_active', l: 'Active', t: 'check', def: true }],
    cols: [['Announcement', r => bold(r.title)], ['Type', r => esc(r.type || 'info')], ['Active', toggle('is_active')]],
  },
  roles: {
    label: 'Roles', coll: 'roles', add: 'Add Role', hidden: 1, sub: 'Words in the homepage typing animation.',
    fields: [{ k: 'title', l: 'Role', t: 'text', req: 1, ph: 'Video Editor' }], cols: [['Role', r => bold(r.title)]],
  },
};
const SINGLES = {
  profile: { id: 'profile', fields: [{ k: 'name', l: 'Full Name', t: 'text' }, { k: 'profile_image', l: 'Profile Photo URL', t: 'img' }, { k: 'cv_url', l: 'CV / Resume URL', t: 'text', help: 'Google Drive share link to your PDF.' }, { k: 'description', l: 'Bio', t: 'textarea', rows: 6 }] },
  contact: { id: 'contact', fields: [{ k: 'email', l: 'Email', t: 'text' }, { k: 'phone', l: 'Phone', t: 'text' }, { k: 'address', l: 'Address', t: 'textarea' }] },
};

/* ---------- Helpers ---------- */
function flash(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = `alert-dash alert-${type}`;
  el.innerHTML = `<i class="bi bi-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>${esc(msg)}`;
  body.prepend(el); setTimeout(() => el.remove(), 3500);
}
const header = (title, sub, btn = '') => `<div class="page-header"><div><h1>${esc(title)}</h1><p>${esc(sub)}</p></div>${btn}</div>`;

function input(f, v) {
  const val = v ?? (typeof f.def === 'function' ? f.def() : f.def);
  const nm = `name="${f.k}"`, req = f.req ? 'required' : '';
  let ctl;
  if (f.t === 'textarea') ctl = `<textarea ${nm} class="form-control" rows="${f.rows || 3}" ${req}>${esc(val)}</textarea>`;
  else if (f.t === 'lines') ctl = `<textarea ${nm} class="form-control" rows="4" placeholder="https://...">${esc(Array.isArray(val) ? val.join('\n') : '')}</textarea>`;
  else if (f.t === 'select') ctl = `<select ${nm} class="form-control" ${req}><option value="">— none —</option>${f.opts().map(([a, b]) => `<option value="${esc(a)}" ${a === val ? 'selected' : ''}>${esc(b)}</option>`).join('')}</select>`;
  else if (f.t === 'check') return `<div class="form-check mb-3"><input type="checkbox" ${nm} class="form-check-input" id="f_${f.k}" ${val ? 'checked' : ''}><label class="form-check-label" for="f_${f.k}" style="color:#ccc">${esc(f.l)}</label></div>`;
  else {
    const type = f.t === 'number' ? 'number' : f.t === 'date' ? 'date' : f.t === 'url' ? 'url' : 'text';
    ctl = `<input type="${type}" ${nm} class="form-control" value="${esc(val)}" ${req} ${f.min != null ? `min="${f.min}" max="${f.max}"` : ''} placeholder="${esc(f.ph || '')}" ${f.t === 'img' ? 'data-preview' : ''}>`;
    if (f.t === 'img') ctl += `<img class="mt-2" data-prev style="max-height:90px;border-radius:8px;border:1px solid var(--border);${val ? '' : 'display:none'}" src="${esc(img(val || ''))}">`;
  }
  const help = f.help || (f.t === 'img' ? IMG_HELP : '');
  return `<div class="mb-3"><label class="form-label">${esc(f.l)}</label>${ctl}${help ? `<div style="${muted}margin-top:4px">${esc(help)}</div>` : ''}</div>`;
}
function collect(form, fields) {
  const d = {};
  for (const f of fields) {
    const el = form.elements[f.k]; if (!el) continue;
    if (f.t === 'check') d[f.k] = el.checked;
    else if (f.t === 'number') d[f.k] = Math.min(f.max ?? Infinity, Math.max(f.min ?? -Infinity, Number(el.value) || 0));
    else if (f.t === 'lines') d[f.k] = el.value.split('\n').map(s => s.trim()).filter(Boolean);
    else d[f.k] = el.value.trim();
  }
  return d;
}
function previews(root) {
  root.querySelectorAll('[data-preview]').forEach(i => i.addEventListener('input', () => {
    const p = i.parentElement.querySelector('[data-prev]'); p.src = img(i.value); p.style.display = i.value ? '' : 'none';
  }));
}

/* ---------- Collection CRUD (generic) ---------- */
async function renderCollection(key, el, withHeader = true) {
  const S = SECTIONS[key];
  let rows = await all(S.coll); if (S.sort) rows.sort(S.sort);
  el.innerHTML = `${withHeader ? header(S.label, S.sub, `<button class="btn-grad" data-act="add"><i class="bi bi-plus-lg me-1"></i> ${S.add}</button>`) : `<div class="d-flex justify-content-between align-items-center mb-2 mt-4"><div style="font-weight:700">${S.label}</div><button class="btn-grad" data-act="add"><i class="bi bi-plus-lg me-1"></i> ${S.add}</button></div>`}
<div class="panel" style="overflow-x:auto"><table class="dash-table"><thead><tr>${S.cols.map(c => `<th>${c[0]}</th>`).join('')}<th>Actions</th></tr></thead><tbody>
${rows.map(r => `<tr>${S.cols.map(c => `<td>${c[1](r)}</td>`).join('')}<td><div class="d-flex gap-1">
<button class="btn-sm-icon" data-act="edit" data-id="${r.id}" title="Edit"><i class="bi bi-pencil"></i></button>
<button class="btn-sm-icon" data-act="delete" data-id="${r.id}" style="border-color:rgba(220,53,69,0.3);color:#dc3545;" title="Delete"><i class="bi bi-trash"></i></button></div></td></tr>`).join('')
      || `<tr><td colspan="${S.cols.length + 1}" style="text-align:center;color:var(--muted);padding:40px;">Nothing here yet.</td></tr>`}
</tbody></table></div>`;
  const refresh = () => renderCollection(key, el, withHeader);
  el.onclick = async e => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const row = rows.find(r => r.id === b.dataset.id);
    try {
      if (b.dataset.act === 'add') openForm(S, null, rows.length, refresh, rows);
      else if (b.dataset.act === 'edit') openForm(S, row, 0, refresh, rows);
      else if (b.dataset.act === 'delete' && confirm('Delete this item?')) { await del(S.coll, row.id); flash('Deleted.'); refresh(); }
      else if (b.dataset.act === 'toggle') { await upd(S.coll, row.id, { [b.dataset.field]: row[b.dataset.field] === false ? true : !row[b.dataset.field] }); refresh(); }
    } catch (err) { console.error(err); flash('Action failed — check you are signed in with the allowed account.', 'error'); }
  };
}

function hookSlug(m, row) {
  const t = m.querySelector('[name=title]'), sl = m.querySelector('[name=slug]');
  let touched = !!(row && row.slug);
  if (row && !row.slug) sl.value = slugify(row.title || '');
  t.addEventListener('input', () => { if (!touched) sl.value = slugify(t.value); });
  sl.addEventListener('input', () => { touched = true; });
}
function openForm(S, row, order, done, rows = []) {
  const m = document.createElement('div'); m.className = 'modal-dash open';
  m.innerHTML = `<div class="modal-box"><div class="modal-header-d"><div class="modal-title-d">${row ? 'Edit' : 'Add'} ${esc(S.label)}</div><button type="button" class="btn-sm-icon" data-x><i class="bi bi-x-lg"></i></button></div>
<form>${S.fields.map(f => input(f, row ? row[f.k] : undefined)).join('')}
<div class="d-flex gap-2 justify-content-end"><button type="button" class="btn-ghost" data-x>Cancel</button><button type="submit" class="btn-grad">Save</button></div></form></div>`;
  document.body.appendChild(m); previews(m); if (S.autoSlug) hookSlug(m, row);
  m.onclick = e => { if (e.target === m || e.target.closest('[data-x]')) m.remove(); };
  m.querySelector('form').onsubmit = async e => {
    e.preventDefault();
    const data = collect(e.target, S.fields); if (S.pre) S.pre(data);
    if (S.autoSlug) {                       // readable + unique inside its category
      const b = slugify(data.slug || data.title) || 'work'; let s = b, n = 2;
      while (rows.some(r => r.id !== row?.id && (r.category || '') === (data.category || '') && (r.slug || slugify(r.title || '')) === s)) s = `${b}-${n++}`;
      data.slug = s;
    }
    const btn = e.target.querySelector('[type=submit]'); btn.disabled = true;
    try {
      if (row) await upd(S.coll, row.id, data); else await add(S.coll, { ...data, order });
      m.remove(); flash(row ? 'Saved.' : 'Added.'); done();
    } catch (err) { console.error(err); btn.disabled = false; flash('Save failed — check you are signed in with the allowed account.', 'error'); }
  };
}

/* ---------- Single-document forms ---------- */
async function renderSingle(S, el, title, sub) {
  const v = await single(S.id);
  el.innerHTML = `<div class="panel" style="padding:24px"><form>${S.fields.map(f => input(f, v[f.k])).join('')}<button class="btn-grad" type="submit">Save changes</button></form></div>`;
  previews(el);
  el.querySelector('form').onsubmit = async e => {
    e.preventDefault();
    try { await saveSingle(S.id, collect(e.target, S.fields)); flash('Saved.'); } catch (err) { console.error(err); flash('Save failed — check you are signed in with the allowed account.', 'error'); }
  };
}

/* ---------- Pages ---------- */
const SEED = {
  roles: ['Graphic Designer', 'Video Editor', 'Content Creator', 'Brand Designer'].map(title => ({ title })),
  skills: [['Adobe Photoshop', 95, 'bi bi-brush'], ['Adobe Illustrator', 90, 'bi bi-vector-pen'], ['Adobe Premiere Pro', 88, 'bi bi-film'], ['After Effects', 82, 'bi bi-stars'], ['Canva', 92, 'bi bi-grid'], ['Content Creation', 90, 'bi bi-camera']].map(([name, percentage, icon]) => ({ name, percentage, icon })),
  stats: [['Projects Completed', '50+'], ['Happy Clients', '20+'], ['Years Experience', '3+'], ['Designs Created', '100+']].map(([title, value]) => ({ title, value })),
  categories: [['Poster Design', 'poster-design'], ['Thumbnail Design', 'thumbnail-design'], ['Logo Design', 'logo-design'], ['Video Editing', 'video-editing']].map(([name, slug]) => ({ name, slug })),
  services: [['Graphic Design', 'Posters, flyers, and social media graphics.', 'bi bi-brush'], ['Logo Design', 'Unique logos that represent your brand identity.', 'bi bi-vector-pen'], ['Video Editing', 'Professional editing with cinematic effects and color grading.', 'bi bi-film'], ['Content Creation', 'Engaging content for YouTube, TikTok and Instagram.', 'bi bi-camera'], ['Thumbnail Design', 'Click-worthy thumbnails that maximize engagement.', 'bi bi-grid'], ['Brand Identity', 'Complete brand packages with logos, palettes and guidelines.', 'bi bi-star']].map(([title, description, icon]) => ({ title, description, icon })),
};
async function seed() {
  if (!confirm('Add the default roles, skills, stats, categories and services?')) return;
  for (const [coll, items] of Object.entries(SEED)) for (const [i, it] of items.entries()) await add(coll, { ...it, order: i });
  await saveSingle('profile', { name: 'Dagimawi Tarekegne', description: 'Passionate about creating stunning visual experiences through innovative design, compelling video editing, and engaging content creation.' });
  await saveSingle('contact', { email: '', phone: '', address: 'Addis Ababa, Ethiopia' });
  flash('Sample data added.'); route();
}

const PAGES = {
  async home() {
    const [works, skills, testi, anns] = await Promise.all(['works', 'skills', 'testimonials', 'announcements'].map(all));
    const card = (icon, c, n, l, g) => `<div class="col-6 col-xl-3"><div class="stat-card"><div class="stat-icon" style="background:${c}1f;color:${c}"><i class="bi ${icon}"></i></div><div class="stat-num" style="color:${c}">${n}</div><div class="stat-label">${l}</div></div></div>`;
    body.innerHTML = `${header('Welcome back 👋', "Here's what's happening with your portfolio.", !cats.length ? '<button class="btn-grad" data-seed><i class="bi bi-magic me-1"></i> Load sample data</button>' : '')}
<div class="row g-3 mb-4">${card('bi-images', '#007BFF', works.length, 'Total Works')}${card('bi-star-fill', '#ffc107', works.filter(w => w.featured).length, 'Featured Works')}${card('bi-chat-quote-fill', '#00d450', testi.length, 'Testimonials')}${card('bi-megaphone-fill', '#ff0080', anns.filter(a => a.is_active !== false).length, 'Active Announcements')}</div>
<div class="panel" style="padding:20px"><div style="font-weight:700;margin-bottom:12px">Recent works</div>
${works.sort((a, b) => (b.created || '').localeCompare(a.created || '')).slice(0, 5).map(w => `<div class="d-flex align-items-center gap-3 mb-2">${thumb(w.cover_image)}<div>${bold(w.title)}<div style="${muted}">${esc(w.created || '')}</div></div></div>`).join('') || `<div style="${muted}">No works yet.</div>`}
<a href="#works" class="btn-grad mt-3 d-inline-block" style="text-decoration:none">Manage works</a></div>`;
    body.querySelector('[data-seed]')?.addEventListener('click', seed);
  },
  async profile() {
    body.innerHTML = `${header('Profile & Roles', 'Your name, bio, photo, CV and the typing-animation roles.')}<div id="p1"></div><div id="p2"></div>`;
    await Promise.all([renderSingle(SINGLES.profile, $('#p1')), renderCollection('roles', $('#p2'), false)]);
  },
  async contact() {
    body.innerHTML = `${header('Contact Info', 'Shown in the site footer. "Hire Me" buttons use your Telegram link, or this email if there is none.')}<div id="p1"></div>`;
    await renderSingle(SINGLES.contact, $('#p1'));
  },
};

const NAV = [
  ['Overview', [['home', 'bi-grid-1x2-fill', 'Dashboard']]],
  ['Content', [['profile', 'bi-person-circle', 'Profile & Roles'], ...['works', 'categories', 'skills', 'stats', 'services', 'experience', 'testimonials'].map(k => [k, SECTIONS[k].icon, SECTIONS[k].label])]],
  ['Settings', [['social', 'bi-share-fill', 'Social Links'], ['contact', 'bi-envelope-fill', 'Contact Info'], ['announcements', 'bi-megaphone-fill', 'Announcements']]],
];

async function route() {
  const key = (location.hash || '#home').slice(1);
  const known = PAGES[key] || SECTIONS[key]?.fields && !SECTIONS[key].hidden;
  const k = known ? key : 'home';
  $('#sidebarNav').innerHTML = NAV.map(([g, items]) => `<div class="sidebar-section">${g}</div>${items.map(([id, ic, lb]) => `<a href="#${id}" class="nav-link ${id === k ? 'active' : ''}"><i class="bi ${ic}"></i> ${lb}</a>`).join('')}`).join('');
  $('#topbarTitle').textContent = (NAV.flatMap(n => n[1]).find(i => i[0] === k) || [])[2] || 'Dashboard';
  $('#sidebar').classList.remove('open'); $('#sidebarOverlay').classList.remove('open');
  body.innerHTML = '<div class="dash-loader"><div class="loader-ring"></div>Loading</div>';
  try {
    cats = await all('categories');
    if (PAGES[k]) await PAGES[k](); else { body.innerHTML = '<div id="c"></div>'; await renderCollection(k, $('#c')); }
  } catch (e) { console.error(e); body.innerHTML = '<div class="alert-dash alert-error">Could not load data. Check your Firebase config and Firestore rules.</div>'; }
}

/* ---------- Boot ---------- */
$('#menuToggle').onclick = () => { $('#sidebar').classList.toggle('open'); $('#sidebarOverlay').classList.toggle('open'); };
$('#sidebarOverlay').onclick = () => { $('#sidebar').classList.remove('open'); $('#sidebarOverlay').classList.remove('open'); };
$('#logout').onclick = async e => { e.preventDefault(); await signOut(auth); };
if (!isConfigured) location.href = 'login.html';
onAuthStateChanged(auth, user => {
  if (!user) { location.href = 'login.html'; return; }
  $('#avatar').textContent = (user.email || '?')[0].toUpperCase();
  window.addEventListener('hashchange', route); route();
});
