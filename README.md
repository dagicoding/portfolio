# Dagimawi Portfolio — static HTML / CSS (Bootstrap) / JS + Firebase

No server needed. Content is stored in Firebase Firestore, every image / video / CV is a **URL**
(Google Drive links work), and the dashboard lives at `/dashboard/`.

## 1. Create the Firebase project (free plan is enough)
1. https://console.firebase.google.com → **Add project**.
2. **Build → Firestore Database → Create database** (production mode, any region).
3. **Build → Authentication → Get started → Email/Password → Enable.**
4. **Authentication → Users → Add user** → your email + a strong password. This is your dashboard login.
5. **Authentication → Settings → User actions →** turn **off** "Enable create (sign-up)". (Stops strangers registering.)
6. **Project settings → Your apps → Web (</>)** → register an app → copy the `firebaseConfig` values into `js/firebase-config.js`.
7. **Firestore → Rules** → paste `firestore.rules`, replace `YOUR_EMAIL@gmail.com` with your login email → **Publish**.
   Everyone can read the site content; only your account can edit it.

## 2. Run it
ES modules need http, so don't double-click the files. From this folder:
```
python -m http.server 8000     # then open http://localhost:8000
```
Open `/dashboard/login.html`, sign in, and click **Load sample data** on the overview (optional).

## 3. Deploy (all free)
GitHub Pages, Netlify (drag the folder in), or Firebase Hosting. In Firebase console →
Authentication → Settings → **Authorized domains**, add your live domain.

## Using Google Drive links
- Upload the file to Drive → Share → **Anyone with the link** → copy link → paste it in any URL field.
- Images, gallery images, profile photo and testimonial photos are converted automatically.
- Videos: paste a Drive, YouTube or Vimeo link. CV: paste the Drive link to your PDF.
- Drive can rate-limit heavy traffic. If images ever stop loading, host them elsewhere and paste those URLs instead — nothing else changes.

## Notes
- Gallery field: one image URL per line. Category slug `video-editing` makes works show as video cards.
- "Hire Me" / "Contact Me" use your **Telegram** social link, or your Contact Info email if there is none.
- The Django database is not migrated automatically; re-enter content in the dashboard (works, skills, etc.).
- Never commit secrets. The Firebase web config is safe to publish; the security rules are what protect your data.

## Structure
```
index.html  works.html  work.html?id=  about.html
dashboard/index.html  dashboard/login.html
css/main.css  css/dashboard.css  css/login.css
js/firebase-config.js  js/data.js (Firestore + Drive helpers)  js/site.js (public pages)
js/ui.js (animations, lightbox, video modal)  js/dashboard.js (all admin sections)
firestore.rules
```
