const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "GOWLOK_SECRET_KEY";

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;

  // Check if header exists
  if (!authHeader) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  // Check proper Bearer format
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Invalid token format." });
  }

  try {
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded; // contains id and role
    next();

  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};