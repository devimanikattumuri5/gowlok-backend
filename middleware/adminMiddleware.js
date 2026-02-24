// middleware/adminMiddleware.js

const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "GOWLOK_SECRET_KEY";

module.exports = function (req, res, next) {

  const authHeader = req.headers.authorization;

  // 1️⃣ Check if token exists
  if (!authHeader) {
    return res.status(401).json({
      message: "Access denied. No token provided.",
    });
  }

  // 2️⃣ Check Bearer format
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Invalid token format.",
    });
  }

  try {
    // 3️⃣ Extract token
    const token = authHeader.split(" ")[1];

    // 4️⃣ Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 5️⃣ Check role
    if (decoded.role !== "admin") {
      return res.status(403).json({
        message: "Admin access only.",
      });
    }

    // 6️⃣ Attach admin info
    req.admin = decoded;

    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
};