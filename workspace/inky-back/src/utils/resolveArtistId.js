const { pool } = require("../db/pool");

const resolveArtistId = async (userUid) => {
  try {
    console.log("🔍 Received userUid for lookup:", userUid);

    // 🔎 Si l’UID contient des tirets => c’est déjà un UUID
    if (userUid.includes("-")) {
      const artistResult = await pool.query(
        "SELECT id FROM tattoo_artists WHERE user_id = $1",
        [userUid]
      );

      if (artistResult.rows.length === 0) {
        throw new Error("Tattoo artist not found for UUID");
      }

      return artistResult.rows[0].id;
    }

    // Sinon c’est un Firebase UID => on récupère le UUID
    const userResult = await pool.query(
      "SELECT id FROM users WHERE uid = $1",
      [userUid]
    );

    if (userResult.rows.length === 0) {
      throw new Error("User not found for Firebase UID");
    }

    const userId = userResult.rows[0].id;

    const artistResult = await pool.query(
      "SELECT id FROM tattoo_artists WHERE user_id = $1",
      [userId]
    );

    if (artistResult.rows.length === 0) {
      throw new Error("Tattoo artist not found for Firebase UID");
    }

    return artistResult.rows[0].id;
  } catch (error) {
    console.error("❌ resolveArtistId error:", error.message);
    throw error;
  }
};

module.exports = resolveArtistId;
