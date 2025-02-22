const express = require("express");
const router = express.Router();
const childrenController = require("../controllers/childrenController");

router.post("/", childrenController.createChild);
router.post("/batch", childrenController.createChildrenBatch); 
router.put("/:id", childrenController.updateChild);
router.get("/:id", childrenController.getChildById);
router.get("/", childrenController.getChildrenByUserId);
router.delete("/:id", childrenController.deleteChild);

module.exports = router;