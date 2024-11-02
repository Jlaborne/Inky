const { validationResult } = require("express-validator");
const admin = require("firebase-admin");
const tattooArtistQueries = require("../queries/tattooArtistQueries");

// Create a new tattoo artist profile
const createTattooArtist = async (req, res) => {
  const errors = validationResult(req);
  console.log("Request body for createTattooArtist:", req.body);

  // Check for validation errors
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Destructure fields from the request body
  const { title, phone, instagramLink, facebookLink, description, city } =
    req.body;
  const userUid = req.user.uid; // Access UID from the decoded token

  try {
    // Fetch the user's email directly from Firebase Admin using userUid
    const user = await admin.auth().getUser(userUid);
    const email = user.email;

    // Construct the new tattoo artist profile object
    const newTattooArtist = {
      user_uid: userUid,
      title,
      phone,
      email, // Email fetched from Firebase
      instagram_link: instagramLink || null,
      facebook_link: facebookLink || null,
      description: description || null,
      city: city || null,
    };

    // Log the new tattoo artist data for debugging
    console.log("Creating tattoo artist with data:", newTattooArtist);

    // Insert the new tattoo artist profile into the database
    const result = await tattooArtistQueries.createTattooArtist(
      newTattooArtist
    );
    res.status(201).json({
      message: "Tattoo artist profile created successfully!",
      userUid: result.user_uid,
    });
  } catch (error) {
    // Enhanced error handling
    console.error("createTattooArtist error:", error);
    if (error.code === "auth/user-not-found") {
      return res.status(404).json({ error: "User not found" });
    } else if (error.code === "auth/invalid-user-token") {
      return res.status(401).json({ error: "Invalid user token" });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// Get all tattoo artists
const getTattooArtists = async (req, res) => {
  const { city, title } = req.query; // Capture optional query parameters

  try {
    // Fetch artists with filtering based on query parameters
    const artists = await tattooArtistQueries.getTattooArtists({ city, title });
    res.status(200).json(artists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a tattoo artist by user UID
const getTattooArtistByUserUid = async (req, res) => {
  const { userUid } = req.params;

  try {
    const artist = await tattooArtistQueries.getTattooArtistByUserUid(userUid);
    if (!artist) {
      return res.status(404).json({ message: "Tattoo artist not found" });
    }

    // Log the artist data for debugging
    console.log("Artist data fetched:", artist);

    // Construct the response object
    const response = {
      title: artist.title,
      phone: artist.phone,
      description: artist.description,
      city: artist.city,
      instagramLink: artist.instagramLink || null,
      facebookLink: artist.facebookLink || null,
    };

    res.status(200).json(response); // Return the formatted response
  } catch (error) {
    console.error("Error fetching tattoo artist:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update a tattoo artist profile
const updateTattooArtist = async (req, res) => {
  const { userUid } = req.params;
  const {
    title,
    phone,
    email,
    instagramLink,
    facebookLink,
    description,
    city,
  } = req.body;

  try {
    const updatedArtist = await tattooArtistQueries.updateTattooArtist(
      userUid,
      {
        title,
        phone,
        email,
        instagramLink,
        facebookLink,
        description,
        city,
      }
    );
    res.status(200).json(updatedArtist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a tattoo artist
const deleteTattooArtist = async (req, res) => {
  const { userUid } = req.params;

  try {
    await tattooArtistQueries.deleteTattooArtist(userUid);
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
