const pool = require("../db/pool");
//check if used

const insertPortfolioImage = async ({
  artistId,
  imageUrl,
  description,
  available,
}) => {
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

module.exports = {
  insertPortfolioImage,
};
