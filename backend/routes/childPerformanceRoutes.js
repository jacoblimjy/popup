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
router.get(
  "/overall/:child_id",
  authenticateToken,
  childPerformanceController.getOverallChildPerformance
);
router.get(
  "/recommendation/:child_id",
  authenticateToken,
  childPerformanceController.getChildPerformanceRecommendation
)
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
