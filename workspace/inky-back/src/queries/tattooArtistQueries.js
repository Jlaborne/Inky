const { pool } = require("../db/pool");
const TattooArtistPage = require("../models/tattooArtist");

// Create a new tattoo artist profile
/*
const createTattooArtist = async (tattooArtist) => {
  const resultQuery = await pool.query(
    `INSERT INTO tattoo_artists (user_id, title, phone, instagram_link, facebook_link, city, description)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [tattooArtist.user_id, tattooArtist.title, tattooArtist.phone, tattooArtist.instagram_link, tattooArtist.facebook_link, tattooArtist.city, tattooArtist.description]
  );
  console.log("Inserted tattoo artist:", resultQuery.rows[0]);
  return resultQuery.rows[0];
};
*/
const createTattooArtist = async (uid, title, phone, city, description, instagramLink, facebookLink) => {
  const userQuery = `SELECT id FROM users WHERE uid = $1;`;

  try {
    console.log("🔍 Checking if user exists with UID:", uid);
    const userResult = await pool.query(userQuery, [uid]);

    if (userResult.rows.length === 0) {
      throw new Error("User not found in database");
    }

    const userId = userResult.rows[0].id; // Get the UUID
    console.log("✅ User found, inserting tattoo artist for ID:", userId);

    // 🔥 Debugging: Log the values before inserting
    console.log("📝 Tattoo artist data:", { userId, title, phone, city, description, instagramLink, facebookLink });

    const query = `
          INSERT INTO tattoo_artists (user_id, title, phone, city, description, instagram_link, facebook_link)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *;
      `;

    const values = [userId, title, phone, city, description, instagramLink, facebookLink];

    console.log("🛠 Executing INSERT with values:", values);

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("❌ Error creating tattoo artist:", error);
    throw error;
  }
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

const getTattooArtistByUserUid = async (userUid) => {
  try {
    console.log("🔍 Received userUid for lookup:", userUid);

    // Check if `userUid` is already a UUID (PostgreSQL UUIDs contain dashes "-")
    if (userUid.includes("-")) {
      console.log("✅ This is already a UUID, using directly.");
      const resultQuery = await pool.query(
        "SELECT * FROM tattoo_artists WHERE user_id = $1",
        [userUid] // Directly use UUID if it's already a UUID
      );
      return resultQuery.rows[0];
    }

    // If it's not a UUID, fetch the corresponding UUID from `users`
    console.log("🔍 Looking up UUID for Firebase UID:", userUid);
    const userQuery = `SELECT id FROM users WHERE uid = $1;`;
    const userResult = await pool.query(userQuery, [userUid]);

    if (userResult.rows.length === 0) {
      throw new Error("User not found in database");
    }

    const userId = userResult.rows[0].id; // Get the correct UUID
    console.log("✅ Found UUID:", userId);

    // Now fetch tattoo artist by the UUID
    const resultQuery = await pool.query("SELECT * FROM tattoo_artists WHERE user_id = $1", [userId]);

    return resultQuery.rows[0];
  } catch (error) {
    console.error("❌ Error fetching tattoo artist:", error);
    throw error;
  }
};

// Update an existing tattoo artist profile
const updateTattooArtist = async (userUid, artistProfile) => {
  try {
    console.log("🔍 Looking up UUID for Firebase UID:", userUid);

    // Step 1: Convert Firebase UID to UUID
    const userQuery = `SELECT id FROM users WHERE uid = $1;`;
    const userResult = await pool.query(userQuery, [userUid]);

    if (userResult.rows.length === 0) {
      throw new Error("User not found in database");
    }

    const userId = userResult.rows[0].id; // Extract the UUID
    console.log("✅ Found UUID:", userId);

    // Step 2: Update the tattoo artist profile
    const result = await pool.query(
      `UPDATE tattoo_artists
       SET title = $1, 
           phone = $2, 
           instagram_link = COALESCE($3, instagram_link), 
           facebook_link = COALESCE($4, facebook_link), 
           city = $5, 
           description = $6, 
           updated_at = $7
       WHERE user_id = $8 
       RETURNING *`,
      [
        artistProfile.title || null,
        artistProfile.phone || null,
        artistProfile.instagramLink || null,
        artistProfile.facebookLink || null,
        artistProfile.city || null,
        artistProfile.description || null,
        new Date(),
        userId, // Use UUID instead of Firebase UID
      ]
    );

    if (result.rowCount === 0) {
      throw new Error("No artist found with the given UID.");
    }

    console.log("🟢 DB Update Successful:", result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error("❌ Error updating tattoo artist:", error);
    throw error;
  }
};

const deleteTattooArtist = async (userUid) => {
  try {
    console.log("🔍 Looking up UUID for Firebase UID:", userUid);

    // Step 1: Retrieve the correct UUID from the users table
    const userQuery = `SELECT id FROM users WHERE uid = $1;`;
    const userResult = await pool.query(userQuery, [userUid]);

    if (userResult.rows.length === 0) {
      throw new Error("User not found in database");
    }

    const userId = userResult.rows[0].id; // Extract the UUID
    console.log("✅ Found UUID:", userId);

    // Step 2: Delete the tattoo artist by UUID
    const deleteArtistQuery = `DELETE FROM tattoo_artists WHERE user_id = $1 RETURNING *;`;
    const deleteArtistResult = await pool.query(deleteArtistQuery, [userId]);

    if (deleteArtistResult.rowCount === 0) {
      throw new Error("Tattoo artist profile not found");
    }

    console.log("🗑️ Tattoo artist profile deleted:", deleteArtistResult.rows[0]);

    // Step 3: Optionally delete the user after tattoo artist profile is removed
    const deleteUserQuery = `DELETE FROM users WHERE id = $1 RETURNING *;`;
    const deleteUserResult = await pool.query(deleteUserQuery, [userId]);

    if (deleteUserResult.rowCount === 0) {
      throw new Error("User not found or already deleted");
    }

    console.log("🗑️ User deleted:", deleteUserResult.rows[0]);

    return { message: "Tattoo artist and user deleted successfully" };
  } catch (error) {
    console.error("❌ Error deleting tattoo artist and user:", error);
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
