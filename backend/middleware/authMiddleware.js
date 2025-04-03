const jwt = require("jsonwebtoken");
const { ROLES } = require("../config/roles");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Authentication required. No token provided." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token." });
    }
    req.user = user;
    next();
  });
};

const authorizeRole = (roles = []) => {
  if (typeof roles === "string") {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user || !req.user.role_id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (roles.length && !roles.includes(req.user.role_id)) {
      return res
        .status(403)
        .json({ message: "Forbidden - insufficient permissions" });
    }

    next();
  };
};

module.exports = { authenticateToken, authorizeRole, ROLES };
