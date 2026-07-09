const { getDb, setCors, REQUIRED_FIELDS_BY_FORM, verifyRecaptcha, FieldValue } = require("./_shared");

// POST { formType, data, recaptchaToken } -> writes a submission to Firestore.
// The client never writes to Firestore directly; firestore.rules blocks that entirely.
// Auth to Firestore here uses a service account (FIREBASE_SERVICE_ACCOUNT_JSON env var),
// which bypasses firestore.rules the same way the Admin SDK always does.
module.exports = async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
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
  delete data["g-recaptcha-response"]; // strip even if a caller bypasses the client-side form.js

  const missing = REQUIRED_FIELDS_BY_FORM[formType].filter(
    (field) => !data[field] || String(data[field]).trim() === ""
  );
  if (missing.length > 0) {
    res
      .status(400)
      .json({ success: false, error: `Missing required fields: ${missing.join(", ")}` });
    return;
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    res.status(400).json({ success: false, error: "Invalid email address." });
    return;
  }

  try {
    const isHuman = await verifyRecaptcha(recaptchaToken, process.env.RECAPTCHA_SECRET);
    if (!isHuman) {
      res.status(400).json({ success: false, error: "reCAPTCHA verification failed." });
      return;
    }

    const db = getDb();
    await db.collection("submissions").add({
      formType,
      data,
      createdAt: FieldValue.serverTimestamp(),
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("submitIntake failed", err);
    res.status(500).json({ success: false, error: "Server error. Please try again." });
  }
};
