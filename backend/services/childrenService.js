const db = require("../db");

const createChild = async (userId, child_name, age, education_level = 1) => {
  const [existingChildren] = await db.execute(
    "SELECT * FROM Children WHERE user_id = ? AND child_name = ?",
    [userId, child_name]
  );

  if (existingChildren.length > 0) {
    throw new Error("Child name already exists under the same parent");
  }

  const [result] = await db.execute(
    "INSERT INTO Children (user_id, child_name, age, education_level, date_created) VALUES (?, ?, ?, ?, NOW())",
    [userId, child_name, age, education_level]
  );

  return result.insertId;
};

const createChildrenBatch = async (userId, children) => {
    // Create a list of children names
    const childNames = children.map(child => child.child_name);
  
    // Validate all children names in a single query
    const placeholders = childNames.map(() => '?').join(',');
    const [existingChildren] = await db.execute(
      `SELECT child_name FROM Children WHERE user_id = ? AND child_name IN (${placeholders})`,
      [userId, ...childNames]
    );
  
    if (existingChildren.length > 0) {
      const existingNames = existingChildren.map(child => child.child_name).join(', ');
      throw new Error(`Child names "${existingNames}" already exist under the same parent`);
    }
  
    // If all children are valid, insert them
    const createdChildren = [];
    for (const child of children) {
      const { child_name, age, education_level = 1 } = child; // Default education_level to 1 if not provided
      const childId = await createChild(userId, child_name, age, education_level);
      createdChildren.push({ childId, child_name, age, education_level });
    }
    return createdChildren;
  };

const updateChild = async (childId, child_name, age, education_level) => {
  await db.execute(
    "UPDATE Children SET child_name = ?, age = ?, education_level = ? WHERE child_id = ?",
    [child_name, age, education_level, childId]
  );
};

const getChildById = async (childId) => {
  const [children] = await db.execute(
    "SELECT * FROM Children WHERE child_id = ?",
    [childId]
  );

  if (children.length === 0) {
    throw new Error("Child not found");
  }

  return children[0];
};

const getChildrenByUserId = async (userId, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const query = `SELECT * FROM Children WHERE user_id = ? LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;
    const [children] = await db.execute(query, [userId]);
  
    return children;
  };
  
const deleteChild = async (childId) => {
  await db.execute("DELETE FROM Children WHERE child_id = ?", [childId]);
};

module.exports = {
  createChild,
  createChildrenBatch,
  updateChild,
  getChildById,
  getChildrenByUserId,
  deleteChild,
};