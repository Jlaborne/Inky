const { pool } = require("../db/pool");
const resolveArtistId = require("../utils/resolveArtistId");

// ✅ Create a new portfolio
const createPortfolio = async (req, res) => {
  const { title, description } = req.body;
  const mainImageFile = req.file;

  if (!mainImageFile) {
    return res.status(400).json({ error: "Main image is required" });
  }

  try {
    const firebaseUid = req.user.uid;
    const artistId = await resolveArtistId(firebaseUid);

    const mainImageUrl = `http://localhost:5000/uploads/${mainImageFile.filename}`;

    console.log("🧩 Résolu artistId pour l'insertion du portfolio:", artistId);
    
    const result = await pool.query(
      `INSERT INTO portfolios (artist_id, title, main_image, description) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [artistId, title, mainImageUrl, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error creating portfolio:", error.message);
    res.status(500).json({ error: "Failed to create portfolio" });
  }
};

// ✅ Add a flash tattoo image to a portfolio
const addPortfolioImage = async (req, res) => {
  const { portfolioId } = req.params;
  const imageFile = req.file;

  if (!imageFile) {
    return res.status(400).json({ error: "Image file is required" });
  }

  try {
    const imageUrl = `http://localhost:5000/uploads/${imageFile.filename}`;

    const result = await pool.query(
      `INSERT INTO portfolio_images (portfolio_id, image_url, available) 
       VALUES ($1, $2, true) RETURNING *`,
      [portfolioId, imageUrl]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error adding portfolio image:", error.message);
    res.status(500).json({ error: "Failed to add portfolio image" });
  }
};

// ✅ Get portfolios for artist (from firebase UID in URL)
const getPortfoliosByArtist = async (req, res) => {
  try {
    const firebaseUid = req.params.artistUid;
    const artistId = await resolveArtistId(firebaseUid);

    const result = await pool.query(
      "SELECT * FROM portfolios WHERE artist_id = $1",
      [artistId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching portfolios:", error.message);
    res.status(500).json({ error: "Failed to fetch portfolios." });
  }
};

// ✅ Get portfolio + all flash images
const getPortfolioDetails = async (req, res) => {
  const { portfolioId } = req.params;

  try {
    const portfolioResult = await pool.query(
      `SELECT 
         p.id, p.title, p.description, p.main_image, p.created_at, u.uid AS artist_uid
       FROM portfolios p
       JOIN tattoo_artists t ON p.artist_id = t.id
       JOIN users u ON t.user_id = u.id
       WHERE p.id = $1`,
      [portfolioId]
    );

    if (portfolioResult.rows.length === 0) {
      return res.status(404).json({ error: "Portfolio not found" });
    }

    const imagesResult = await pool.query(
      `SELECT * FROM portfolio_images 
       WHERE portfolio_id = $1 
       ORDER BY created_at DESC`,
      [portfolioId]
    );

    res.status(200).json({
      ...portfolioResult.rows[0],
      images: imagesResult.rows,
    });
  } catch (error) {
    console.error("❌ Error fetching portfolio details:", error.message);
    res.status(500).json({ error: "Failed to fetch portfolio details." });
  }
};

module.exports = {
  createPortfolio,
  addPortfolioImage,
  getPortfoliosByArtist,
  getPortfolioDetails,
};
