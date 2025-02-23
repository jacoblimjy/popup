const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../db");

// TODO: Refactor into Controllers and Services
// TODO: Add error handling

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

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
      "INSERT INTO Users (username, email, password_hash, role_id, date_created) VALUES (?, ?, ?, 1, NOW())",
      [username, email, hashedPassword]
    );

    // TODO: Add secret key to .env file
    // Return JWT Token as cookie
    // const token = jwt.sign({ userId: result.insertId }, process.env.JWT_SECRET);
    // res.cookie("token", token, {
    //   httpOnly: true,
    //   sameSite: "strict",
    // });

    res.status(201).json({
      userId: result.insertId,
      message: "User created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await db.execute("SELECT * FROM Users WHERE email = ?", [
      email,
    ]);

    const user = users[0];
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // TODO: Add secret key to .env file
    // Return JWT Token as cookie
    // const token = jwt.sign({ userId: result.insertId }, process.env.JWT_SECRET);
    // res.cookie("token", token, {
    //   httpOnly: true,
    //   sameSite: "strict",
    // });

    res.json({
      message: "Login successful",
      userId: user.user_id,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
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

router.put("/:id", async (req, res) => {
  try {
    const { username, email } = req.body;
    const userId = req.params.id;

    const [users] = await db.execute("SELECT * FROM Users WHERE user_id = ?", [
      userId,
    ]);

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const [result] = await db.execute(
      "UPDATE Users SET username = ?, email = ? WHERE user_id = ?",
      [username, email, userId]
    );

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

router.delete("/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const [users] = await db.execute("SELECT * FROM Users WHERE user_id = ?", [
      userId,
    ]);

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const [result] = await db.execute("DELETE FROM Users WHERE user_id = ?", [
      userId,
    ]);

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
