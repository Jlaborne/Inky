const express = require("express");
const { check } = require("express-validator");
const tattooArtistController = require("../controllers/tattooArtistController");
const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();

// Routes for tattoo artist profiles

// Create a new tattoo artist profile
router.post(
  "/artists",
  [
    check("userUid").notEmpty().withMessage("User UID is required"),
    check("title").notEmpty().withMessage("Title is required"),
    check("phone").notEmpty().withMessage("Phone number is required"),
    check("email").isEmail().withMessage("Valid email is required"),
    check("instagramLink")
      .optional()
      .isURL()
      .withMessage("Valid Instagram link is required"),
    check("facebookLink")
      .optional()
      .isURL()
      .withMessage("Valid Facebook link is required"),
  ],
  authenticateToken,
  tattooArtistController.createTattooArtist
);

// Get all tattoo artists
router.get("/artists", tattooArtistController.getTattooArtists);

// Get a tattoo artist by user UID
router.get(
  "/artists/:userUid",
  tattooArtistController.getTattooArtistByUserUid
);

// Update a tattoo artist profile
router.put(
  "/artists/:userUid",
  [
    check("title").optional().notEmpty().withMessage("Title cannot be empty"),
    check("phone")
      .optional()
      .notEmpty()
      .withMessage("Phone number cannot be empty"),
    check("email").optional().isEmail().withMessage("Valid email is required"),
    check("instagramLink")
      .optional()
      .isURL()
      .withMessage("Valid Instagram link is required"),
    check("facebookLink")
      .optional()
      .isURL()
      .withMessage("Valid Facebook link is required"),
  ],
  authenticateToken,
  tattooArtistController.updateTattooArtist
);

router.delete("/artists/:userUid", tattooArtistController.deleteTattooArtist);

module.exports = router;
