# Setup

Follow these steps in order to get the site fully working.

Backend split: **Firestore** (storage) stays on Firebase's free Spark plan.
**Compute** (reCAPTCHA verification + reading/writing Firestore) runs as
**Vercel serverless functions** on Vercel's free Hobby plan — no credit card
required. Firebase Cloud Functions and Secret Manager were avoided because
they require the paid Blaze plan even at $0 actual usage.

## 1. Create the Firebase project

1. Go to https://console.firebase.google.com/ and click **Add project**.
2. Give it a name (e.g. `vandy-project-intake`). Note the generated **Project ID**.
3. Skip Google Analytics.

## 2. Enable Firestore

1. In the Firebase console, go to **Build → Firestore Database**.
2. Click **Create database**.
3. Choose **Production mode** (the repo's `firestore.rules` already blocks all direct client access).
4. Pick a region close to you.

Stay on the free **Spark** plan — Firestore itself doesn't require Blaze, only Cloud Functions/Secret Manager do (which this setup no longer uses).

## 3. Get reCAPTCHA v2 keys

1. Go to https://www.google.com/recaptcha/admin/create
2. Register a new site:
   - reCAPTCHA type: **v2 "I'm not a robot" Checkbox**
   - Domains: your GitHub Pages domain (e.g. `<your-username>.github.io`), your Vercel domain isn't needed here (reCAPTCHA runs client-side on the GitHub Pages domain), and `localhost` for local testing
3. Keep the **Site key** and **Secret key** handy.

## 4. Create a Firestore service account key

The Vercel functions authenticate to Firestore with a service account (same access level as the Admin SDK always has — it bypasses `firestore.rules`).

1. In the Firebase console: **Project settings (gear icon) → Service accounts**.
2. Click **Generate new private key**. This downloads a JSON file — keep it safe, don't commit it to git.
3. You'll paste its full contents into a Vercel environment variable in Step 6.

## 5. Install the Vercel CLI and link the project

```bash
npx vercel login
```

Opens a browser to log in (free account, e.g. via GitHub — no card required for Hobby plan).

From the repo root:

```bash
npx vercel link
```

Follow the prompts to create/link a new Vercel project for this repo.

## 6. Set environment variables on Vercel

```bash
npx vercel env add RECAPTCHA_SECRET production
# paste the reCAPTCHA "Secret key" from step 3

npx vercel env add ADMIN_PASSWORD production
# type whatever password you want to gate the admin page with

npx vercel env add FIREBASE_SERVICE_ACCOUNT_JSON production
# paste the ENTIRE contents of the service account JSON file from step 4, as one line
```

Repeat each `vercel env add` with `preview` and `development` instead of `production` if you also want to test preview/local deployments — for just getting this live, `production` is enough.

## 7. Deploy the API functions

```bash
npx vercel --prod
```

The output prints your live deployment URL, e.g. `https://vandy-project-form.vercel.app`. Your two endpoints are:

```
https://vandy-project-form.vercel.app/api/submitIntake
https://vandy-project-form.vercel.app/api/getSubmissions
```

Also deploy the Firestore rules (separately, via Firebase CLI — this doesn't need Blaze):

```bash
npx firebase-tools login
npx firebase-tools use --add   # pick your Firebase project, alias it "default"
npx firebase-tools deploy --only firestore:rules
```

## 8. Fill in the frontend config

Open `assets/firebase-config.js` and replace the three placeholders:

```js
SUBMIT_FUNCTION_URL: "https://<your-vercel-app>.vercel.app/api/submitIntake",
GET_SUBMISSIONS_FUNCTION_URL: "https://<your-vercel-app>.vercel.app/api/getSubmissions",
RECAPTCHA_SITE_KEY: "<your reCAPTCHA site key>",
```

## 9. Set the admin page password

Open `admin-a3a1b52f88a9.html` and find:

```js
const ADMIN_PASSWORD = "PLACEHOLDER_ADMIN_PASSWORD";
```

Set it to the **same password** you set for the `ADMIN_PASSWORD` env var in Step 6 — the admin page checks it client-side first (to avoid showing the UI at all), then `api/getSubmissions.js` checks it again server-side.

This is a friction/obscurity gate, not real authentication (see the comment block at the top of the admin page) — fine here because the intake data isn't sensitive.

## 10. Push to GitHub and enable GitHub Pages

1. Commit and push your `assets/firebase-config.js` and admin page changes.
2. On GitHub, go to your repo → **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to `Deploy from a branch`.
4. Branch: `main`, folder: `/ (root)`. Save.
5. Your live URL: `https://<your-username>.github.io/vandy-project-form/`.

## 11. Finding/changing the admin page URL

```
https://<your-username>.github.io/vandy-project-form/admin-a3a1b52f88a9.html
```

To rename: `git mv admin-a3a1b52f88a9.html admin-<new-string>.html`, commit, push. Generate a new random string with:

```bash
node -e "console.log(require('crypto').randomBytes(6).toString('hex'))"
```

## Ongoing: after any changes to `api/*.js`

```bash
npx vercel --prod
```

## Ongoing: after any changes to `firestore.rules`

```bash
npx firebase-tools deploy --only firestore:rules
```
