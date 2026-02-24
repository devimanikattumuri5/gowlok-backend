const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const multer = require("multer");
const Worker = require("../models/worker");

// ================= MULTER CONFIG =================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// ================= REGISTER WORKER =================
router.post("/register", upload.single("photo"), async (req, res) => {
  try {
    const {
      name,
      email,
      role,
      mobile,
      address,
      aadhar,
      emergency,
      salary,
      gender,
      dob,
      joiningDate,
    } = req.body;

    const existing = await Worker.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Worker already exists" });
    }

    // Auto Generate Worker ID
    const workerId = "GW" + Date.now().toString().slice(-6);

    // Auto Generate Password
    const rawPassword = Math.random().toString(36).slice(-8);

    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const worker = new Worker({
      name,
      email,
      role,
      mobile,
      address,
      aadhar,
      emergency,
      salary,
      gender,
      dob: dob ? new Date(dob) : null,
      joiningDate: joiningDate ? new Date(joiningDate) : null,
      photo: req.file ? req.file.path : null,
      workerId,
      password: hashedPassword,
      approved: false,
      firstLogin: true,
    });

    await worker.save();

    res.status(201).json({
      message: "Worker registered successfully",
      workerId,
      password: rawPassword,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= WORKER LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { workerId, password } = req.body;

    const worker = await Worker.findOne({ workerId });
    if (!worker) {
      return res.status(400).json({ message: "Invalid Worker ID" });
    }

    const isMatch = await bcrypt.compare(password, worker.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    if (!worker.approved) {
      return res.status(403).json({ message: "Worker not approved yet" });
    }

    res.json({
      message: "Login successful",
      workerMongoId: worker._id,
      workerId: worker.workerId,
      firstLogin: worker.firstLogin,
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ================= GET ALL WORKERS =================
router.get("/", async (req, res) => {
  try {
    const workers = await Worker.find()
      .select("-password") // 🔐 Hide password
      .sort({ createdAt: -1 });

    res.json(workers);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
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

    res.json({ message: "Worker approved successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ================= DELETE WORKER =================
router.delete("/:id", async (req, res) => {
  try {
    const worker = await Worker.findByIdAndDelete(req.params.id);

    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    res.json({ message: "Worker deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ================= GET SINGLE WORKER =================
router.get("/:id", async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id).select("-password");

    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    res.json(worker);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;