const express = require("express");
const router = express.Router();
const attemptedSetController = require("../controllers/attemptedSetController");
const {
  authenticateToken,
  authorizeRole,
  ROLES,
} = require("../middleware/authMiddleware");

router.post("/", authenticateToken, attemptedSetController.createAttemptedSet);
router.put(
  "/:id",
  authenticateToken,
  authorizeRole([ROLES.ADMIN]),
  attemptedSetController.updateAttemptedSet
);
router.get(
  "/",
  authenticateToken,
  attemptedSetController.getAttemptedSetsByFilters
);
router.get(
  "/:set_id",
  authenticateToken,
  attemptedSetController.getAttemptedSetBySetId
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole([ROLES.ADMIN]),
  attemptedSetController.deleteAttemptedSetById
);
router.delete(
  "/child/:child_id",
  attemptedSetController.deleteAttemptedSetsByChildId
);

module.exports = router;
