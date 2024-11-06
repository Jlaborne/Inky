const { validationResult } = require("express-validator");
const admin = require("firebase-admin");
const tattooArtistQueries = require("../queries/tattooArtistQueries");

// Helper function to handle validation errors
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
};

// Create a new tattoo artist profile
const createTattooArtist = async (req, res) => {
  handleValidationErrors(req, res);
  
  const { title, phone, instagram_link, facebook_link, description, city } = req.body;
  const userUid = req.user.uid;

  try {
    const user = await admin.auth().getUser(userUid);
    const newTattooArtist = {
      user_uid: userUid,
      title,
      phone,
      email: user.email,
      instagram_link: instagram_link || null,
      facebook_link: facebook_link || null,
      description: description || null,
      city: city || null,
    };

    const result = await tattooArtistQueries.createTattooArtist(newTattooArtist);
    res.status(201).json({ message: "Tattoo artist profile created successfully!", userUid: result.user_uid });
  } catch (error) {
    console.error("Error creating tattoo artist:", error);
    const status = error.code === "auth/user-not-found" ? 404 : 500;
    res.status(status).json({ error: error.message });
  }
};

// Get all tattoo artists
const getTattooArtists = async (req, res) => {
  try {
    const artists = await tattooArtistQueries.getTattooArtists(req.query);
    res.status(200).json(artists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a tattoo artist by user UID
const getTattooArtistByUserUid = async (req, res) => {
  try {
    const artist = await tattooArtistQueries.getTattooArtistByUserUid(req.params.userUid);
    if (!artist) return res.status(404).json({ message: "Tattoo artist not found" });
    
    res.status(200).json({ ...artist }); // Send artist object directly
  } catch (error) {
    console.error("Error fetching tattoo artist:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update a tattoo artist profile
const updateTattooArtist = async (req, res) => {
  try {
    const updatedArtist = await tattooArtistQueries.updateTattooArtist(req.params.userUid, req.body);
    res.status(200).json(updatedArtist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a tattoo artist
const deleteTattooArtist = async (req, res) => {
  try {
    await tattooArtistQueries.deleteTattooArtist(req.params.userUid);
    res.status(200).send("Tattoo artist deleted");
  } catch (error) {
    res.status(500).send("Error deleting tattoo artist");
  }
};

module.exports = {
  createTattooArtist,
  getTattooArtists,
  getTattooArtistByUserUid,
  updateTattooArtist,
  deleteTattooArtist,
};
