const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../db");

const generateToken = (user) => {
  const payload = {
    userId: user.user_id,
    username: user.username,
    email: user.email,
    role_id: user.role_id,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" });

  return token;
};

const loginUser = async (email, password) => {
  const [users] = await db.execute("SELECT * FROM Users WHERE email = ?", [
    email,
  ]);

  if (users.length === 0) {
    throw new Error("Invalid credentials");
  }

  const user = users[0];

  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken(user);

  return {
    userId: user.user_id,
    username: user.username,
    email: user.email,
    role_id: user.role_id,
    token,
  };
};

const refreshToken = (user) => {
  return generateToken(user);
};

module.exports = {
  generateToken,
  loginUser,
  refreshToken,
};
