import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore, collection, getDocs, doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc }
  from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged }
  from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export { signInWithEmailAndPassword, signOut, onAuthStateChanged };
export const isConfigured = !firebaseConfig.apiKey.startsWith('YOUR_');

/* ---------- Firestore helpers ---------- */
export async function all(name) {
  const snap = await getDocs(collection(db, name));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
export async function single(id) {
  const s = await getDoc(doc(db, 'settings', id));
  return s.exists() ? s.data() : {};
}
export const saveSingle = (id, data) => setDoc(doc(db, 'settings', id), data, { merge: true });
export const add = (name, data) => addDoc(collection(db, name), data);
export const upd = (name, id, data) => updateDoc(doc(db, name, id), data);
export const del = (name, id) => deleteDoc(doc(db, name, id));

/* ---------- Google Drive link helpers ---------- */
export function driveId(u = '') {
  if (!/google\.com/.test(u)) return null;
  const m = u.match(/\/d\/([\w-]+)/) || u.match(/[?&]id=([\w-]+)/);
  return m ? m[1] : null;
}
// Any pasted share link → direct image URL (other URLs pass through untouched)
export const img = u => { const i = driveId(u); return i ? `https://lh3.googleusercontent.com/d/${i}=w1600` : (u || ''); };
// Drive video → embeddable preview (YouTube/Vimeo are handled by the video modal)
export const video = u => { const i = driveId(u); return i ? `https://drive.google.com/file/d/${i}/preview` : (u || ''); };
// Drive file → direct download (used for the CV)
export const file = u => { const i = driveId(u); return i ? `https://drive.google.com/uc?export=download&id=${i}` : (u || ''); };

/* ---------- Misc ---------- */
export const esc = s => String(s ?? '').replace(/[&<>"']/g,
  c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const slugify = s => String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
