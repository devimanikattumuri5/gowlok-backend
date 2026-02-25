const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Worker = require("../models/worker");


// ================= REGISTER WORKER =================
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
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

    const existingWorker = await Worker.findOne({ email });
    if (existingWorker) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const workerId = "GW" + Math.floor(100000 + Math.random() * 900000);
    const hashedPassword = await bcrypt.hash(password, 10);

    const newWorker = new Worker({
      name,
      email,
      password: hashedPassword,
      role,
      mobile,
      address,
      aadhar,
      emergency,
      salary,
      gender,
      dob,
      joiningDate,
      workerId,
      approved: false,
      firstLogin: true,
    });

    await newWorker.save();

    res.status(201).json({
      message: "Worker Registered Successfully",
      workerId,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
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

    res.status(200).json({
      message: "Login Successful",
      worker: {
        id: worker._id,
        name: worker.name,
        workerId: worker.workerId,
        role: worker.role,
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
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
    res.status(500).json({ message: "Server Error" });
  }
});


// ================= GET APPROVED WORKERS =================
router.get("/approved", async (req, res) => {
  try {
    const workers = await Worker.find({ approved: true })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json(workers);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
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
    res.status(500).json({ message: "Server Error" });
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
    res.status(500).json({ message: "Server Error" });
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
    res.status(500).json({ message: "Server Error" });
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
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;