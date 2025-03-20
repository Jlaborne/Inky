const multer = require("multer");
const path = require("path");

// Configuration de stockage pour Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, "../uploads")); // Chemin absolu vers le dossier uploads
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname); // Nom unique pour chaque fichier
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
