const { getDb, setCors } = require("./_shared");

// POST { password } -> returns all submissions, newest first.
// Firestore rules block all direct client access, so the admin page reads
// through this function instead. The password check here is a second layer
// on top of the admin page's own client-side gate, not a substitute for
// real auth - fine given the data isn't sensitive (see admin page comments).
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

  const { password } = req.body || {};
  if (password !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ success: false, error: "Incorrect password." });
    return;
  }

  try {
    const db = getDb();
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
    console.error("getSubmissions failed", err);
    res.status(500).json({ success: false, error: "Server error. Please try again." });
  }
};
