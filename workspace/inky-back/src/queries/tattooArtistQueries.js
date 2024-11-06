const pool = require("../db/pool");
const TattooArtistPage = require("../models/tattooArtist");

// Create a new tattoo artist profile
const createTattooArtist = async (tattooArtist) => {
  const resultQuery = await pool.query(
    `INSERT INTO tattoo_artists (user_uid, title, phone, email, instagram_link, facebook_link, city, description)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [
      tattooArtist.user_uid,
      tattooArtist.title,
      tattooArtist.phone,
      tattooArtist.email,
      tattooArtist.instagram_link,
      tattooArtist.facebook_link,
      tattooArtist.city,
      tattooArtist.description
    ]
  );
  console.log("Inserted tattoo artist:", resultQuery.rows[0]);
  return resultQuery.rows[0];
};

// Get all tattoo artists with optional filtering
const getTattooArtists = async ({ city, title }) => {
  const query = `
    SELECT * FROM tattoo_artists
    WHERE ($1::text IS NULL OR city ILIKE $1)
    AND ($2::text IS NULL OR title ILIKE $2)
  `;
  const values = [city ? `%${city}%` : null, title ? `%${title}%` : null];
  const result = await pool.query(query, values);
  console.log("Fetched tattoo artists:", result.rows);
  return result.rows;
};

// Get a tattoo artist by user UID
const getTattooArtistByUserUid = async (userUid) => {
  const resultQuery = await pool.query("SELECT * FROM tattoo_artists WHERE user_uid = $1", [userUid]);
  const result = resultQuery.rows[0];
  if (!result) return null;

  return new TattooArtistPage(
    result.uid,
    result.user_uid,
    result.title,
    result.phone,
    result.email,
    result.description,
    result.city,
    result.instagram_link,
    result.facebook_link,
    result.created_at,
    result.updated_at
  );
};

// Update an existing tattoo artist profile
const updateTattooArtist = async (userUid, artistProfile) => {
  const result = await pool.query(
    `UPDATE tattoo_artists
     SET title = $1, phone = $2, email = $3, instagram_link = $4, facebook_link = $5, city = $6, description = $7, updated_at = $8
     WHERE user_uid = $9 RETURNING *`,
    [
      artistProfile.title,
      artistProfile.phone,
      artistProfile.email,
      artistProfile.instagramLink,
      artistProfile.facebookLink,
      artistProfile.city,
      artistProfile.description,
      new Date(),
      userUid
    ]
  );
  console.log("Updated tattoo artist:", result.rows[0]);
  return result.rows[0];
};

// Delete a tattoo artist profile
const deleteTattooArtist = async (user_uid) => {
  await pool.query("DELETE FROM tattoo_artists WHERE user_uid = $1", [user_uid]);
  console.log("Deleted tattoo artist with user UID:", user_uid);
};

module.exports = {
  createTattooArtist,
  getTattooArtists,
  getTattooArtistByUserUid,
  updateTattooArtist,
  deleteTattooArtist,
};
