const express = require("express");
const router = express.Router();
const attemptedSetController = require("../controllers/attemptedSetController");

router.post("/", attemptedSetController.createAttemptedSet);
router.put("/:id", attemptedSetController.updateAttemptedSet);
router.get("/", attemptedSetController.getAttemptedSetsByFilters);
router.get("/:set_id", attemptedSetController.getAttemptedSetBySetId);
router.delete("/:id", attemptedSetController.deleteAttemptedSetById);
router.delete("/child/:child_id", attemptedSetController.deleteAttemptedSetsByChildId);

module.exports = router;