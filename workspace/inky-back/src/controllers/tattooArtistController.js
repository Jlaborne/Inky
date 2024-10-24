const tattooArtistQueries = require("../queries/tattooArtistQueries");
const { validationResult } = require("express-validator");

const createTattooArtist = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { userUid, title, phone, email, instagramLink, facebookLink } =
    req.body;

  try {
    // Create the tattoo artist profile
    const newTattooArtist = {
      user_uid: userUid, // Reference the user UID from the request
      title: title,
      phone: phone,
      email: email,
      instagram_link: instagramLink || null, // Optional fields
      facebook_link: facebookLink || null,
    };

    // Call the query to insert the new tattoo artist
    const result = await tattooArtistQueries.createTattooArtist(
      newTattooArtist
    );
    res.status(201).json(result);
  } catch (error) {
    console.error("createTattooArtist error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getTattooArtists = async (req, res) => {
  try {
    const artists = await tattooArtistQueries.getTattooArtists();
    res.status(200).json(artists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTattooArtistByUserUid = async (req, res) => {
  const { userUid } = req.params;

  try {
    const artist = await tattooArtistQueries.getTattooArtistByUserUid(userUid);
    if (!artist) {
      return res.status(404).json({ message: "Tattoo artist not found" });
    }
    res.status(200).json(artist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTattooArtist = async (req, res) => {
  const { userUid } = req.params;
  const { title, phone, email, instagramLink, facebookLink } = req.body;

  try {
    const updatedArtist = await tattooArtistQueries.updateTattooArtist(
      userUid,
      {
        title,
        phone,
        email,
        instagramLink,
        facebookLink,
      }
    );
    res.status(200).json(updatedArtist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a TattooArtist
const deleteTattooArtist = async (req, res) => {
  try {
    const { userUid } = req.params;
    await tattooArtistQueries.deleteTattooArtist(userUid);
    res.status(200).send("TattooArtist deleted");
  } catch (error) {
    res.status(500).send("Error deleting TattooArtist");
  }
};

module.exports = {
  createTattooArtist,
  getTattooArtists,
  getTattooArtistByUserUid,
  updateTattooArtist,
  deleteTattooArtist,
};
