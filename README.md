# MBM LeadTool

Field equipment tracker and sales lead management tool. Built on Firebase + GitHub Pages.

---

## Pages

| Page | URL | Who uses it |
|------|-----|-------------|
| `login.html` | `/login.html` | Everyone — entry point |
| `index.html` | `/` | Field techs — log equipment, submit leads |
| `dashboard.html` | `/dashboard.html` | Sales reps & admins — view/manage leads |
| `admin.html` | `/admin.html` | Admins only — manage users |

## User roles

| Role | Can do |
|------|--------|
| **tech** | Log competitive equipment, submit leads to sales reps |
| **sales** | View leads assigned to them, update status, export reports |
| **admin** | Everything above + manage all users, view all leads |

---

## Setup

### 1 — Firebase project

Already set up: `comptrack-d9cff`. No changes needed.

---

### 2 — Enable Firebase Authentication

1. Firebase Console → **Authentication** → **Get Started**
2. Under **Sign-in method**, enable **Email/Password**
3. Click **Save**

---

### 3 — Update Firestore Rules

Go to **Firestore Database → Rules** and replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow create: if request.auth != null;
    }
    match /devices/{deviceId} {
      allow read, write: if request.auth != null;
    }
    match /leads/{leadId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Click **Publish**.

---

### 4 — Create your first admin account

Because there are no users yet, you need to create the first admin manually:

**Step A — Create the auth login:**
1. Firebase Console → **Authentication → Users → Add User**
2. Enter your email and a password
3. Copy the **UID** shown (looks like `abc123xyz...`)

**Step B — Create the Firestore profile:**
1. Firebase Console → **Firestore Database → Start collection**
2. Collection ID: `users`
3. Document ID: paste your UID from Step A
4. Add these fields:
   - `name` (string): Your full name
   - `email` (string): Your email
   - `role` (string): `admin`
   - `isActive` (boolean): `true`
   - `createdAt` (number): `1700000000000` (any timestamp)
5. Click **Save**

You can now sign in at `login.html` and use the admin panel to add all other users.

---

### 5 — Set up EmailJS (lead notifications)

EmailJS sends emails to sales reps when a lead is assigned to them. Free tier allows 200 emails/month.

1. Go to [emailjs.com](https://emailjs.com) → create free account
2. **Email Services** → Add Service → connect your Gmail or Outlook
3. **Email Templates** → Create Template with these variables:

```
Subject: New Lead Assigned — {{customer_name}} ({{priority}})

Hi {{to_name}},

A new lead has been assigned to you by {{from_name}}.

CUSTOMER: {{customer_name}}
ADDRESS:  {{customer_address}}
PHONE:    {{customer_phone}}
PRIORITY: {{priority}}
DATE SEEN: {{interaction_date}}
TYPE:     {{interaction_type}}
EQUIPMENT: {{equipment_seen}}

OPPORTUNITY:
{{opportunity}}

NOTES:
{{notes}}

View this lead in the dashboard:
{{dashboard_url}}
```

4. Go to **Account → General** → copy your **Public Key**
5. Open `index.html`, find the email config section, and fill in:

```javascript
const EMAILJS_PUBLIC_KEY  = 'your_public_key_here';
const EMAILJS_SERVICE_ID  = 'service_xxxxxxx';
const EMAILJS_TEMPLATE_ID = 'template_xxxxxxx';
```

If you skip this step, leads still save to Firestore — reps just won't receive email notifications.

---

### 6 — Push to GitHub

```bash
git add .
git commit -m "MBM LeadTool rebrand and features"
git push origin main
```

GitHub Pages will redeploy automatically.

---

## Troubleshooting

**"Permission denied" in console** — Firestore rules need updating (see Step 3).

**Email not sending** — Check the EmailJS public key, service ID, and template ID in `index.html`. The lead is still saved even if email fails.

**Can't create users in admin panel** — Make sure Firebase Authentication is enabled (Step 2).

**Sales rep dropdown is empty** — Users need to be created via the admin panel with role `sales` and `isActive: true`.
