const pool = require("../db/pool");
const TattooArtistPage = require("../models/tattooArtist");

// Create a new tattoo artist profile
const createTattooArtist = async (tattooArtist) => {
  try {
    const resultQuery = await pool.query(
      "INSERT INTO tattoo_artists (user_uid, title, phone, email, instagram_link, facebook_link) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [
        tattooArtist.user_uid,
        tattooArtist.title,
        tattooArtist.phone,
        tattooArtist.email,
        tattooArtist.instagram_link,
        tattooArtist.facebook_link,
      ]
    );
    return resultQuery.rows[0]; // Return the created tattoo artist record
  } catch (error) {
    console.error(`Queries : createTattooArtist error: ${error}`);
    throw error;
  }
};

// Get all tattoo artists
const getTattooArtists = async () => {
  try {
    const resultQuery = await pool.query(
      "SELECT * FROM tattoo_artists ORDER BY uid ASC"
    );
    return resultQuery.rows.map((row) => {
      return new TattooArtistPage(
        row.uid,
        row.user_uid,
        row.title,
        row.phone,
        row.email,
        row.instagram_link,
        row.facebook_link,
        row.created_at,
        row.updated_at
      );
    });
  } catch (error) {
    console.log(`getTattooArtists error: ${error}`);
    throw error;
  }
};

// Get a tattoo artist by user UID
const getTattooArtistByUserUid = async (userUid) => {
  try {
    const resultQuery = await pool.query(
      "SELECT * FROM tattoo_artists WHERE user_uid = $1",
      [userUid]
    );
    const result = resultQuery.rows[0];
    if (result) {
      return new TattooArtistPage(
        result.uid,
        result.user_uid,
        result.title,
        result.phone,
        result.email,
        result.instagram_link,
        result.facebook_link,
        result.created_at,
        result.updated_at
      );
    }
    return null; // Return null if not found
  } catch (error) {
    console.log(`getTattooArtistByUserUid error: ${error}`);
    throw error;
  }
};

// Update an existing tattoo artist profile
const updateTattooArtist = async (userUid, artistProfile) => {
  try {
    await pool.query(
      "UPDATE tattoo_artists SET title = $1, phone = $2, email = $3, instagram_link = $4, facebook_link = $5, updated_at = $6 WHERE user_uid = $7",
      [
        artistProfile.title,
        artistProfile.phone,
        artistProfile.email,
        artistProfile.instagramLink,
        artistProfile.facebookLink,
        new Date(), // Set updated_at to current date
        userUid,
      ]
    );
    return artistProfile; // Return the updated artist profile
  } catch (error) {
    console.log(`updateTattooArtist error: ${error}`);
    throw error;
  }
};

// Delete a tattoo artist profile
const deleteTattooArtist = async (user_uid) => {
  try {
    await pool.query("DELETE FROM tattoo_artists WHERE user_uid = $1", [
      user_uid,
    ]);
  } catch (error) {
    console.log(`deleteTattooArtist error: ${error}`);
    throw error;
  }
};

module.exports = {
  createTattooArtist,
  getTattooArtists,
  getTattooArtistByUserUid,
  updateTattooArtist,
  deleteTattooArtist,
};
