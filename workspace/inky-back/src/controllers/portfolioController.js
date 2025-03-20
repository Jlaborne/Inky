const { pool } = require("../db/pool");
const portfolioQueries = require("../queries/portfolioQueries");

// Create a new portfolio
const createPortfolio = async (req, res) => {
  const { artistUid, title, description } = req.body;
  const mainImageFile = req.file;

  if (!mainImageFile) {
    return res.status(400).json({ error: "Main image is required" });
  }

  // Construct the URL for the main image
  const mainImageUrl = `http://localhost:5000/uploads/${mainImageFile.filename}`;

  try {
    // 🔍 First, get the corresponding artist ID from tattoo_artists
    console.log("🔍 Checking artist ID for Firebase UID:", artistUid);
    const artistQuery = `
      SELECT id FROM tattoo_artists 
      WHERE user_id = (SELECT id FROM users WHERE uid = $1);
    `;
    const artistResult = await pool.query(artistQuery, [artistUid]);

    if (artistResult.rows.length === 0) {
      return res.status(400).json({ error: "Tattoo artist profile does not exist. Please create it first." });
    }

    const artistId = artistResult.rows[0].id;
    console.log("✅ Found artist ID:", artistId);

    // ✅ Insert portfolio using the correct artist ID
    const result = await pool.query(
      `INSERT INTO portfolios (artist_id, title, main_image, description) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [artistId, title, mainImageUrl, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error creating portfolio:", error);
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
    const result = await pool.query(`INSERT INTO portfolio_images (portfolio_id, image_url, available) VALUES ($1, $2, $3) RETURNING *`, [portfolioId, imageUrl, true]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding portfolio image:", error);
    res.status(500).json({ error: "Failed to add portfolio image" });
  }
};

// Fetch all portfolios by artist
const getPortfoliosByArtist = async (req, res) => {
  try {
    if (!req.user || !req.user.uid) {
      return res.status(400).json({ error: "User authentication is required." });
    }

    const userUid = req.user.uid;
    console.log("🟢 Fetching portfolios for Firebase UID:", userUid);

    // 🔍 Fetch `artist_id` from `tattoo_artists`
    const artistQuery = `SELECT id FROM tattoo_artists WHERE user_id = (SELECT id FROM users WHERE uid = $1);`;
    const artistResult = await pool.query(artistQuery, [userUid]);

    if (artistResult.rows.length === 0) {
      console.error("🚨 No tattoo artist found for this UID");
      return res.status(404).json({ error: "Tattoo artist profile not found" });
    }

    const artistId = artistResult.rows[0].id;
    console.log("✅ Found artist UUID:", artistId);

    // 🔍 Fetch portfolios using `artist_id`
    const portfolioQuery = `SELECT * FROM portfolios WHERE artist_id = $1;`;
    const portfolioResult = await pool.query(portfolioQuery, [artistId]);

    console.log("📝 Portfolios fetched:", portfolioResult.rows);
    res.status(200).json(portfolioResult.rows);
  } catch (error) {
    console.error("❌ Error fetching portfolios:", error.message);
    res.status(500).json({ error: "Failed to fetch portfolios." });
  }
};

// Fetch portfolio details with all images
const getPortfolioDetails = async (req, res) => {
  const { portfolioId } = req.params;
  try {
    const portfolioResult = await pool.query(`SELECT * FROM portfolios WHERE id = $1`, [portfolioId]);
    const imagesResult = await pool.query(`SELECT * FROM portfolio_images WHERE portfolio_id = $1 ORDER BY created_at DESC`, [portfolioId]);

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
