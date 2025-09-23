const { pool } = require("../db/pool");
const TattooArtist = require("../models/tattooArtist");

// Créer un nouveau profil de tatoueur à partir du Firebase UID
const createTattooArtist = async (
  uid,
  title,
  phone,
  city,
  description,
  instagramLink,
  facebookLink
) => {
  try {
    // Récupère l'UUID (id) de l'utilisateur depuis son Firebase UID
    const userQuery = `SELECT id FROM users WHERE uid = $1;`;
    const userResult = await pool.query(userQuery, [uid]);

    if (userResult.rows.length === 0) {
      throw new Error("Utilisateur introuvable dans la base de données.");
    }

    const userId = userResult.rows[0].id;

    // Insère le nouveau tatoueur en base
    const insertQuery = `
      INSERT INTO tattoo_artists (user_id, title, phone, city, description, instagram_link, facebook_link)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [
      userId,
      title,
      phone,
      city,
      description,
      instagramLink,
      facebookLink,
    ];
    const result = await pool.query(insertQuery, values);

    // On récupère aussi le Firebase UID et on retourne une instance de TattooArtist
    return new TattooArtist({ ...result.rows[0], uid });
  } catch (error) {
    console.error("Erreur lors de la création du tatoueur :", error);
    throw error;
  }
};

const getTattooArtists = async ({ city, tagSlugs = [] }) => {
  const cityParam = city || null;

  if (!tagSlugs || tagSlugs.length === 0) {
    // ---- Cas sans tags: simple filtre ville/titre
    const query = `
      SELECT ta.*, u.uid
      FROM public.tattoo_artists ta
      JOIN public.users u ON ta.user_id = u.id
      WHERE ($1::text IS NULL OR lower(ta.city) LIKE lower($1) || '%')
      ORDER BY ta.title;
    `;
    const values = [cityParam];
    const result = await pool.query(query, values);
    return result.rows.map((row) => new TattooArtist(row));
  }

  // ---- Cas avec tags
  const queryWithTags = `
    SELECT DISTINCT ta.*, u.uid
    FROM public.tattoo_artists ta
    JOIN public.users u ON u.id = ta.user_id
    JOIN public.portfolios p ON p.artist_id = ta.id
    WHERE ($1::text IS NULL OR lower(ta.city) LIKE lower($1) || '%')
      AND p.tags && $2
    ORDER BY ta.title;
  `;
  const valuesWithTags = [cityParam, tagSlugs];
  const result = await pool.query(queryWithTags, valuesWithTags);

  return result.rows.map((row) => new TattooArtist(row));
};

// Récupérer un tatoueur unique via le Firebase UID
const getTattooArtistByUserUid = async (firebaseUid) => {
  try {
    const query = `
      SELECT ta.*, u.uid
      FROM tattoo_artists ta
      JOIN users u ON ta.user_id = u.id
      WHERE u.uid = $1;
    `;
    const result = await pool.query(query, [firebaseUid]);

    if (result.rows.length === 0) {
      throw new Error("Tatoueur introuvable");
    }

    return new TattooArtist(result.rows[0]);
  } catch (error) {
    console.error("Erreur getTattooArtistByUserUid :", error);
    throw error;
  }
};

// Met à jour un tatoueur via son Firebase UID
const updateTattooArtist = async (firebaseUid, artistProfile) => {
  try {
    const existingArtist = await getTattooArtistByUserUid(firebaseUid);
    existingArtist.update(artistProfile);

    const result = await pool.query(
      `UPDATE tattoo_artists
       SET title = $1,
           phone = $2,
           instagram_link = $3,
           facebook_link = $4,
           city = $5,
           description = $6,
           updated_at = $7
       WHERE id = $8
       RETURNING *;`,
      [
        existingArtist.title,
        existingArtist.phone,
        existingArtist.instagram_link,
        existingArtist.facebook_link,
        existingArtist.city,
        existingArtist.description,
        existingArtist.updatedAt,
        existingArtist.id,
      ]
    );

    return new TattooArtist({ ...result.rows[0], uid: firebaseUid });
  } catch (error) {
    console.error("Erreur updateTattooArtist :", error);
    throw error;
  }
};

// Supprime un tatoueur et son utilisateur lié via Firebase UID
const deleteTattooArtist = async (firebaseUid) => {
  try {
    // Supprime le tatoueur via jointure
    const deleteArtistQuery = `
      DELETE FROM tattoo_artists ta
      USING users u
      WHERE ta.user_id = u.id
      AND u.uid = $1
      RETURNING ta.*;
    `;
    const deleteArtistResult = await pool.query(deleteArtistQuery, [
      firebaseUid,
    ]);

    if (deleteArtistResult.rowCount === 0) {
      throw new Error("Profil tatoueur introuvable.");
    }

    // Supprime l'utilisateur correspondant
    const deleteUserQuery = `DELETE FROM users WHERE uid = $1 RETURNING *;`;
    const deleteUserResult = await pool.query(deleteUserQuery, [firebaseUid]);

    if (deleteUserResult.rowCount === 0) {
      throw new Error("Utilisateur non trouvé ou déjà supprimé.");
    }

    return { message: "Tatoueur et utilisateur supprimés avec succès." };
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
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
