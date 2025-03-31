const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../db");
const {
  authenticateToken,
  authorizeRole,
  ROLES,
} = require("../middleware/authMiddleware");

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const [users] = await db.execute(
      "SELECT user_id, username, email, role_id, date_created FROM Users WHERE user_id = ?",
      [req.params.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(users[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user.userId !== parseInt(userId)) {
      return res
        .status(403)
        .json({ message: "Forbidden - you can only update your own profile" });
    }

    const { username, email, password } = req.body;

    const [users] = await db.execute("SELECT * FROM Users WHERE user_id = ?", [
      userId,
    ]);
    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    let updateQuery =
      "UPDATE Users SET username = ?, email = ? WHERE user_id = ?";
    let params = [username, email, userId];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery = `
        UPDATE Users
        SET username = ?, email = ?, password_hash = ?
        WHERE user_id = ?
      `;
      params = [username, email, hashedPassword, userId];
    }

    await db.execute(updateQuery, params);

    res.json({
      message: "User updated successfully",
      userId: userId,
      username: username,
      email: email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user.userId !== parseInt(userId)) {
      return res
        .status(403)
        .json({ message: "Forbidden - you can only delete your own profile" });
    }

    const [users] = await db.execute("SELECT * FROM Users WHERE user_id = ?", [
      userId,
    ]);

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    await db.execute("DELETE FROM Users WHERE user_id = ?", [userId]);

    res.json({
      message: "User deleted successfully",
      userId: userId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;
