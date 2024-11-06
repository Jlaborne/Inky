const express = require("express");
const router = express.Router();
const portfolioController = require("../controllers/portfolioController");
const upload = require("../middleware/multer");

// Route to create a new portfolio
router.post("/portfolios", upload.single("mainImage"), portfolioController.createPortfolio);

// Route to add an image to a portfolio
router.post("/portfolios/:portfolioId/images", upload.single("image"), portfolioController.addPortfolioImage);

// Route to fetch all portfolios for an artist
router.get("/artists/:artistUid/portfolios", portfolioController.getPortfoliosByArtist);

// Route to fetch portfolio details
router.get("/portfolios/:portfolioId", portfolioController.getPortfolioDetails);

module.exports = router;
