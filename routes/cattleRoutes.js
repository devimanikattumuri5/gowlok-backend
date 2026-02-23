const express = require("express");
const router = express.Router();
const Cattle = require("../models/cattle");

// ➕ Add Cattle
router.post("/add", async (req, res) => {
  try {
    const cattle = new Cattle(req.body);
    await cattle.save();
    res.status(201).json(cattle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📥 Get All Cattles
router.get("/", async (req, res) => {
  try {
    const cattles = await Cattle.find();
    res.json(cattles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
