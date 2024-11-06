const pool = require("../db/pool");

// Create a new portfolio
const createPortfolio = async (req, res) => {
  const { artistUid, title, description } = req.body;
  const mainImageFile = req.file;

  if (!mainImageFile) {
    return res.status(400).json({ error: "Main image is required" });
  }

  // Construct the URL for the main image
  //const mainImageUrl = `root/inky/uploads/${mainImageFile.filename}`;
  const mainImageUrl = `http://localhost:5000/uploads/${mainImageFile.filename}`
  
  try {
    const result = await pool.query(
      `INSERT INTO portfolios (artist_uid, title, main_image_url, description) VALUES ($1, $2, $3, $4) RETURNING *`,
      [artistUid, title, mainImageUrl, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating portfolio:", error);
    res.status(500).json({ error: "Failed to create portfolio" });
  }
};

// Add flash tattoo images to a portfolio
const addPortfolioImage = async (req, res) => {
  const { portfolioId } = req.params;
  const imageFile = req.file;

  if (!imageFile) {
    return res.status(400).json({ error: "Image file is required" });
  }

  // Construct URL for additional images
  const imageUrl = `http://localhost:5000/uploads/${imageFile.filename}`;

  try {
    const result = await pool.query(
      `INSERT INTO portfolio_images (portfolio_id, image_url, available) VALUES ($1, $2, $3) RETURNING *`,
      [portfolioId, imageUrl, true]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding portfolio image:", error);
    res.status(500).json({ error: "Failed to add portfolio image" });
  }
};

// Fetch all portfolios by artist
const getPortfoliosByArtist = async (req, res) => {
  const { artistUid } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM portfolios WHERE artist_uid = $1 ORDER BY created_at DESC`,
      [artistUid]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching portfolios:", error);
    res.status(500).json({ error: "Failed to fetch portfolios" });
  }
};

// Fetch portfolio details with all images
const getPortfolioDetails = async (req, res) => {
  const { portfolioId } = req.params;
  try {
    const portfolioResult = await pool.query(
      `SELECT * FROM portfolios WHERE id = $1`,
      [portfolioId]
    );
    const imagesResult = await pool.query(
      `SELECT * FROM portfolio_images WHERE portfolio_id = $1 ORDER BY created_at DESC`,
      [portfolioId]
    );

    res.status(200).json({
      ...portfolioResult.rows[0],
      images: imagesResult.rows,
    });
  } catch (error) {
    console.error("Error fetching portfolio details:", error);
    res.status(500).json({ error: "Failed to fetch portfolio details" });
  }
};

module.exports = {
  createPortfolio,
  addPortfolioImage,
  getPortfoliosByArtist,
  getPortfolioDetails,
};
