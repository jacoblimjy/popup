const express = require("express");
const router = express.Router();
const childPerformanceController = require("../controllers/childPerformanceController");
const {
  authenticateToken,
  authorizeRole,
  ROLES,
} = require("../middleware/authMiddleware");

router.get(
  "/",
  authenticateToken,
  childPerformanceController.getChildPerformanceByFilters
);
router.delete(
  "/:up_id",
  authenticateToken,
  authorizeRole([ROLES.ADMIN]),
  childPerformanceController.deleteChildPerformanceByUpId
);
router.delete(
  "/child/:child_id",
  authenticateToken,
  authorizeRole([ROLES.ADMIN]),
  childPerformanceController.deleteChildPerformanceByChildId
);

module.exports = router;
