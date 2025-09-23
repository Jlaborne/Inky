const { pool } = require("../db/pool");

// Récupère un portfolio et ses images, avec le Firebase UID de l'artiste
const getPortfolioByIdWithImages = async (portfolioId) => {
  const portfolioQuery = `
    SELECT p.id, p.title, p.description, p.main_image, p.created_at, u.uid AS artist_uid
    FROM portfolios p
    JOIN tattoo_artists t ON p.artist_id = t.id
    JOIN users u ON t.user_id = u.id
    WHERE p.id = $1;
  `;

  const portfolioResult = await pool.query(portfolioQuery, [portfolioId]);
  if (portfolioResult.rows.length === 0) {
    throw new Error("Portfolio introuvable");
  }

  const imagesQuery = `
    SELECT * FROM portfolio_images
    WHERE portfolio_id = $1
    ORDER BY created_at DESC;
  `;

  const imagesResult = await pool.query(imagesQuery, [portfolioId]);

  return {
    ...portfolioResult.rows[0],
    images: imagesResult.rows,
  };
};

// Crée un nouveau portfolio pour un artiste identifié par son UID Firebase
const createPortfolio = async (
  firebaseUid,
  title,
  description,
  mainImageFilename,
  tagSlugs = []
) => {
  const mainImageUrl = `http://localhost:5000/uploads/${mainImageFilename}`;

  const insertQuery = `
    INSERT INTO portfolios (artist_id, title, main_image, description, tags)
    VALUES (
      (SELECT ta.id
       FROM tattoo_artists ta
       JOIN users u ON ta.user_id = u.id
       WHERE u.uid = $1),
      $2, $3, $4, $5::text[]
    )
    RETURNING *;
  `;

  const result = await pool.query(insertQuery, [
    firebaseUid,
    title,
    mainImageUrl,
    description || null,
    tagSlugs,
  ]);
  return result.rows[0];
};

// Ajoute une image dans un portfolio
const addImageToPortfolio = async (portfolioId, filename) => {
  const imageUrl = `http://localhost:5000/uploads/${filename}`;

  const insertQuery = `
    INSERT INTO portfolio_images (portfolio_id, image_url, available)
    VALUES ($1, $2, true)
    RETURNING *;
  `;

  const result = await pool.query(insertQuery, [portfolioId, imageUrl]);
  return result.rows[0];
};

// Supprime une image d’un portfolio
const deletePortfolioImage = async (imageId) => {
  const deleteQuery = `
    DELETE FROM portfolio_images
    WHERE id = $1
    RETURNING *;
  `;

  const result = await pool.query(deleteQuery, [imageId]);
  if (result.rows.length === 0) {
    throw new Error("Image introuvable ou déjà supprimée");
  }
  return result.rows[0];
};

// Supprime un portfolio et toutes ses images associées
const deletePortfolio = async (portfolioId) => {
  await pool.query(`DELETE FROM portfolio_images WHERE portfolio_id = $1`, [
    portfolioId,
  ]);

  const deleteQuery = `
    DELETE FROM portfolios
    WHERE id = $1
    RETURNING *;
  `;

  const result = await pool.query(deleteQuery, [portfolioId]);
  if (result.rows.length === 0) {
    throw new Error("Portfolio introuvable ou déjà supprimé");
  }
  return result.rows[0];
};

// Récupère tous les portfolios d'un artiste à partir de son Firebase UID
const getPortfoliosByArtistUid = async (firebaseUid) => {
  const query = `
    SELECT p.*
    FROM portfolios p
    JOIN tattoo_artists ta ON p.artist_id = ta.id
    JOIN users u ON ta.user_id = u.id
    WHERE u.uid = $1;
  `;

  const result = await pool.query(query, [firebaseUid]);
  return result.rows;
};

module.exports = {
  getPortfolioByIdWithImages,
  createPortfolio,
  addImageToPortfolio,
  deletePortfolio,
  deletePortfolioImage,
  getPortfoliosByArtistUid,
};
