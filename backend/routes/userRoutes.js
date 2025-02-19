const express = require('express');
const router = express.Router();
const db = require('../db');

router.get("/", (req, res) => {
  res.send("Welcome to the user route");
});

module.exports = router;