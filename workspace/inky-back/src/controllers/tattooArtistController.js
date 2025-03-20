const { validationResult } = require("express-validator");
const admin = require("firebase-admin");
const tattooArtistQueries = require("../queries/tattooArtistQueries");
const userQueries = require("../queries/userQueries");

// Create a new tattoo artist profile
/*
const createTattooArtist = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, phone, instagram_link, facebook_link, description, city } = req.body;
  const userUid = req.user.uid;

  try {
    const user = await admin.auth().getUser(userUid);
    const newTattooArtist = {
      user_id: userUid,
      title,
      phone,
      email: user.email,
      instagram_link: instagram_link || null,
      facebook_link: facebook_link || null,
      description: description || null,
      city: city || null,
    };

    const result = await tattooArtistQueries.createTattooArtist(newTattooArtist);
    res.status(201).json({
      message: "Tattoo artist profile created successfully!",
      userUid: result.user_id,
    });
  } catch (error) {
    console.error("Error creating tattoo artist:", error);
    res.status(500).json({ error: error.message });
  }
};
*/
// Create a new tattoo artist profile
const createTattooArtist = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, phone, instagram_link, facebook_link, description, city } = req.body;
  const userUid = req.user.uid;

  try {
    const user = await admin.auth().getUser(userUid);

    console.log("🟢 Received request for UID:", userUid);
    console.log("📝 Request body:", req.body);

    // Ensure required fields exist
    if (!title || !phone || !city) {
      return res.status(400).json({ error: "Title, phone, and city are required fields." });
    }

    const result = await tattooArtistQueries.createTattooArtist(
      userUid, // UID (string)
      title,
      phone,
      city,
      description || null,
      instagram_link || null,
      facebook_link || null
    );

    res.status(201).json({
      message: "Tattoo artist profile created successfully!",
      userUid: result.user_id,
    });
  } catch (error) {
    console.error("❌ Error creating tattoo artist:", error);
    res.status(500).json({ error: error.message });
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
  const { userUid } = req.params;

  // Make sure the authenticated user is updating their own profile
  if (!req.user || req.user.uid !== userUid) {
    return res.status(403).json({ error: "Unauthorized to update this profile." });
  }

  try {
    const updatedFields = req.body;
    const updatedArtist = await tattooArtistQueries.updateTattooArtist(userUid, updatedFields);
    res.status(200).json(updatedArtist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a tattoo artist
const deleteTattooArtist = async (req, res) => {
  const { userUid } = req.params;

  if (!req.user || req.user.uid !== userUid) {
    return res.status(403).json({ error: "Unauthorized to delete this artist profile." });
  }

  try {
    // Step 1: Delete artist profile from `tattoo_artists` table
    const result = await tattooArtistQueries.deleteTattooArtist(userUid);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Artist not found in database." });
    }

    console.log(`Deleted Tattoo Artist: ${userUid}`);

    // Step 2: Delete the user from Firebase Auth
    await admin.auth().deleteUser(userUid);
    console.log(`Deleted Firebase User: ${userUid}`);

    // Step 3: Delete the user from the `users` table
    await userQueries.deleteUser(userUid);
    console.log(`Deleted User from Database: ${userUid}`);

    return res.status(200).json({ message: "Tattoo artist and user account deleted successfully." });
  } catch (error) {
    console.error("Error deleting tattoo artist and user:", error);
    return res.status(500).json({ error: "Failed to delete tattoo artist and user." });
  }
};

module.exports = {
  createTattooArtist,
  getTattooArtists,
  getTattooArtistByUserUid,
  updateTattooArtist,
  deleteTattooArtist,
};
