// Fill these in after you deploy. See SETUP.md.
//
// The frontend never talks to Firestore directly — it only calls these two
// Vercel serverless function endpoints (api/submitIntake.js, api/getSubmissions.js).
// You get the URLs after running `vercel --prod` (printed in the deploy output,
// and visible in the Vercel dashboard).
const APP_CONFIG = {
  // TODO: paste your Vercel deployment's submitIntake URL
  // e.g. "https://vandy-project-form.vercel.app/api/submitIntake"
  SUBMIT_FUNCTION_URL: "PLACEHOLDER_SUBMIT_FUNCTION_URL",

  // TODO: paste your Vercel deployment's getSubmissions URL
  // e.g. "https://vandy-project-form.vercel.app/api/getSubmissions"
  GET_SUBMISSIONS_FUNCTION_URL: "PLACEHOLDER_GET_SUBMISSIONS_FUNCTION_URL",

  // TODO: paste your reCAPTCHA v2 (checkbox) SITE key from
  // https://www.google.com/recaptcha/admin
  RECAPTCHA_SITE_KEY: "PLACEHOLDER_RECAPTCHA_SITE_KEY",
};
