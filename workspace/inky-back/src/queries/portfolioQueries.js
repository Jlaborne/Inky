const { pool } = require("../db/pool");

const insertPortfolioImage = async ({ artistId, imageUrl, description, available }) => {
  const query = `
    INSERT INTO portfolio_images (artist_id, image_url, description, available, created_at)
    VALUES ($1, $2, $3, $4, NOW())
    RETURNING *;
  `;
  const values = [artistId, imageUrl, description, available];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("Error inserting portfolio image:", error);
    throw error;
  }
};

const getPortfoliosByArtist = async (artistUid) => {
  try {
    console.log("🔍 Fetching UUID for Firebase UID:", artistUid);

    // Convert Firebase UID to UUID first
    const userQuery = `SELECT id FROM users WHERE uid = $1;`;
    const userResult = await pool.query(userQuery, [artistUid]);

    if (userResult.rows.length === 0) {
      throw new Error("User not found in database");
    }

    const artistId = userResult.rows[0].id; // Get the correct UUID
    console.log("✅ Found artist UUID:", artistId);

    // Now fetch portfolios using the UUID
    const result = await pool.query("SELECT * FROM portfolios WHERE artist_id = $1", [artistId]);

    console.log("📝 Portfolios fetched:", result.rows);
    return result.rows;
  } catch (error) {
    console.error("❌ Error fetching portfolios:", error);
    throw error;
  }
};

module.exports = {
  insertPortfolioImage,
  getPortfoliosByArtist,
};
