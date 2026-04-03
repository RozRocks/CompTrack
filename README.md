# CompTrack — Competitive Equipment Tracker

A two-view web app for field techs to log competitor copiers and sales reps to analyze the data. Hosted free on GitHub Pages with Firebase as the cloud database and photo storage.

---

## Architecture

```
GitHub Pages          Firebase (free tier)
─────────────         ────────────────────
index.html      ←──→  Firestore (device records)
dashboard.html  ←──→  Storage   (device photos)
firebase-config.js
```

---

## Setup (takes about 15 minutes)

### Step 1 — Create a Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → name it (e.g. "comptrack") → Continue
3. Disable Google Analytics if you don't need it → **Create project**

---

### Step 2 — Enable Firestore (database)

1. In your project, go to **Build → Firestore Database**
2. Click **Create database**
3. Select **Start in test mode** → Next
4. Choose a region close to you → **Enable**

---

### Step 3 — Enable Firebase Storage (photos)

1. Go to **Build → Storage**
2. Click **Get started**
3. Select **Start in test mode** → Next
4. Choose the same region → **Done**

---

### Step 4 — Get your web app credentials

1. Click the **gear icon** (Project Settings) → **General** tab
2. Scroll to **Your apps** → click the **Web** icon ( `</>` )
3. Register the app with a nickname (e.g. "comptrack-web") → **Register app**
4. Copy the `firebaseConfig` object — it looks like this:

```js
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXX...",
  authDomain: "comptrack-abc12.firebaseapp.com",
  projectId: "comptrack-abc12",
  storageBucket: "comptrack-abc12.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

### Step 5 — Edit firebase-config.js

Open `firebase-config.js` and replace the placeholder values with your actual credentials from Step 4.

```js
const firebaseConfig = {
  apiKey:            "AIzaSyXXX...",   // ← your real values here
  authDomain:        "comptrack-abc12.firebaseapp.com",
  projectId:         "comptrack-abc12",
  storageBucket:     "comptrack-abc12.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc123"
};
```

> **Note:** Firebase API keys are safe to put in client-side code — this is standard Firebase practice.
> Security is enforced by Firestore Security Rules, not by keeping the key secret.

---

### Step 6 — Push to GitHub

```bash
# From this folder:
git init
git add .
git commit -m "Initial CompTrack setup"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/comptrack.git
git branch -M main
git push -u origin main
```

---

### Step 7 — Enable GitHub Pages

1. Go to your GitHub repo → **Settings** → **Pages** (left sidebar)
2. Under **Source**, select **Deploy from a branch**
3. Branch: **main** / folder: **/ (root)** → **Save**
4. Wait ~60 seconds, then your site is live at:
   - `https://YOUR_USERNAME.github.io/comptrack/` ← field tech app
   - `https://YOUR_USERNAME.github.io/comptrack/dashboard.html` ← sales dashboard

---

## Sharing with your team

| Role | URL | Purpose |
|------|-----|---------|
| Field tech | `...github.io/comptrack/` | Log equipment, take photos |
| Sales rep | `...github.io/comptrack/dashboard.html` | Analyze data, export CSV |

---

## Security (before going to production)

The default Firestore rules allow anyone to read/write — fine for internal use,
but tighten them before sharing the URL widely.

Go to **Firestore → Rules** and update:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /devices/{deviceId} {
      // Allow all for now — add auth checks here when ready
      allow read, write: if true;
    }
  }
}
```

For a protected setup, consider adding Firebase Authentication (Google Sign-In
takes about 30 minutes to add). Ask for help if you need it.

---

## Firebase Free Tier Limits

| Resource | Free Limit | Notes |
|----------|-----------|-------|
| Firestore reads | 50,000/day | ~50K page loads |
| Firestore writes | 20,000/day | ~20K device saves |
| Firestore storage | 1 GB | Device record JSON |
| Storage (photos) | 5 GB | Plenty for photos |
| Storage downloads | 1 GB/day | Photo loads |

More than enough for an internal team tool.

---

## File structure

```
comptrack/
├── index.html          Field tech app
├── dashboard.html      Sales rep dashboard
├── firebase-config.js  ← Edit this with your credentials
└── README.md
```
