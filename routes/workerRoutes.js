const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
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

    const hashedPassword = await bcrypt.hash(password, 10);

    const worker = new Worker({
      email,
      password: hashedPassword,
    });

    await worker.save();

    res.status(201).json({
      message: "Registered. Waiting for Admin approval.",
    });

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
    const worker = await Worker.findOne({ email });

    if (!worker) {
      return res.status(404).json({ message: "No account found" });
    }

    const isMatch = await bcrypt.compare(password, worker.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!worker.approved) {
      return res.status(403).json({ message: "Waiting for Admin approval" });
    }

    res.json({
      message: "Login successful",
      worker: {
        _id: worker._id,
        email: worker.email,
        approved: worker.approved,
      },
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// =============================
// 🔔 GET PENDING WORKERS
// =============================
router.get("/pending", async (req, res) => {
  try {
    const workers = await Worker.find({ approved: false }).select("-password");
    res.json(workers);
  } catch (err) {
    console.error("Fetch Pending Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// =============================
// ✅ GET APPROVED WORKERS
// =============================
router.get("/approved", async (req, res) => {
  try {
    const workers = await Worker.find({ approved: true }).select("-password");
    res.json(workers);
  } catch (err) {
    console.error("Fetch Approved Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// =============================
// ✅ APPROVE WORKER
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

    res.json({ message: "Worker approved" });

  } catch (err) {
    console.error("Approve Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// =============================
// ❌ DELETE WORKER
// =============================
router.delete("/delete/:id", async (req, res) => {
  try {
    const worker = await Worker.findByIdAndDelete(req.params.id);

    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    res.json({ message: "Worker removed successfully" });

  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;