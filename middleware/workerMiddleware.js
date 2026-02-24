// middleware/workerMiddleware.js

const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "GOWLOK_SECRET_KEY";

module.exports = function (req, res, next) {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Access denied. No token provided.",
    });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Invalid token format.",
    });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== "worker") {
      return res.status(403).json({
        message: "Worker access only.",
      });
    }

    req.worker = decoded;
    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
};