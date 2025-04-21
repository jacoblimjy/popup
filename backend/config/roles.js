require("dotenv").config();

const ROLES = {
  ADMIN: parseInt(process.env.ROLE_ID_ADMIN || "1"),
  PARENT: parseInt(process.env.ROLE_ID_PARENT || "2"),
  OTHER: parseInt(process.env.ROLE_ID_OTHER || "3"),
};

module.exports = {
  ROLES,
};
