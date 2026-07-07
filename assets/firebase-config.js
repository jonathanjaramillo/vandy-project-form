// The frontend never talks to Firestore directly — it only calls these two
// Vercel serverless function endpoints (api/submitIntake.js, api/getSubmissions.js).
const APP_CONFIG = {
  SUBMIT_FUNCTION_URL: "https://project-intake-form-jjaramillo.vercel.app/api/submitIntake",
  GET_SUBMISSIONS_FUNCTION_URL: "https://project-intake-form-jjaramillo.vercel.app/api/getSubmissions",
  RECAPTCHA_SITE_KEY: "6LcT0EgtAAAAABiJMpoDAZahN6Gm52uTkSvR2oTB",
};
