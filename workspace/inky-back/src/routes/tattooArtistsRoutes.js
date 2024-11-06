const express = require("express");
const { check, validationResult } = require("express-validator");
const tattooArtistController = require("../controllers/tattooArtistController");
const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();

// Validation rules for tattoo artist data
const artistValidationRules = [
  check("title").notEmpty().withMessage("Title is required"),
  check("phone").notEmpty().withMessage("Phone number is required"),
  check("description").optional(),
  check("city").notEmpty().withMessage("City is required"),
  check("instagram_link").optional().isURL().withMessage("Valid Instagram link is required"),
  check("facebook_link").optional().isURL().withMessage("Valid Facebook link is required"),
];

// Create a new tattoo artist profile
router.post("/artists", artistValidationRules, authenticateToken, tattooArtistController.createTattooArtist);

// Get all tattoo artists
router.get("/artists", tattooArtistController.getTattooArtists);

// Get a tattoo artist by user UID
router.get("/artists/:userUid", tattooArtistController.getTattooArtistByUserUid);

// Update a tattoo artist profile
router.put("/artists/:userUid", artistValidationRules, authenticateToken, tattooArtistController.updateTattooArtist);

// Delete a tattoo artist
router.delete("/artists/:userUid", tattooArtistController.deleteTattooArtist);

module.exports = router;
