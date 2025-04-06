const jwt = require("jsonwebtoken");
const User = require('../models/user.model.js')

// Middleware to verify token and check role
const verifyRole = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized, token missing" });
  }

  try {
    const decoded = jwt.verify(token, "mysecretekey");
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized, invalid token" });
    }

    if (decoded.role !== "admin" && decoded.role !== "manager") {
      console.log(decoded);
      return res
        .status(403)
        .json({ message: "you are not authorized to access this" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Unauthorized, invalid token", error });
  }
};

module.exports = verifyRole;
