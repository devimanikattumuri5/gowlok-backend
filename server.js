require("dotenv").config();   // 👈 VERY IMPORTANT

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const cattleRoutes = require("./routes/cattleRoutes");
const workerRoutes = require("./routes/workerRoutes");
const adminRoutes = require("./routes/admin");   // 👈 ADD THIS

const app = express();

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api/workers", require("./routes/workerRoutes"));


// ================= MONGODB CONNECTION =================
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => {
    console.error("MongoDB Connection Error ❌:", err);
    process.exit(1);
  });

// ================= TEST ROUTE =================
app.get("/", (req, res) => {
  res.send("GAOLOG Backend Running 🐄");
});

// ================= ROUTES =================
app.use("/api/cattles", cattleRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/admin", adminRoutes);   // 👈 REGISTER HERE

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});