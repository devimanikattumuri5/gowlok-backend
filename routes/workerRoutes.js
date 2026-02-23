const express = require("express");
const router = express.Router();
const Worker = require("../models/worker");

// =============================
// 👷 REGISTER WORKER
// =============================
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    const existing = await Worker.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Worker already exists" });
    }

    const worker = new Worker({ email, password });
    await worker.save();

    res.json({ message: "Registered. Waiting for Admin approval." });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =============================
// 🔐 WORKER LOGIN
// =============================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    const worker = await Worker.findOne({ email, password });

    if (!worker) {
      return res.status(404).json({ message: "No account found" });
    }

    if (!worker.approved) {
      return res.status(403).json({ message: "Waiting for Admin approval" });
    }

    res.json({ message: "Login successful", worker });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =============================
// 🔔 GET PENDING WORKERS (ADMIN)
// =============================
router.get("/pending", async (req, res) => {
  try {
    const workers = await Worker.find({ approved: false });
    res.json(workers);
  } catch (err) {
    console.error("Fetch Pending Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =============================
// ✅ APPROVE WORKER (ADMIN)
// =============================
router.put("/approve/:id", async (req, res) => {
  try {
    const worker = await Worker.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true }
    );

    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    res.json({ message: "Worker approved", worker });
  } catch (err) {
    console.error("Approve Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
