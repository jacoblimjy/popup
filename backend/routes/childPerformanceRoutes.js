const express = require("express");
const router = express.Router();
const childPerformanceController = require("../controllers/childPerformanceController");

router.post("/", childPerformanceController.createChildPerformance);
router.put("/:up_id", childPerformanceController.updateChildPerformance);
router.get("/:child_id/:topic_id", childPerformanceController.getChildPerformanceByChildIdAndTopicId);
router.delete("/:up_id", childPerformanceController.deleteChildPerformanceByUpId);
router.delete("/child/:child_id", childPerformanceController.deleteChildPerformanceByChildId);

module.exports = router;