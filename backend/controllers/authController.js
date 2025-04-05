const bcrypt = require("bcrypt");
const db = require("../db");
const authService = require("../services/authService");
const { createChildrenBatch } = require("../services/childrenService");
const { ROLES } = require("../config/roles");
const { asyncHandler, ApiError } = require("../utils/errorHandler");

const signup = asyncHandler(async (req, res) => {
  const { username, email, children, password } = req.body;

  if (!username || !email || !password) {
    throw new ApiError(400, "Username, email, and password are required");
  }

  const [existingUsers] = await db.execute(
    "SELECT * FROM Users WHERE email = ?",
    [email]
  );

  if (existingUsers.length > 0) {
    throw new ApiError(400, "Email already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [result] = await db.execute(
    "INSERT INTO Users (username, email, password_hash, role_id, date_created) VALUES (?, ?, ?, ?, NOW())",
    [username, email, hashedPassword, ROLES.PARENT]
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
    success: true,
    message: "User created successfully",
    userId: result.insertId,
    username,
    email,
    token,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  try {
    const userData = await authService.loginUser(email, password);

    res.json({
      success: true,
      message: "Login successful",
      ...userData,
    });
  } catch (error) {
    throw new ApiError(401, error.message);
  }
});

const refreshToken = asyncHandler(async (req, res) => {
  const token = authService.refreshToken(req.user);
  res.json({
    success: true,
    token,
  });
});

module.exports = {
  signup,
  login,
  refreshToken,
};
