const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Worker = require("../models/Worker");


// ================= REGISTER WORKER =================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, mobile } = req.body;

    // check duplicate email
    const existingWorker = await Worker.findOne({ email });
    if (existingWorker) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // generate workerId
    const workerId = "GW" + Math.floor(100000 + Math.random() * 900000);

    const hashedPassword = await bcrypt.hash(password, 10);

    const worker = new Worker({
      name,
      email,
      password: hashedPassword,
      role,
      mobile,
      workerId,
      approved: false,
      firstLogin: true,
    });

    await worker.save();

    res.status(201).json({
      message: "Worker Registered Successfully",
      workerId: workerId,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ================= GET PENDING WORKERS =================
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


// ================= GET WORKER BY ID =================
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