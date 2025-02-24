
const childrenService = require("../services/childrenService");

const createChild = async (req, res) => {
  try {
    // TODO: Check if theres bad request if education_level is missing
    const { userId, childName, age, education_level } = req.body;
    const childId = await childrenService.createChild(userId, childName, age, education_level);
    res.status(201).json({ childId, message: "Child created successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const createChildrenBatch = async (req, res) => {
  try {
    const { userId, children } = req.body;
    const createdChildren = await childrenService.createChildrenBatch(userId, children);
    res.status(201).json({ createdChildren, message: "Children created successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// TODO: Make it such that you dont need all the fields to update
// Either that or we just update all fields in the frontend
const updateChild = async (req, res) => {
  try {
    const { childName, age, education_level } = req.body;
    const { id } = req.params;
    await childrenService.updateChild(id, childName, age, education_level);
    res.json({ message: "Child updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getChildById = async (req, res) => {
  try {
    const { id } = req.params;
    const child = await childrenService.getChildById(id);
    res.json(child);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const getChildrenByUserId = async (req, res) => {
    try {
      const { user_id } = req.query;
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset) : 0;
  
      console.log(user_id, limit, offset);

      if (isNaN(limit) || isNaN(offset)) {
        return res.status(400).json({ message: "Invalid limit or offset value" });
      }
  
      const children = await childrenService.getChildrenByUserId(parseInt(user_id), limit, offset);
      res.json(children);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  

const deleteChild = async (req, res) => {
  try {
    const { id } = req.params;
    await childrenService.deleteChild(id);
    res.json({ message: "Child deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createChild,
  createChildrenBatch,
  updateChild,
  getChildById,
  getChildrenByUserId,
  deleteChild,
};