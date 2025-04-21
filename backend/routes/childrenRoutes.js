const express = require("express");
const router = express.Router();
const childrenController = require("../controllers/childrenController");
const {
  authenticateToken,
  authorizeRole,
  ROLES,
} = require("../middleware/authMiddleware");

router.use(authenticateToken);

router.post("/", authenticateToken, childrenController.createChild);
router.post(
  "/batch",
  authenticateToken,
  childrenController.createChildrenBatch
);
router.put("/:id", authenticateToken, childrenController.updateChild);
router.get("/:id", authenticateToken, childrenController.getChildById);
router.get("/", authenticateToken, childrenController.getChildrenByUserId);
router.delete("/:id", authenticateToken, childrenController.deleteChild);

module.exports = router;
