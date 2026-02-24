require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const cattleRoutes = require("./routes/cattleRoutes");
const workerRoutes = require("./routes/workerRoutes");
const adminRoutes = require("./routes/admin");

const app = express();

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// ================= ROUTES =================
app.use("/api/cattles", cattleRoutes);
app.use("/api/workers", workerRoutes);   // ✅ ONLY ONCE
app.use("/api/admin", adminRoutes);

// ================= TEST ROUTE =================
app.get("/", (req, res) => {
  res.send("GAOLOG Backend Running 🐄");
});

// ================= MONGODB CONNECTION =================
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => {
    console.error("MongoDB Connection Error ❌:", err);
    process.exit(1);
  });

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});