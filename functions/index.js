const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const logger = require("firebase-functions/logger");

initializeApp();
const db = getFirestore();

// Set these with:
//   firebase functions:secrets:set RECAPTCHA_SECRET
//   firebase functions:secrets:set ADMIN_PASSWORD
// See SETUP.md.
const RECAPTCHA_SECRET = defineSecret("RECAPTCHA_SECRET");
const ADMIN_PASSWORD = defineSecret("ADMIN_PASSWORD");

const REQUIRED_FIELDS_BY_FORM = {
  faculty: [
    "contact_name",
    "title_role",
    "email",
    "phone",
    "school_college",
    "department",
    "grant_funded",
    "project_title",
    "project_description",
    "project_goals",
    "deliverables",
    "num_students",
    "preferred_majors",
    "student_level",
    "required_skills",
    "mentor_contact",
    "work_location",
    "ip_ownership",
    "ip_agreement_required",
    "nda_required",
    "export_control",
    "can_publish",
    "can_list_on_resume",
    "access_sensitive_data",
    "success_measurement",
    "final_presentation_required",
    "sponsor_evaluates",
    "agrees_to_terms",
    "pi_approval",
  ],
  corporate: [
    "contact_name",
    "title_role",
    "email",
    "phone",
    "company_name",
    "industry",
    "company_size",
    "website",
    "first_time_sponsor",
    "project_title",
    "project_description",
    "project_goals",
    "deliverables",
    "num_students",
    "preferred_majors",
    "student_level",
    "required_skills",
    "mentor_contact",
    "work_location",
    "ip_ownership",
    "ip_agreement_required",
    "nda_required",
    "export_control",
    "can_publish",
    "can_list_on_resume",
    "logo_use_allowed",
    "access_sensitive_data",
    "success_measurement",
    "final_presentation_required",
    "sponsor_evaluates",
    "donation_interest",
    "agrees_to_terms",
    "signature_approval",
  ],
};

async function verifyRecaptcha(token, secret) {
  const params = new URLSearchParams({ secret, response: token });
  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  const result = await res.json();
  return result.success === true;
}

// POST { formType, data, recaptchaToken } -> writes a submission to Firestore.
// Client never writes to Firestore directly; firestore.rules blocks that entirely.
exports.submitIntake = onRequest(
  { secrets: [RECAPTCHA_SECRET], cors: true },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ success: false, error: "Method not allowed." });
      return;
    }

    const { formType, data, recaptchaToken } = req.body || {};

    if (!formType || !REQUIRED_FIELDS_BY_FORM[formType]) {
      res.status(400).json({ success: false, error: "Invalid form type." });
      return;
    }
    if (!recaptchaToken) {
      res.status(400).json({ success: false, error: "Missing reCAPTCHA token." });
      return;
    }
    if (!data || typeof data !== "object") {
      res.status(400).json({ success: false, error: "Missing form data." });
      return;
    }

    const missing = REQUIRED_FIELDS_BY_FORM[formType].filter(
      (field) => !data[field] || String(data[field]).trim() === ""
    );
    if (missing.length > 0) {
      res
        .status(400)
        .json({ success: false, error: `Missing required fields: ${missing.join(", ")}` });
      return;
    }

    try {
      const isHuman = await verifyRecaptcha(recaptchaToken, RECAPTCHA_SECRET.value());
      if (!isHuman) {
        res.status(400).json({ success: false, error: "reCAPTCHA verification failed." });
        return;
      }

      await db.collection("submissions").add({
        formType,
        data,
        createdAt: FieldValue.serverTimestamp(),
      });

      res.status(200).json({ success: true });
    } catch (err) {
      logger.error("submitIntake failed", err);
      res.status(500).json({ success: false, error: "Server error. Please try again." });
    }
  }
);

// POST { password } -> returns all submissions, newest first.
// Firestore rules block all direct client access, so the admin page reads
// through this function instead. The password check here is a second layer
// on top of the admin page's own client-side gate, not a substitute for
// real auth — fine given the data isn't sensitive (see admin page comments).
exports.getSubmissions = onRequest(
  { secrets: [ADMIN_PASSWORD], cors: true },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ success: false, error: "Method not allowed." });
      return;
    }

    const { password } = req.body || {};
    if (password !== ADMIN_PASSWORD.value()) {
      res.status(401).json({ success: false, error: "Incorrect password." });
      return;
    }

    try {
      const snapshot = await db.collection("submissions").orderBy("createdAt", "desc").get();
      const submissions = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          formType: d.formType,
          data: d.data,
          createdAt: d.createdAt ? d.createdAt.toDate().toISOString() : null,
        };
      });
      res.status(200).json({ success: true, submissions });
    } catch (err) {
      logger.error("getSubmissions failed", err);
      res.status(500).json({ success: false, error: "Server error. Please try again." });
    }
  }
);
