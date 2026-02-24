const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Worker = require("../models/worker");


// ================= REGISTER WORKER =================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, mobile } = req.body;

    // Check duplicate email
    const existingWorker = await Worker.findOne({ email });
    if (existingWorker) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Generate Worker ID
    const workerId = "GW" + Math.floor(100000 + Math.random() * 900000);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newWorker = new Worker({
      name,
      email,
      password: hashedPassword,
      role,
      mobile,
      workerId,
      approved: false,
      firstLogin: true,
    });

    await newWorker.save();

    res.status(201).json({
      message: "Worker Registered Successfully",
      workerId: workerId,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ================= GET PENDING WORKERS =================
// IMPORTANT: This MUST come before /:id
router.get("/pending", async (req, res) => {
  try {
    const workers = await Worker.find({ approved: false })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json(workers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ================= GET ALL WORKERS =================
router.get("/", async (req, res) => {
  try {
    const workers = await Worker.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json(workers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ================= APPROVE WORKER =================
router.put("/approve/:id", async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);

    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    worker.approved = true;
    await worker.save();

    res.status(200).json({ message: "Worker Approved Successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ================= GET WORKER BY ID =================
// MUST come AFTER /pending
router.get("/:id", async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id)
      .select("-password");

    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    res.status(200).json(worker);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ================= DELETE WORKER =================
router.delete("/:id", async (req, res) => {
  try {
    const worker = await Worker.findByIdAndDelete(req.params.id);

    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    res.status(200).json({ message: "Worker Deleted Successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;