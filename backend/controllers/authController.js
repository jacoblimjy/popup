const bcrypt = require("bcrypt");
const db = require("../db");
const authService = require("../services/authService");
const { createChildrenBatch } = require("../services/childrenService");

const signup = async (req, res) => {
  try {
    const { username, email, children, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Username, email, and password are required" });
    }

    const [existingUsers] = await db.execute(
      "SELECT * FROM Users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const [roles] = await db.execute(
      "SELECT role_id FROM Roles WHERE role_id = 1"
    );

    if (roles.length === 0) {
      await db.execute(
        "INSERT INTO Roles (role_id, role_name) VALUES (1, 'parent')"
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      "INSERT INTO Users (username, email, password_hash, role_id, date_created) VALUES (?, ?, ?, 2, NOW())",
      [username, email, hashedPassword]
    );

    if (children && children.length > 0) {
      await createChildrenBatch(result.insertId, children);
    }

    const [users] = await db.execute("SELECT * FROM Users WHERE user_id = ?", [
      result.insertId,
    ]);

    const user = users[0];
    const token = authService.generateToken(user);

    res.status(201).json({
      message: "User created successfully",
      userId: result.insertId,
      username,
      email,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    try {
      const userData = await authService.loginUser(email, password);

      res.json({
        message: "Login successful",
        ...userData,
      });
    } catch (error) {
      return res.status(401).json({ message: error.message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const refreshToken = (req, res) => {
  try {
    const token = authService.refreshToken(req.user);
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  signup,
  login,
  refreshToken,
};
