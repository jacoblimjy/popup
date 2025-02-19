const express = require('express');
const router = express.Router();
const db = require('../db');

router.get("/", (req, res) => {
  res.send("Welcome to the user route");
});

router.get("/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 + 1 AS solution");
    res.json({ solution: rows[0].solution });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;