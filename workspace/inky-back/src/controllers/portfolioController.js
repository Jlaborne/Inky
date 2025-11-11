const {
  createPortfolio,
  addImageToPortfolio,
  getPortfoliosByArtistUid,
  getPortfolioByIdWithImages,
  deletePortfolio,
  deletePortfolioImage,
} = require("../queries/portfolioQueries");

// Créer un nouveau portfolio
const createPortfolioController = async (req, res) => {
  const { title, description, tags } = req.body;
  const mainImageFile = req.file;

  if (!mainImageFile) {
    return res.status(400).json({ error: "Main image is required" });
  }

  let tagSlugs = [];
  if (typeof tags === "string" && tags !== "") {
    tagSlugs = tags.split(",");
  }

  try {
    const firebaseUid = req.user.uid;

    const portfolio = await createPortfolio(
      firebaseUid,
      title,
      description,
      mainImageFile.filename,
      tagSlugs
    );
    res.status(201).json(portfolio);
  } catch (error) {
    console.error("createPortfolioController :", error.message);
    res.status(500).json({ error: "Failed to create portfolio" });
  }
};

// Ajouter une image à un portfolio
const addPortfolioImageController = async (req, res) => {
  const { portfolioId } = req.params;
  const imageFile = req.file;

  if (!imageFile) {
    return res.status(400).json({ error: "Image file is required" });
  }

  try {
    const image = await addImageToPortfolio(portfolioId, imageFile.filename);
    res.status(201).json(image);
  } catch (error) {
    console.error("addPortfolioImageController :", error.message);
    res.status(500).json({ error: "Failed to add portfolio image" });
  }
};

// Récupérer tous les portfolios d'un artiste (via Firebase UID)
const getPortfoliosByArtistController = async (req, res) => {
  try {
    const firebaseUid = req.params.artistUid;
    const portfolios = await getPortfoliosByArtistUid(firebaseUid);
    res.status(200).json(portfolios);
  } catch (error) {
    console.error("getPortfoliosByArtistController :", error.message);
    res.status(500).json({ error: "Failed to fetch portfolios." });
  }
};

// Détails d’un portfolio + images
const getPortfolioDetailsController = async (req, res) => {
  try {
    const portfolio = await getPortfolioByIdWithImages(req.params.portfolioId);
    res.status(200).json(portfolio);
  } catch (error) {
    console.error("getPortfolioDetailsController :", error.message);
    res.status(500).json({ error: "Failed to fetch portfolio details." });
  }
};

const deletePortfolioController = async (req, res) => {
  try {
    const portfolioId = req.params.portfolioId;
    const deleted = await deletePortfolio(portfolioId);
    res.status(200).json({ message: "Portfolio supprimé", deleted });
  } catch (error) {
    console.error("eletePortfolioImageController :", error.message);
    res.status(500).json({ error: "Failed to delete portfolio" });
  }
};

const deletePortfolioImageController = async (req, res) => {
  try {
    const imageId = req.params.imageId;
    const deleted = await deletePortfolioImage(imageId);
    res.status(200).json({ message: "Image supprimée", deleted });
  } catch (error) {
    console.error("DeletePortfolioImageController :", error.message);
    res.status(500).json({ error: "Failed to delete image" });
  }
};

module.exports = {
  createPortfolio: createPortfolioController,
  addPortfolioImage: addPortfolioImageController,
  getPortfoliosByArtist: getPortfoliosByArtistController,
  getPortfolioDetails: getPortfolioDetailsController,
  deletePortfolio: deletePortfolioController,
  deletePortfolioImage: deletePortfolioImageController,
};
