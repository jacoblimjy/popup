const express = require("express");
const router = express.Router();
const childPerformanceController = require("../controllers/childPerformanceController");

router.get("/", childPerformanceController.getChildPerformanceByFilters);
router.get(
  "/overall/:child_id",
  childPerformanceController.getOverallChildPerformance
);

router.delete(
  "/:up_id",
  childPerformanceController.deleteChildPerformanceByUpId
);
router.delete(
  "/child/:child_id",
  childPerformanceController.deleteChildPerformanceByChildId
);

module.exports = router;
