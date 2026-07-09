const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

// Files prefixed with "_" aren't routed as endpoints by Vercel - this is
// shared code for the sibling functions in this folder.

function getDb() {
  if (getApps().length === 0) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    initializeApp({ credential: cert(serviceAccount) });
  }
  return getFirestore();
}

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

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
  inquiry: ["contact_name", "email", "organization_name", "project_description"],
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

module.exports = { getDb, setCors, REQUIRED_FIELDS_BY_FORM, verifyRecaptcha, FieldValue };
