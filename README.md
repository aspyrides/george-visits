# Visit Schedule 👶

A tiny, free web app for family & friends to book a 30-minute visit slot to
see the new baby — capped at 3 visitors at a time, no more than one booking
per slot. Calendar view + day view, real-time updates, hosted free on GitHub
Pages.

No install needed for visitors — they just open a link on their phone,
enter a shared passcode once, type their name, and pick a slot.

## How it works

- **Hosting:** GitHub Pages (free, static files only).
- **Shared data:** Firebase Firestore (free "Spark" plan) — this is what
  lets everyone's phone see the same bookings in real time. GitHub Pages
  alone can't do this since it only serves static files.
- **Identity:** each visitor's browser gets an anonymous Firebase identity
  (no login/password) the first time they use the app. That's the "device
  ID" — it's what lets someone cancel their *own* booking later, and it's
  remembered automatically as long as they don't clear browser data.
- **Access:** a single shared passcode you send to family/friends yourself
  (WhatsApp, text, etc). This is a light deterrent, not real security —
  since the site and its source code are public, treat the passcode like a
  "please don't share this link publicly," not a lock. Don't put anything
  sensitive in this app.

## One-time setup

### 1. Create a free Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and create a project (free "Spark" plan, no credit card needed).
2. In the project, click the **</>** (web) icon to register a new web app. Give it any nickname. You don't need Firebase Hosting.
3. Copy the `firebaseConfig` object it shows you.
4. Open [`js/firebase-init.js`](js/firebase-init.js) in this repo and paste your values in, replacing the `REPLACE_ME` placeholders.

### 2. Turn on Firestore + anonymous sign-in

1. In the Firebase console, go to **Build > Firestore Database > Create database**. Pick any nearby region, start in production mode.
2. Go to **Build > Authentication > Get started**, then enable the **Anonymous** sign-in provider.
3. Go to **Firestore Database > Rules**, replace the contents with what's in [`firestore.rules`](firestore.rules) in this repo, and click **Publish**.

### 3. Customize the app

Everything you'd want to change day-to-day lives in [`js/config.js`](js/config.js):

- `appTitle` — shown in the header (e.g. "Visit George")
- `appPin` — the shared passcode you'll send to family/friends
- `slotCapacity` — max visitors at once (default 3)
- `dayStart` / `dayEnd` — visiting hours (default 8:30 AM–6:30 PM; nothing is bookable after `dayEnd` so the baby's wind-down time stays protected)
- `maxConsecutiveSlots` — longest unbroken visit any one person can book (default 3 slots = 1.5 hours). A person can still book multiple separate visits the same day — a morning one and an evening one, say — this just caps how long any single one can run.
- `relationshipOptions` — the dropdown list of relationships to the baby

### 4. Turn on GitHub Pages

1. On GitHub, go to this repo's **Settings > Pages**.
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
3. Set **Branch** to `main` and folder to `/ (root)`, then **Save**.
4. Wait about a minute, then your app is live at:
   `https://aspyrides.github.io/george-visits/`

That's it — send that link plus the passcode to family and friends.

## Publishing updates later

Any time you edit a file (change the passcode, hours, colors, etc.), just
commit and push to `main` — GitHub Pages automatically redeploys within
about a minute:

```bash
git add -A
git commit -m "Update visiting hours"
git push
```

No build step, no CI, nothing else to configure.

## Notes & limitations

- **Passcode is not real security.** Anyone who inspects the page source can
  read it. It exists to keep the link from being casually shared/found, not
  to protect sensitive data — and this app doesn't store anything sensitive
  (just first names, an optional relationship, and a time slot).
- **"My device" = "this browser."** If someone clears their browser data or
  switches devices, the app treats them as a new visitor and they'll enter
  the passcode/name again. Their old booking still exists but they'll no
  longer see a "cancel" button on it — you (or they, on the original
  device/browser) would need to remove it from the Firestore console
  instead.
- **Free tier limits:** Firebase's free Spark plan is generous (50k reads
  and 20k writes a day) — a family app like this won't come close.