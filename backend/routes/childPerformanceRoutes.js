const express = require("express");
const router = express.Router();
const childPerformanceController = require("../controllers/childPerformanceController");

router.post("/", childPerformanceController.createChildPerformance);
router.put("/:up_id", childPerformanceController.updateChildPerformance);
router.get("/:child_id", childPerformanceController.getChildPerformanceByChildId);
router.delete("/:up_id", childPerformanceController.deleteChildPerformance);

module.exports = router;