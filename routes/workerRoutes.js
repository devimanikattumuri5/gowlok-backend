const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Worker = require("../models/worker");

// =============================
// 👷 ADMIN REGISTER WORKER
// =============================
router.post("/register", async (req, res) => {
  try {
    const { name, email, role, mobile } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and Email required" });
    }

    const existing = await Worker.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Worker already exists" });
    }

    // 🔹 Auto Generate Worker ID
    const workerId = "GW" + Date.now().toString().slice(-5);

    // 🔹 Auto Generate Random Password
    const rawPassword = Math.random().toString(36).slice(-8);

    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const worker = new Worker({
      name,
      email,
      role,
      mobile,
      workerId,
      password: hashedPassword,
      approved: false,
      firstLogin: true,
    });

    await worker.save();

    res.status(201).json({
      message: "Worker registered successfully",
      workerId,
      password: rawPassword, // show once
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
  try {
    const { email, password } = req.body;

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
        name: worker.name,
        email: worker.email,
        workerId: worker.workerId,
        role: worker.role,
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

    res.json({ message: "Worker approved successfully" });

  } catch (err) {
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
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;