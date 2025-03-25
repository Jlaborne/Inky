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

const getPortfoliosByArtist = async (firebaseUid) => {
  const artistQuery = `
    SELECT id FROM tattoo_artists 
    WHERE user_id = (SELECT id FROM users WHERE uid = $1);
  `;
  const artistResult = await pool.query(artistQuery, [firebaseUid]);

  if (artistResult.rows.length === 0) {
    throw new Error("Tattoo artist profile not found");
  }

  const artistId = artistResult.rows[0].id;

  const result = await pool.query(
    `SELECT * FROM portfolios WHERE artist_id = $1`,
    [artistId]
  );

  return result.rows;
};

module.exports = {
  insertPortfolioImage,
  getPortfoliosByArtist,
};
