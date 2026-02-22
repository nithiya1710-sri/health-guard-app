const router = require("express").Router();
const admin = require("../firebaseAdmin")
// Optional: Middleware to check if user is authenticated
// You should add proper auth middleware (e.g. Firebase ID token verification)
const verifyUser = async (req, res, next) => {
  const idToken = req.headers.authorization?.split("Bearer ")[1];

  if (!idToken) {
    return res.status(401).json({ error: "Unauthorized - No token provided" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // attach user info to request
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ error: "Unauthorized - Invalid token" });
  }
};

// ────────────────────────────────────────────────
// POST /appointments → Book new appointment
// ────────────────────────────────────────────────
router.post("/", verifyUser, async (req, res) => {
  try {
    const { hospital, date, time, doctor, specialty } = req.body;

    // Basic input validation
    if (!hospital || !date || !time) {
      return res.status(400).json({ error: "Missing required fields: hospital, date, time" });
    }

    // Optional: validate date format (simple check)
    if (isNaN(Date.parse(date))) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const appointmentData = {
      uid: req.user.uid,               // ← VERY IMPORTANT: link to logged-in user
      hospital,
      date,
      time,
      doctor: doctor || null,
      specialty: specialty || null,
      status: "upcoming",              // default status
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("appointments").add(appointmentData);

    res.status(201).json({
      message: "Appointment booked successfully",
      id: docRef.id,
      ...appointmentData,
    });
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ error: "Failed to book appointment" });
  }
});

// ────────────────────────────────────────────────
// GET /appointments → Get user's own appointments only
// ────────────────────────────────────────────────
router.get("/", verifyUser, async (req, res) => {
  try {
    const snapshot = await db
      .collection("appointments")
      .where("uid", "==", req.user.uid)   // ← only return this user's appointments
      .orderBy("date", "desc")            // newest first (or "asc" for oldest first)
      .get();

    if (snapshot.empty) {
      return res.json([]); // return empty array instead of nothing
    }

    const appointments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(appointments);
  } catch (err) {
    console.error("Fetch appointments error:", err);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

// Optional: DELETE /appointments/:id → Cancel appointment
router.delete("/:id", verifyUser, async (req, res) => {
  try {
    const appointmentRef = db.collection("appointments").doc(req.params.id);
    const doc = await appointmentRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Security: only allow owner to delete
    if (doc.data().uid !== req.user.uid) {
      return res.status(403).json({ error: "You can only cancel your own appointments" });
    }

    await appointmentRef.update({
      status: "cancelled",
      cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ message: "Appointment cancelled successfully" });
  } catch (err) {
    console.error("Cancel error:", err);
    res.status(500).json({ error: "Failed to cancel appointment" });
  }
});

module.exports = router;