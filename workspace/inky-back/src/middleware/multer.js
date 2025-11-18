const multer = require("multer");
const path = require("path");

// Dossier d'upload : variable d'env Docker ou fallback local
const uploadDir = process.env.FILES_DIR || path.resolve(__dirname, "../../uploads");

// Configuration Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

module.exports = upload;
