// Fill these in after you deploy your Firebase project. See SETUP.md.
//
// The frontend never talks to Firestore directly — it only calls these two
// Cloud Function HTTPS endpoints. You get the URLs after running
// `firebase deploy --only functions` (they're printed in the deploy output,
// and are also visible in the Firebase console under Functions).
const APP_CONFIG = {
  // TODO: paste the deployed URL for the "submitIntake" function
  // e.g. "https://submitintake-xxxxxxxxxx-uc.a.run.app"
  SUBMIT_FUNCTION_URL: "PLACEHOLDER_SUBMIT_FUNCTION_URL",

  // TODO: paste the deployed URL for the "getSubmissions" function
  // e.g. "https://getsubmissions-xxxxxxxxxx-uc.a.run.app"
  GET_SUBMISSIONS_FUNCTION_URL: "PLACEHOLDER_GET_SUBMISSIONS_FUNCTION_URL",

  // TODO: paste your reCAPTCHA v2 (checkbox) SITE key from
  // https://www.google.com/recaptcha/admin
  RECAPTCHA_SITE_KEY: "PLACEHOLDER_RECAPTCHA_SITE_KEY",
};
