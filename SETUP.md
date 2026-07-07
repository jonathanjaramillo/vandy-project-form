# Setup

Follow these steps in order to get the site fully working.

## 1. Create the Firebase project

1. Go to https://console.firebase.google.com/ and click **Add project**.
2. Give it a name (e.g. `vandy-project-intake`). Note the generated **Project ID** — you'll need it below.
3. Google Analytics is not needed for this project; you can skip it.

## 2. Enable Firestore

1. In the Firebase console, go to **Build → Firestore Database**.
2. Click **Create database**.
3. Choose **Production mode** (the repo's `firestore.rules` already blocks all direct client access, so production mode is safe from the start).
4. Pick a region close to you.

## 3. Get reCAPTCHA v2 keys

1. Go to https://www.google.com/recaptcha/admin/create
2. Register a new site:
   - reCAPTCHA type: **v2 "I'm not a robot" Checkbox**
   - Domains: add your GitHub Pages domain (e.g. `<your-username>.github.io`) and `localhost` (for local testing)
3. You'll get a **Site key** and a **Secret key**. Keep this tab open — you'll need both.

## 4. Install the Firebase CLI and log in

```bash
npx firebase-tools login
```

(Or `npm install -g firebase-tools` if you'd rather have it installed globally.)

From the repo root:

```bash
npx firebase-tools use --add
```

Select the Firebase project you created in step 1. This writes your real project ID into `.firebaserc`, replacing the `PLACEHOLDER_FIREBASE_PROJECT_ID` value.

## 5. Set the Cloud Functions secrets

The reCAPTCHA secret and the admin password are never hardcoded — they're stored as Firebase Functions secrets and read at runtime via `defineSecret`.

```bash
npx firebase-tools functions:secrets:set RECAPTCHA_SECRET
# paste the reCAPTCHA "Secret key" from step 3 when prompted

npx firebase-tools functions:secrets:set ADMIN_PASSWORD
# type whatever password you want to gate the admin page with
```

## 6. Install function dependencies and deploy

```bash
cd functions
npm install
cd ..
npx firebase-tools deploy --only functions
```

The deploy output will print two HTTPS URLs, one per function, that look like:

```
✔  functions[submitIntake(us-central1)] https://submitintake-xxxxxxxxxx-uc.a.run.app
✔  functions[getSubmissions(us-central1)] https://getsubmissions-xxxxxxxxxx-uc.a.run.app
```

Copy both — you need them next.

Also deploy the Firestore rules (they block all direct client access):

```bash
npx firebase-tools deploy --only firestore:rules
```

## 7. Fill in the frontend config

Open `assets/firebase-config.js` and replace the three placeholder values:

```js
SUBMIT_FUNCTION_URL: "PLACEHOLDER_SUBMIT_FUNCTION_URL",       // -> submitIntake URL from step 6
GET_SUBMISSIONS_FUNCTION_URL: "PLACEHOLDER_GET_SUBMISSIONS_FUNCTION_URL", // -> getSubmissions URL from step 6
RECAPTCHA_SITE_KEY: "PLACEHOLDER_RECAPTCHA_SITE_KEY",          // -> reCAPTCHA site key from step 3
```

## 8. Set the admin page password

Open `admin-a3a1b52f88a9.html` and find:

```js
const ADMIN_PASSWORD = "PLACEHOLDER_ADMIN_PASSWORD";
```

Set it to the **same password** you set for the `ADMIN_PASSWORD` secret in step 5 — the admin page checks it client-side first (to avoid showing the UI at all), then the `getSubmissions` function checks it again server-side.

Remember: this is a friction/obscurity gate, not real authentication (see the comment block at the top of the admin page). That's fine here because the intake data isn't sensitive.

## 9. Push to GitHub and enable GitHub Pages

If you haven't already, this repo was created and pushed via `gh repo create`. To enable Pages:

1. On GitHub, go to your repo → **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to `Deploy from a branch`.
3. Branch: `main`, folder: `/ (root)`. Save.
4. GitHub will give you a live URL like `https://<your-username>.github.io/vandy-project-form/`. It can take a minute or two to go live after the first push.

## 10. Finding/changing the admin page URL

The admin page is intentionally named with a random string so it's not discoverable by guessing:

```
admin-a3a1b52f88a9.html
```

Your live admin URL is:

```
https://<your-username>.github.io/vandy-project-form/admin-a3a1b52f88a9.html
```

If you want a different random string, rename the file (`git mv admin-a3a1b52f88a9.html admin-<new-string>.html`), commit, and push. You can generate a new random string locally with:

```bash
node -e "console.log(require('crypto').randomBytes(6).toString('hex'))"
```

## Ongoing: after any changes to `functions/index.js`

```bash
npx firebase-tools deploy --only functions
```

## Ongoing: after any changes to `firestore.rules`

```bash
npx firebase-tools deploy --only firestore:rules
```
