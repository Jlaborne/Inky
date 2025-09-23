const express = require("express");
const router = express.Router();
const { pool } = require("../db/pool");

router.get("/tags", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT name, slug FROM public.tags ORDER BY name"
    );
    res.json(rows);
  } catch (e) {
    console.error("GET /tags error:", e);
    res.status(500).send("Server error");
  }
});

module.exports = router;
