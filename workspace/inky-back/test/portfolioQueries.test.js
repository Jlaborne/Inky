const fs = require("fs");
const path = require("path");

// On force FILES_DIR AVANT d'importer le module
const TEST_UPLOAD_DIR = path.resolve(__dirname, "../test-uploads");
process.env.FILES_DIR = TEST_UPLOAD_DIR;

// On s'assure que le dossier existe
if (!fs.existsSync(TEST_UPLOAD_DIR)) {
  fs.mkdirSync(TEST_UPLOAD_DIR, { recursive: true });
}

// Mock le pool Postgres utilisé dans src/queries/portfolioQueries.js
jest.mock("../src/db/pool", () => ({
  pool: {
    query: jest.fn(),
  },
}));

const { pool } = require("../src/db/pool");
const {
  deletePortfolioImage,
  deletePortfolio,
} = require("../src/queries/portfolioQueries");

describe("portfolioQueries - gestion des fichiers", () => {
  beforeEach(() => {
    // Reset des mocks avant chaque test
    pool.query.mockReset();

    // Nettoyage du dossier de test
    for (const file of fs.readdirSync(TEST_UPLOAD_DIR)) {
      fs.unlinkSync(path.join(TEST_UPLOAD_DIR, file));
    }
  });

  afterAll(() => {
    // Nettoyage final du dossier (optionnel)
    for (const file of fs.readdirSync(TEST_UPLOAD_DIR)) {
      fs.unlinkSync(path.join(TEST_UPLOAD_DIR, file));
    }
    fs.rmdirSync(TEST_UPLOAD_DIR);
  });

  test("deletePortfolioImage supprime l'entrée en DB et le fichier sur le disque", async () => {
    const imageId = 123;
    const filename = "test-image.jpg";
    const fileUrl = `http://localhost:5000/uploads/${filename}`;
    const filePath = path.join(TEST_UPLOAD_DIR, filename);

    // On crée un faux fichier dans le dossier d'uploads de test
    fs.writeFileSync(filePath, "fake image content");

    // On simule la réponse de DELETE ... RETURNING *;
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          id: imageId,
          image_url: fileUrl,
        },
      ],
    });

    const deletedImage = await deletePortfolioImage(imageId);

    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM portfolio_images"),
      [imageId]
    );

    expect(deletedImage.id).toBe(imageId);

    // Le fichier doit avoir été supprimé du filesystem
    const fileStillExists = fs.existsSync(filePath);
    expect(fileStillExists).toBe(false);
  });

  test("deletePortfolio supprime le portfolio, ses images en DB et tous les fichiers associés", async () => {
    const portfolioId = 456;

    const mainFilename = "main-image.jpg";
    const img1Filename = "image1.jpg";
    const img2Filename = "image2.jpg";

    const mainUrl = `http://localhost:5000/uploads/${mainFilename}`;
    const img1Url = `http://localhost:5000/uploads/${img1Filename}`;
    const img2Url = `http://localhost:5000/uploads/${img2Filename}`;

    const mainPath = path.join(TEST_UPLOAD_DIR, mainFilename);
    const img1Path = path.join(TEST_UPLOAD_DIR, img1Filename);
    const img2Path = path.join(TEST_UPLOAD_DIR, img2Filename);

    // On crée les faux fichiers
    fs.writeFileSync(mainPath, "fake main image");
    fs.writeFileSync(img1Path, "fake image 1");
    fs.writeFileSync(img2Path, "fake image 2");

    // deletePortfolio fait :
    // 1. SELECT image_url FROM portfolio_images WHERE portfolio_id = $1
    // 2. DELETE FROM portfolio_images WHERE portfolio_id = $1
    // 3. DELETE FROM portfolios WHERE id = $1 RETURNING *

    pool.query
      // 1) SELECT des images
      .mockResolvedValueOnce({
        rows: [{ image_url: img1Url }, { image_url: img2Url }],
      })
      // 2) DELETE des images (on s'en fiche du contenu)
      .mockResolvedValueOnce({ rows: [] })
      // 3) DELETE du portfolio et retour de main_image
      .mockResolvedValueOnce({
        rows: [
          {
            id: portfolioId,
            main_image: mainUrl,
          },
        ],
      });

    const deletedPortfolio = await deletePortfolio(portfolioId);

    // Vérif des appels DB
    expect(pool.query).toHaveBeenCalledTimes(3);

    expect(pool.query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("SELECT image_url"),
      [portfolioId]
    );

    expect(pool.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("DELETE FROM portfolio_images"),
      [portfolioId]
    );

    expect(pool.query).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining("DELETE FROM portfolios"),
      [portfolioId]
    );

    expect(deletedPortfolio.id).toBe(portfolioId);

    // Vérif des fichiers sur le disque
    expect(fs.existsSync(mainPath)).toBe(false);
    expect(fs.existsSync(img1Path)).toBe(false);
    expect(fs.existsSync(img2Path)).toBe(false);
  });
});
